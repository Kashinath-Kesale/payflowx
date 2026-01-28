/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPayment(userId: string, dto: CreatePaymentDto) {
    
    // checking idempotency
    const existingPayment = await this.prisma.payment.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
    });

    if(existingPayment)return existingPayment;

    
    // validating merchant
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: dto.merchantId },
    });

    if(!merchant || !merchant.isActive) {
      throw new BadRequestException('Invalid or inactive merchant');
    }

    
    // payment transaction
    return this.prisma.$transaction(async (tx) => {
      // initiated
      const payment = await tx.payment.create({
        data: {
          userId,
          merchantId: dto.merchantId,
          amount: dto.amount,
          currency: dto.currency,
          idempotencyKey: dto.idempotencyKey,
          status: 'INITIATED',
        },
      });

      try {

        return await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'SUCCESS' },
        });
      } 
      catch (error) {
        // FAILED state
        return await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            failureReason: error.message,
          },
        });
      }
    });
  }
}
