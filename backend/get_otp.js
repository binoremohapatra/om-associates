const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tokens = await prisma.emailVerificationToken.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1
  });
  console.log(tokens);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
