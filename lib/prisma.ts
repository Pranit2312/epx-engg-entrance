import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaPool?: Pool;
};

let dbAvailable = false;
let connectionChecked = false;

function getPool(): Pool {
  if (!globalForPrisma.prismaPool) {
    globalForPrisma.prismaPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
    });
  }
  return globalForPrisma.prismaPool;
}

function getPrismaClient(): PrismaClient {
  const pool = getPool();
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? getPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function testConnection(): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_DISABLE_DB === "true") {
    dbAvailable = false;
    connectionChecked = true;
    return false;
  }
  if (connectionChecked) return dbAvailable;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbAvailable = true;
  } catch {
    dbAvailable = false;
  }
  connectionChecked = true;
  return dbAvailable;
}

export function isDbAvailable(): boolean {
  return dbAvailable;
}
