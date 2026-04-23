/* eslint-disable prettier/prettier */
import {IsString, IsNotEmpty, IsNumber, IsPositive} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class CreatePaymentDto {
    @ApiProperty({ description: 'The unique ID of the merchant receiving the payment', example: 'merchant_12345' })
    @IsString()
    @IsNotEmpty()
    merchantId: string;

    @ApiProperty({ description: 'Payment amount', example: 100.00 })
    @IsNumber()
    @IsPositive()
    amount: number;

    @ApiProperty({ description: 'Currency code (e.g. INR, USD)', example: 'INR' })
    @IsString()
    @IsNotEmpty()
    currency: string;

    @ApiProperty({ description: 'Client-generated unique key to prevent duplicate payments', example: 'pay_uuid_987654321' })
    @IsString()
    @IsNotEmpty()
    idempotencyKey: string;

}