import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { AppLogger } from '../../common/logger/app-logger';

@Injectable()
export class MerchantsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
    ) {}

    async createMerchant(name: string) {
        return this.prisma.merchant.create({
            data: { name },
        });
    }

    async findMerchantById(id: string) {
        const cacheKey = `merchant:${id}`;

        try {
            const cachedMerchant = await this.redis.get(cacheKey);
            if (cachedMerchant) {
                return JSON.parse(cachedMerchant);
            }
        } catch (error) {
            AppLogger.warn('Redis merchant cache read failed', {
                service: 'merchants',
                action: 'merchant_cache_read_failed',
                entityId: id,
                metadata: { error: error.message },
            });
        }

        // 2. Fetch from PostgreSQL on cache miss
        const merchant = await this.prisma.merchant.findUnique({
            where: { id },
        });

        if (merchant) {
            try {
                await this.redis.set(cacheKey, JSON.stringify(merchant), 300);
            } catch (error) {
                AppLogger.warn('Redis merchant cache write failed', {
                    service: 'merchants',
                    action: 'merchant_cache_write_failed',
                    entityId: id,
                    metadata: { error: error.message },
                });
            }
        }

        return merchant;
    }

    async findAllMerchants() {
        return this.prisma.merchant.findMany();
    }
}
