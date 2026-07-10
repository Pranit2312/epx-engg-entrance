import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { analyticsService } from "@/services/analytics-service"
import { getDashboardData } from "@/lib/data-service"
import { prisma } from "@/lib/prisma"
import { success, unauthorized } from "@/lib/api-response"

export async function GET() {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return unauthorized()
  }

  try {
    const [dash, overview] = await Promise.all([
      getDashboardData(session.user.id),
      analyticsService.getOverview(session.user.id),
    ])

    const [aiRecommendations, weakTopics, latestAnalysis, studyPlans] = await Promise.all([
      prisma.aIRecommendation.findMany({
        where: { userId: session.user.id, isViewed: false },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: 5,
      }).catch(() => []),
      prisma.weakTopic.findMany({
        where: { userId: session.user.id },
        orderBy: { accuracy: "asc" },
        take: 5,
      }).catch(() => []),
      prisma.aIAnalysis.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      }).catch(() => null),
      prisma.studyPlan.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 1,
      }).catch(() => []),
    ])

    return success({
      ...dash,
      currentStreak: overview.currentStreak,
      recommendedTests: overview.recommendedTests,
      aiInsights: {
        recommendations: aiRecommendations.map((r) => ({
          id: r.id,
          type: r.type,
          content: r.content,
          reason: r.reason,
          priority: r.priority,
          createdAt: r.createdAt,
        })),
        weakTopics: weakTopics.map((w) => ({
          subject: w.subject,
          chapter: w.chapter,
          topic: w.topic,
          accuracy: w.accuracy,
          attempts: w.attempts,
        })),
        latestAnalysis: latestAnalysis
          ? {
              id: latestAnalysis.id,
              strengths: latestAnalysis.strengths,
              weakTopics: latestAnalysis.weakTopics,
              recommendations: latestAnalysis.recommendations,
              createdAt: latestAnalysis.createdAt,
            }
          : null,
        activeStudyPlan: studyPlans.length > 0
          ? {
              id: studyPlans[0].id,
              title: studyPlans[0].title,
              planData: studyPlans[0].planData,
              startDate: studyPlans[0].startDate,
              endDate: studyPlans[0].endDate,
            }
          : null,
      },
    })
  } catch {
    return success({
      totalTests: 0,
      testsAttempted: 0,
      averageScore: 0,
      averageAccuracy: 0,
      currentStreak: 0,
      recentTests: [],
      recommendedTests: [],
      aiInsights: null,
    })
  }
}
