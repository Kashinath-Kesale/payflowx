/* eslint-disable prettier/prettier */
import { Controller, Post } from '@nestjs/common';
import { SettlementsService } from './settlements.service';

@Controller('internal/settlements')
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Post('process')
  async process() {
    return this.settlementsService.processSettlements();
  }
}
