export const PREMIUM_PLANS = {
  FREE: {
    id: "free",
    label: "Free",
    price: 0,
    features: {
      maxMockTests: 5,
      maxBookmarks: 10,
      basicAnalytics: true,
      advancedAnalytics: false,
      aiRecommendations: false,
      subjectInsights: false,
      performancePredictions: false,
      prioritySupport: false,
      detailedReports: false,
      streakRewards: false,
      personalizedDashboard: false,
      unlimitedTests: false,
      unlimitedBookmarks: false,
    },
  },
  MONTHLY: {
    id: "monthly",
    label: "Monthly",
    price: 499,
    currency: "INR",
    interval: "month",
    features: {
      unlimitedTests: true,
      unlimitedBookmarks: true,
      advancedAnalytics: true,
      aiRecommendations: true,
      subjectInsights: true,
      performancePredictions: true,
      prioritySupport: true,
      detailedReports: true,
      streakRewards: true,
      personalizedDashboard: true,
    },
  },
  YEARLY: {
    id: "yearly",
    label: "Yearly",
    price: 3999,
    currency: "INR",
    interval: "year",
    popular: true,
    discount: "33% off",
    features: {
      unlimitedTests: true,
      unlimitedBookmarks: true,
      advancedAnalytics: true,
      aiRecommendations: true,
      subjectInsights: true,
      performancePredictions: true,
      prioritySupport: true,
      detailedReports: true,
      streakRewards: true,
      personalizedDashboard: true,
    },
  },
} as const

export type PlanId = keyof typeof PREMIUM_PLANS
export type PremiumFeatures = (typeof PREMIUM_PLANS)[PlanId]["features"]

export const PREMIUM_FEATURE_LIST = [
  { id: "unlimitedTests", label: "Unlimited Mock Tests" },
  { id: "unlimitedBookmarks", label: "Unlimited Bookmarks" },
  { id: "advancedAnalytics", label: "Advanced Analytics" },
  { id: "aiRecommendations", label: "AI Study Recommendations" },
  { id: "subjectInsights", label: "Subject-wise Insights" },
  { id: "performancePredictions", label: "Performance Predictions" },
  { id: "detailedReports", label: "Detailed Progress Reports" },
  { id: "prioritySupport", label: "Priority Support" },
  { id: "streakRewards", label: "Study Streak Rewards" },
  { id: "personalizedDashboard", label: "Personalized Dashboard" },
] as const

export function getPlan(id: string) {
  return PREMIUM_PLANS[id as PlanId] || PREMIUM_PLANS.FREE
}

export function hasPremiumAccess(user: { isPremium?: boolean; premiumEndDate?: Date | null } | null): boolean {
  if (!user) return false
  if (!user.isPremium) return false
  if (user.premiumEndDate && new Date(user.premiumEndDate) < new Date()) return false
  return true
}

export function canAccessFeature(
  user: { isPremium?: boolean; premiumEndDate?: Date | null } | null,
  feature: keyof PremiumFeatures
): boolean {
  if (hasPremiumAccess(user)) return true
  const freeFeatures: Record<string, any> = PREMIUM_PLANS.FREE.features
  return freeFeatures[feature] === true
}
