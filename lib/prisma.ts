import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient | null
  prismaError?: Error
}

export function isPrismaAvailable() {
  if (globalForPrisma.prismaError) return false
  const hasUrl = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0 && process.env.DATABASE_URL.startsWith("postgres"))
  return hasUrl
}

export function getPrisma(): PrismaClient | null {
  // If we previously encountered an error, don't retry
  if (globalForPrisma.prismaError) return null

  // If DATABASE_URL is not available, don't try to create client
  if (!isPrismaAvailable()) return null

  // Try to get or create the cached client
  if (!globalForPrisma.prisma) {
    try {
      globalForPrisma.prisma = new PrismaClient()
    } catch (error) {
      globalForPrisma.prismaError = error as Error
      return null
    }
  }

  return globalForPrisma.prisma
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma()
    if (!client) {
      throw new Error("Prisma is not available: DATABASE_URL is not configured or is invalid. Using fallback in-memory storage.")
    }
    return Reflect.get(client, prop)
  },
})
