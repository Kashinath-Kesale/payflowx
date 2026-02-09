/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'user1@payflowx.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'user1@payflowx.com',
      password: hashedPassword,
      name: 'PayFlowX User',
    },
  });

  const merchant = await prisma.merchant.upsert({
    where: { name: 'Amazon' },
    update: {},
    create: {
      name: 'Amazon',
    },
  });

  await prisma.merchant.upsert({
    where: { name: 'Walmart' },
    update: {},
    create: { name: 'Walmart' },
  });

  await prisma.merchant.upsert({
    where: { name: 'Spotify' },
    update: {},
    create: { name: 'Spotify' },
  });

  // Create success payments
  await prisma.payment.upsert({
    where: { idempotencyKey: 'idemp-1' },
    update: {},
    create: {
      amount: 100.0,
      currency: 'USD',
      status: 'SUCCESS',
      merchantId: merchant.id,
      userId: user.id,
      idempotencyKey: 'idemp-1',
    },
  });

  await prisma.payment.upsert({
    where: { idempotencyKey: 'idemp-2' },
    update: {},
    create: {
      amount: 50.0,
      currency: 'USD',
      status: 'SUCCESS',
      merchantId: merchant.id,
      userId: user.id,
      idempotencyKey: 'idemp-2',
    },
  });

  // Create failed payment
  await prisma.payment.upsert({
    where: { idempotencyKey: 'idemp-3' },
    update: {},
    create: {
      amount: 200.0,
      currency: 'USD',
      status: 'FAILED',
      merchantId: merchant.id,
      userId: user.id,
      idempotencyKey: 'idemp-3',
      failureReason: 'Insufficient funds',
    },
  });

  // Create initiated payment (pending equivalent)
  await prisma.payment.upsert({
    where: { idempotencyKey: 'idemp-4' },
    update: {},
    create: {
      amount: 75.0,
      currency: 'USD',
      status: 'INITIATED',
      merchantId: merchant.id,
      userId: user.id,
      idempotencyKey: 'idemp-4',
    },
  });

  // Create settlements for success payments
  const payment1 = await prisma.payment.findUnique({ where: { idempotencyKey: 'idemp-1' } });
  if (payment1) {
    await prisma.settlement.upsert({
      where: { paymentId: payment1.id },
      update: {},
      create: {
        paymentId: payment1.id,
        amount: payment1.amount,
        currency: payment1.currency,
        status: 'SETTLED',
      },
    });
  }

  console.log('Seeded data:', { user, merchant });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
