/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AppLogger } from '../../common/logger/app-logger';
import { AppMetrics } from '../../common/metrics/app-metrics';

@Injectable()
export class ReconciliationService {
  constructor(private readonly prisma: PrismaService) { }

  async runReconciliation() {
    const payments = await this.prisma.payment.findMany({
      where: { status: 'SUCCESS' },
      include: {
        settlement: true,
        merchant: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const results: {
      paymentId: string;
      merchantName: string;
      userEmail: string;
      amount: string;
      currency: string;
      date: Date;
      status: 'MATCHED' | 'MISMATCHED';
      reason?: string;
    }[] = [];


    for (const payment of payments) {
      const settlement = payment.settlement;
      const baseResult = {
        paymentId: payment.id,
        merchantName: payment.merchant.name,
        userEmail: payment.user.email,
        amount: payment.amount.toString(),
        currency: payment.currency,
        date: payment.createdAt,
      };

      if (!settlement) {
        if (payment.status === 'SUCCESS') {
          results.push({
            ...baseResult,
            status: 'MISMATCHED',
            reason: 'Settlement Pending',
          });
          continue;
        }

        AppLogger.warn('Reconciliation mismatch: missing settlement', {
          service: 'reconciliation',
          action: 'missing_settlement',
          entityId: payment.id,
          metadata: { errorType: 'BUSINESS_ERROR' },
        });

        AppMetrics.increment('reconciliation_mismatched_total');
        results.push({
          ...baseResult,
          status: 'MISMATCHED',
          reason: 'Missing settlement',
        });
        continue;
      }

      if (settlement.status !== 'SETTLED') {
        AppLogger.warn('Reconciliation mismatch: settlement not completed', {
          service: 'reconciliation',
          action: 'settlement_not_completed',
          entityId: settlement.id,
          metadata: { errorType: 'BUSINESS_ERROR' },
        });

        AppMetrics.increment('reconciliation_mismatched_total');
        results.push({
          ...baseResult,
          status: 'MISMATCHED',
          reason: 'Settlement not completed',
        });
        continue;
      }

      if (
        !settlement.amount.equals(payment.amount) ||
        settlement.currency !== payment.currency
      ) {
        AppLogger.error('Reconciliation mismatch: amount or currency mismatch', {
          service: 'reconciliation',
          action: 'amount_currency_mismatch',
          entityId: settlement.id,
          metadata: { errorType: 'SYSTEM_ERROR' },
        });

        AppMetrics.increment('reconciliation_mismatched_total');
        results.push({
          ...baseResult,
          status: 'MISMATCHED',
          reason: 'Amount or currency mismatch',
        });
        continue;
      }

      AppLogger.info('Reconciliation matched', {
        service: 'reconciliation',
        action: 'matched',
        entityId: settlement.id,
      });

      AppMetrics.increment('reconciliation_matched_total');
      results.push({
        ...baseResult,
        status: 'MATCHED',
      });
    }

    return results;
  }
}
