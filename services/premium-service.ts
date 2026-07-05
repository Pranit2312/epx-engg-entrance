import { subscriptionRepo } from "@/repositories/subscription-repo"
import { paymentService } from "./payment-service"
import { PREMIUM_PLANS, getPlan, canAccessFeature, type PlanId, type PremiumFeatures } from "@/config/premium"

export const premiumService = {
  async getStatus(userId: string) {
    return subscriptionRepo.get(userId)
  },

  async upgrade(userId: string, planId: string) {
    const plan = getPlan(planId)
    if (!plan || plan.id === "free") {
      return { success: false, error: "Invalid plan" }
    }

    const payment = await paymentService.createOrder({ userId, planId })
    if (!payment.success) {
      return { success: false, error: "Payment failed" }
    }

    const durationDays = plan.interval === "year" ? 365 : 30
    const result = await subscriptionRepo.activate(userId, planId, durationDays)
    if (!result) {
      return { success: false, error: "Failed to activate subscription" }
    }

    return { success: true, plan: planId, validUntil: result.premiumEndDate }
  },

  async downgrade(userId: string) {
    await subscriptionRepo.deactivate(userId)
    return { success: true }
  },

  async startFreeTrial(userId: string) {
    const result = await subscriptionRepo.activate(userId, "monthly", 7)
    if (!result) {
      return { success: false, error: "Failed to start trial" }
    }
    return { success: true, plan: "trial", validUntil: result.premiumEndDate }
  },

  canAccess(user: { isPremium?: boolean; premiumEndDate?: Date | null } | null, feature: keyof PremiumFeatures) {
    return canAccessFeature(user, feature)
  },

  getLimits(user: { isPremium?: boolean; premiumEndDate?: Date | null } | null) {
    const plan = PREMIUM_PLANS.FREE
    if (user?.isPremium && (!user.premiumEndDate || new Date(user.premiumEndDate) > new Date())) {
      return { maxMockTests: Infinity, maxBookmarks: Infinity }
    }
    return { maxMockTests: plan.features.maxMockTests, maxBookmarks: plan.features.maxBookmarks }
  },
}
