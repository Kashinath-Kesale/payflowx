/* eslint-disable prettier/prettier */
import { Controller, Get } from '@nestjs/common';
import { ReconciliationService } from './reconciliation.service';

@Controller('reconciliation')
export class ReconciliationController {
  constructor(private readonly service: ReconciliationService) { }

  @Get()
  async run() {
    return this.service.runReconciliation();
  }
}
