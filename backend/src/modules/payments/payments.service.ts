/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AppLogger } from '../../common/logger/app-logger';
import { AppMetrics } from '../../common/metrics/app-metrics';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) { }

  async createPayment(userId: string, dto: CreatePaymentDto) {
    const lockKey = `payment:lock:${dto.idempotencyKey}`;
    const resultKey = `payment:result:${dto.idempotencyKey}`;

    // 1. Try to fetch completed payment result from Redis (Fast Cache lookup)
    try {
      const cachedResult = await this.redis.get(resultKey);
      if (cachedResult) {
        AppLogger.info('Idempotent payment returned from Redis cache', {
          service: 'payments',
          action: 'idempotency_cache_hit',
          metadata: { idempotencyKey: dto.idempotencyKey },
        });
        AppMetrics.increment('payments_idempotent_hits_total');
        return JSON.parse(cachedResult);
      }
    } catch (error) {
      AppLogger.warn('Redis result cache lookup failed', {
        service: 'payments',
        action: 'result_cache_lookup_failed',
        metadata: { error: error.message },
      });
    }

    // 2. Try to acquire a Distributed Lock in Redis (30-second TTL)
    let hasLock = false;
    try {
      hasLock = await this.redis.setLock(lockKey, 30);
    } catch (error) {
      // SDE-1 Fail-safe: If Redis is down, we allow the request to proceed (falling back to DB checks)
      AppLogger.warn('Redis lock acquisition failed, proceeding with DB check fallback', {
        service: 'payments',
        action: 'redis_lock_failed',
        metadata: { error: error.message },
      });
      hasLock = true;
    }

    if (!hasLock) {
      AppLogger.warn('Concurrent payment request blocked by Redis lock', {
        service: 'payments',
        action: 'concurrent_request_blocked',
        metadata: { idempotencyKey: dto.idempotencyKey },
      });
      throw new ConflictException('Payment is already processing. Please wait.');
    }

    try {
      // 3. PostgreSQL Idempotency check (fallback/double-guard)
      const existingPayment = await this.prisma.payment.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });

      if (existingPayment) {
        AppLogger.info('Idempotent payment returned from DB', {
          service: 'payments',
          action: 'idempotency_hit',
          entityId: existingPayment.id,
        });

        AppMetrics.increment('payments_idempotent_hits_total');

        // Cache the result in Redis for future requests (24 hours)
        try {
          await this.redis.set(resultKey, JSON.stringify(existingPayment), 86400);
        } catch (error) {}

        return existingPayment;
      }

      // 4. Merchant validation
      const merchant = await this.prisma.merchant.findUnique({
        where: { id: dto.merchantId },
      });

      if (!merchant || !merchant.isActive) {
        AppLogger.warn('Invalid merchant attempted for payment', {
          service: 'payments',
          action: 'merchant_validation_failed',
          metadata: {
            merchantId: dto.merchantId,
            errorType: 'VALIDATION_ERROR',
          },
        });

        throw new BadRequestException('Invalid or inactive merchant');
      }

      // 5. Payment transaction
      const completedPayment = await this.prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            userId,
            merchantId: dto.merchantId,
            amount: dto.amount,
            currency: dto.currency,
            idempotencyKey: dto.idempotencyKey,
            status: 'INITIATED',
          },
        });

        try {
          const successPayment = await tx.payment.update({
            where: { id: payment.id },
            data: { status: 'SUCCESS' },
          });

          AppLogger.info('Payment completed successfully', {
            service: 'payments',
            action: 'payment_success',
            entityId: successPayment.id,
          });

          AppMetrics.increment('payments_success_total');
          return successPayment;
        } catch (error) {
          const failedPayment = await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: 'FAILED',
              failureReason: error.message,
            },
          });

          AppLogger.error('Payment failed during processing', {
            service: 'payments',
            action: 'payment_failed',
            entityId: failedPayment.id,
            metadata: {
              errorType: 'SYSTEM_ERROR',
              reason: error.message,
            },
          });

          AppMetrics.increment('payments_failed_total');
          return failedPayment;
        }
      });

      // 6. Cache the final payment result in Redis (24-hour TTL)
      try {
        await this.redis.set(resultKey, JSON.stringify(completedPayment), 86400);
      } catch (error) {
        AppLogger.warn('Failed to cache payment result in Redis', {
          service: 'payments',
          action: 'payment_result_cache_failed',
          entityId: completedPayment.id,
          metadata: { error: error.message },
        });
      }

      return completedPayment;
    } finally {
      // 7. Always release the lock at the end
      try {
        await this.redis.del(lockKey);
      } catch (error) {
        AppLogger.warn('Failed to release Redis payment lock', {
          service: 'payments',
          action: 'release_lock_failed',
          metadata: { error: error.message },
        });
      }
    }
  }

  async getPayments(userId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { userId },
      include: {
        merchant: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return payments;
  }

  async getStats(userId: string) {
    const cacheKey = `user:stats:${userId}`;

    // 1. Try to fetch from Redis cache (Fail-Safe)
    try {
      const cachedStats = await this.redis.get(cacheKey);
      if (cachedStats) {
        return JSON.parse(cachedStats);
      }
    } catch (error) {
      AppLogger.warn('Redis stats cache read failed', {
        service: 'payments',
        action: 'stats_cache_read_failed',
        entityId: userId,
        metadata: { error: error.message },
      });
    }

    // 2. Fetch from PostgreSQL on cache miss
    const payments = await this.prisma.payment.findMany({
      where: { userId },
    });

    const total = payments.length;
    const successfulPayments = payments.filter((p) => p.status === 'SUCCESS');
    const successfulCount = successfulPayments.length;
    const pendingCount = payments.filter((p) => p.status === 'INITIATED').length;
    const revenue = successfulPayments.reduce(
      (acc, curr) => acc + Number(curr.amount),
      0,
    );
    const successRate = total ? Math.round((successfulCount / total) * 100) : 0;

    const stats = {
      totalRevenue: revenue,
      transactionCount: total,
      successRate,
      pending: pendingCount,
    };

    // 3. Cache the stats in Redis with 60-second TTL
    try {
      await this.redis.set(cacheKey, JSON.stringify(stats), 60);
    } catch (error) {
      AppLogger.warn('Redis stats cache write failed', {
        service: 'payments',
        action: 'stats_cache_write_failed',
        entityId: userId,
        metadata: { error: error.message },
      });
    }

    return stats;
  }
}
