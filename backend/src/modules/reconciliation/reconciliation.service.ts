/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReconciliationService {
  constructor(private readonly prisma: PrismaService) {}

  async runReconciliation() {
    const payments = await this.prisma.payment.findMany({
      where: { status: 'SUCCESS' },
      include: { settlement: true },
    });

    const results = [];

    for (const payment of payments) {
      const settlement = payment.settlement;

      if (!settlement) {
        results.push({
          paymentId: payment.id,
          status: 'MISMATCHED',
          reason: 'Missing settlement',
        });
        continue;
      }

      if (settlement.status !== 'SETTLED') {
        results.push({
          paymentId: payment.id,
          status: 'MISMATCHED',
          reason: 'Settlement not completed',
        });
        continue;
      }

      if (
        settlement.amount !== payment.amount ||
        settlement.currency !== payment.currency
      ) {
        results.push({
          paymentId: payment.id,
          status: 'MISMATCHED',
          reason: 'Amount or currency mismatch',
        });
        continue;
      }

      results.push({
        paymentId: payment.id,
        status: 'MATCHED',
      });
    }

    return results;
  }
}
