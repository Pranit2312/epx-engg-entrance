import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export type TransactionClient = Omit<
  Prisma.TransactionClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

export async function transaction<T>(fn: (tx: TransactionClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(fn)
}

export async function userExists(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
  return user !== null
}

export function safeUnique<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch((err) => {
    if (err?.code === "P2002") return fallback
    throw err
  })
}

export function safeCreate<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch(() => fallback)
}
