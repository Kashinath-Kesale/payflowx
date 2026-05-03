/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthController } from './health.controller';
import { UsersModule } from './modules/users/users.module';
import { MerchantsModule } from './modules/merchants/merchants.module';
import { AuthModule } from './modules/auth/auth.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SettlementsService } from './modules/settlements/settlements.service';
import { SettlementsModule } from './modules/settlements/settlements.module';
import { ReconciliationService } from './modules/reconciliation/reconciliation.service';
import { ReconciliationController } from './modules/reconciliation/reconciliation.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    PrismaModule,
    UsersModule,
    MerchantsModule,
    AuthModule,
    PaymentsModule,
    SettlementsModule,
  ],
  controllers: [HealthController, ReconciliationController],
  providers: [
    SettlementsService, 
    ReconciliationService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
