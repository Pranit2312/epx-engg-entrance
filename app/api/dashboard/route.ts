import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { analyticsService } from "@/services/analytics-service"
import { getDashboardData } from "@/lib/data-service"

export async function GET() {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const [dash, overview] = await Promise.all([
      getDashboardData(session.user.id),
      analyticsService.getOverview(session.user.id),
    ])

    return NextResponse.json({
      ...dash,
      currentStreak: overview.currentStreak,
      recommendedTests: overview.recommendedTests,
    })
  } catch {
    return NextResponse.json({
      totalTests: 0,
      testsAttempted: 0,
      averageScore: 0,
      averageAccuracy: 0,
      currentStreak: 0,
      recentTests: [],
      recommendedTests: [],
    })
  }
}
