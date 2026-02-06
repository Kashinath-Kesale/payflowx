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
    return this.prisma.settlement.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
