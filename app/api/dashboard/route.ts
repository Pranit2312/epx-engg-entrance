import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDashboardData } from "@/lib/data-service"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await getDashboardData(session.user.id)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Dashboard API error:", error)
    // Return a default empty dashboard structure on error
    return NextResponse.json({
      totalTests: 0,
      testsAttempted: 0,
      averageScore: 0,
      averageAccuracy: 0,
      recentTests: [],
      recommendedTests: [],
    })
  }
}
