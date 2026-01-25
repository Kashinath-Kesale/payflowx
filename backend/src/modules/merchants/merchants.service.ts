/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import {PrismaService} from '../../common/prisma/prisma.service';

@Injectable()
export class MerchantsService {
    constructor(private readonly prisma: PrismaService) {}

    async createMerchant(name: string) {
        return this.prisma.merchant.create({
            data: {name},
        });
    }

    async findMerchantById(id: string) {
        return this.prisma.merchant.findUnique({
            where: {id},
        });
    }

    async findAllMerchants() {
        return this.prisma.merchant.findMany();
    }
}
