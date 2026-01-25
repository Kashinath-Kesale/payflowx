/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthController } from './health.controller';
import { UsersModule } from './modules/users/users.module';
import { MerchantsModule } from './modules/merchants/merchants.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    MerchantsModule,
    AuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
