/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { SettlementsController } from './settlements.controller';

@Module({
  providers: [SettlementsService],
  exports: [SettlementsService],
    controllers: [SettlementsController],

})
export class SettlementsModule {}
