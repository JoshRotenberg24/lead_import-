import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function initPrisma() {
  // Use direct database connection with PostgreSQL adapter
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || initPrisma();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
