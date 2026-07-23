import { PrismaClient } from '@prisma/client';
import { config } from './index';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple Prisma instances in development (hot reload)
export const prisma = global.__prisma ?? new PrismaClient({
  log: config.isDev ? ['query', 'warn', 'error'] : ['warn', 'error'],
  errorFormat: 'pretty',
});

if (config.isDev) global.__prisma = prisma;

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
// Trigger restart for direct connection URL
