/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'user1@payflowx.com' },
    update: {},
    create: {
      email: 'user1@payflowx.com',
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
