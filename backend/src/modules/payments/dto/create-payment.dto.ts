/* eslint-disable prettier/prettier */
import {IsString, IsNotEmpty, IsNumber, IsPositive} from 'class-validator';


export class CreatePaymentDto {
    @IsString()
    @IsNotEmpty()
    merchantId: string;

    @IsNumber()
    @IsPositive()
    amount: number;

    @IsString()
    @IsNotEmpty()
    currency: string;

    @IsString()
    @IsNotEmpty()
    idempotencyKey: string;

}