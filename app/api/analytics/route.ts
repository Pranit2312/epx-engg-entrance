import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { analyticsService } from "@/services/analytics-service"

export async function GET() {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const overview = await analyticsService.getOverview(session.user.id)
    return NextResponse.json(overview)
  } catch {
    return NextResponse.json({
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
