/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

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

      try {
    

        await this.prisma.settlement.update({
          where: { id: settlement.id },
          data: {
            status: 'SETTLED',
            attemptedAt: new Date(),
          },
        });
      } catch (error) {
        await this.prisma.settlement.update({
          where: { id: settlement.id },
          data: {
            status: 'FAILED',
            failureReason: error.message,
            attemptedAt: new Date(),
          },
        });
      }
    }

    return { processed: paymentsToSettle.length };
  }
}
