import { prisma } from "@/lib/prisma"

export const subscriptionRepo = {
  async get(userId: string) {
    try {
      return await prisma.user.findUnique({
        where: { id: userId },
        select: { isPremium: true, premiumPlan: true, premiumStartDate: true, premiumEndDate: true },
      })
    } catch {
      return null
    }
  },

  async activate(userId: string, plan: string, durationDays: number) {
    try {
      const now = new Date()
      const endDate = new Date(now.getTime() + durationDays * 86400000)
      return await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          premiumPlan: plan as any,
          premiumStartDate: now,
          premiumEndDate: endDate,
        },
      })
    } catch {
      return null
    }
  },

  async deactivate(userId: string) {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: { isPremium: false, premiumPlan: null, premiumStartDate: null, premiumEndDate: null },
      })
    } catch {
      return null
    }
  },
}
