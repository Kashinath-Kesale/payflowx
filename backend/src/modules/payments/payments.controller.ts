/* eslint-disable prettier/prettier */
import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';


@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new payment', description: 'Initiates a payment process with idempotency check and merchant validation.' })
    async createPayment(@CurrentUser() user: { userId: string }, @Body() dto: CreatePaymentDto) {
        return this.paymentsService.createPayment(user.userId, dto);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get payment statistics for the current user' })
    async getStats(@CurrentUser() user: { userId: string }) {
        return this.paymentsService.getStats(user.userId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all payments for the current user' })
    async getPayments(@CurrentUser() user: { userId: string }) {
        return this.paymentsService.getPayments(user.userId);
    }
}
