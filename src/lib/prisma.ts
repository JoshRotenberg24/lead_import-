import { PrismaClient as BasePrismaClient } from '../generated/prisma/client';

declare global {
  var prisma: any;
}

let prisma: any;

try {
  if (process.env.NODE_ENV === 'production') {
    prisma = new (BasePrismaClient as any)({
      log: ['error'],
    });
  } else {
    if (!global.prisma) {
      global.prisma = new (BasePrismaClient as any)({
        log: ['error'],
      });
    }
    prisma = global.prisma;
  }
} catch (error) {
  console.error('Failed to initialize Prisma:', error);
  // Fallback for build-time execution
  prisma = null;
}

export { prisma };
