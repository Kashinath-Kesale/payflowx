/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AppLogger } from '../../common/logger/app-logger';
import { AppMetrics } from '../../common/metrics/app-metrics';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) { }

  async createPayment(userId: string, dto: CreatePaymentDto) {
    // 1. Idempotency check
    const existingPayment = await this.prisma.payment.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
    });

    if (existingPayment) {
      AppLogger.info('Idempotent payment returned', {
        service: 'payments',
        action: 'idempotency_hit',
        entityId: existingPayment.id,
      });

      AppMetrics.increment('payments_idempotent_hits_total');
      return existingPayment;
    }

    // 2. Merchant validation
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

    // 3. Payment transaction
    return this.prisma.$transaction(async (tx) => {
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
        const completedPayment = await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'SUCCESS' },
        });

        AppLogger.info('Payment completed successfully', {
          service: 'payments',
          action: 'payment_success',
          entityId: completedPayment.id,
        });

        AppMetrics.increment('payments_success_total');
        return completedPayment;
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
  }
  async getPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      include: {
        merchant: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
