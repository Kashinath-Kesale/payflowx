/* eslint-disable prettier/prettier */
import { Controller,Get, Post, Body, Param } from '@nestjs/common';
import { MerchantsService } from './merchants.service';

@Controller('merchants')
export class MerchantsController {
    constructor(private readonly merchantsService: MerchantsService) {}

    @Post()
    async createMerchant(@Body('name') name: string) {
        return this.merchantsService.createMerchant(name);
    }
    

    @Get(':id')
    async getMerchant(@Param('id') id: string) {
        return this.merchantsService.findMerchantById(id);
    }


    @Get()
    async getAllMerchants() {
        return this.merchantsService.findAllMerchants();
    }
}
