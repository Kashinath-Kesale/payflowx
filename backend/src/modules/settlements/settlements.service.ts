/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AppLogger } from '../../common/logger/app-logger';
import { AppMetrics } from '../../common/metrics/app-metrics';

@Injectable()
export class SettlementsService {
  constructor(private readonly prisma: PrismaService) {}

  async processSettlements() {
    const paymentsToSettle = await this.prisma.payment.findMany({
      where: {
        status: 'SUCCESS',
        settlement: null,
      },
    });

    for (const payment of paymentsToSettle) {
      const settlement = await this.prisma.settlement.create({
        data: {
          paymentId: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: 'PENDING',
        },
      });

      AppLogger.info('Settlement attempt started', {
        service: 'settlements',
        action: 'settlement_attempt',
        entityId: settlement.id,
      });

      try {
        await this.prisma.settlement.update({
          where: { id: settlement.id },
          data: {
            status: 'SETTLED',
            attemptedAt: new Date(),
          },
        });

        AppLogger.info('Settlement completed successfully', {
          service: 'settlements',
          action: 'settlement_success',
          entityId: settlement.id,
        });

        AppMetrics.increment('settlements_settled_total');
      } catch (error) {
        await this.prisma.settlement.update({
          where: { id: settlement.id },
          data: {
            status: 'FAILED',
            failureReason: error.message,
            attemptedAt: new Date(),
          },
        });

        AppLogger.error('Settlement failed', {
          service: 'settlements',
          action: 'settlement_failed',
          entityId: settlement.id,
          metadata: {
            errorType: 'SYSTEM_ERROR',
            reason: error.message,
          },
        });

        AppMetrics.increment('settlements_failed_total');
      }
    }

    return { processed: paymentsToSettle.length };
  }
}
