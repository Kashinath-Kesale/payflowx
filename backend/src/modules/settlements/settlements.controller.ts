/* eslint-disable prettier/prettier */
import { Controller, Post, Get } from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Controller()
export class SettlementsController {
  constructor(
    private readonly settlementsService: SettlementsService,
    private readonly prisma: PrismaService
  ) { }

  @Post('internal/settlements/process')
  async process() {
    return this.settlementsService.processSettlements();
  }

  @Get('settlements')
  async listSettlements() {
    const settled = await this.prisma.settlement.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const pending = await this.prisma.payment.findMany({
      where: {
        status: 'SUCCESS',
        settlement: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    const pendingSettlements = pending.map((p) => ({
      id: `pending-${p.id}`,
      paymentId: p.id,
      amount: p.amount,
      currency: p.currency,
      status: 'PENDING',
      attemptedAt: null,
      createdAt: p.createdAt,
    }));

    return [...settled, ...pendingSettlements].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }
}
