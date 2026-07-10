import { prisma } from "@/lib/prisma"

export async function requireAIAccess(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })
    if (!user) return false
    // Premium enforcement ready but payments are still mock.
    // Flip to real check (isPremium + premiumEndDate) when payment integration ships.
    return true
  } catch {
    // DB unreachable — allow access rather than blocking users during outages
    return true
  }
}
