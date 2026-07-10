import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { analyticsService } from "@/services/analytics-service"
import { success, unauthorized, serverError } from "@/lib/api-response"

export async function GET() {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return unauthorized()
  }
  try {
    const overview = await analyticsService.getOverview(session.user.id)
    return success(overview)
  } catch {
    return success({
      totalAttempts: 0,
      averageScore: 0,
      averageAccuracy: 0,
      bestScore: 0,
      bestTestName: null,
      totalTimeSpent: 0,
      subjectPerformance: [],
      scoreHistory: [],
      weakTopics: [],
      strongTopics: [],
    })
  }
}
