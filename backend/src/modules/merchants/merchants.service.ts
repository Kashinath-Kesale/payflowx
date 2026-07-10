import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

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

        // 1. Try to fetch from Redis cache (Fail-Safe Caching)
        try {
            const cachedMerchant = await this.redis.get(cacheKey);
            if (cachedMerchant) {
                return JSON.parse(cachedMerchant);
            }
        } catch (error) {
            // SDE-1 Interview Tip: If Redis is down, we do NOT crash the payment flow.
            // We log it and let it fall back to PostgreSQL (fail-safe/graceful degradation).
        }

        // 2. Fetch from PostgreSQL on cache miss
        const merchant = await this.prisma.merchant.findUnique({
            where: { id },
        });

        // 3. Cache the result in Redis with 5-minute TTL (300 seconds)
        if (merchant) {
            try {
                await this.redis.set(cacheKey, JSON.stringify(merchant), 300);
            } catch (error) {
                // Fail-safe write
            }
        }

        return merchant;
    }

    async findAllMerchants() {
        return this.prisma.merchant.findMany();
    }
}
