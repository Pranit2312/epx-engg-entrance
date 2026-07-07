import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireAIAccess } from "@/lib/ai/access"
import { analyzeWeakTopics } from "@/lib/services/ai-service"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasAccess = await requireAIAccess(session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: "AI weak topic analysis requires a premium subscription", premiumRequired: true }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get("refresh") === "true"

    const weakTopics = await prisma.weakTopic.findMany({
      where: { userId: session.user.id },
      orderBy: [{ accuracy: "asc" }, { attempts: "desc" }],
    })

    const analyses = await prisma.aIAnalysis.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    // Use AI to analyze weak topics if requested or no recent analysis exists
    let aiAnalyzedTopics: string[] = []
    if (forceRefresh || analyses.length === 0) {
      const subjectPerformance = await prisma.topicAnalytics.groupBy({
        by: ['subject'],
        where: { userId: session.user.id },
        _avg: { accuracy: true },
        _count: { id: true }
      })

      const performanceData = subjectPerformance.map(sp => ({
        subject: sp.subject,
        accuracy: Math.round(sp._avg.accuracy || 0),
        attempts: sp._count.id
      }))

      if (performanceData.length > 0) {
        aiAnalyzedTopics = await analyzeWeakTopics(performanceData)
      }
    }

    const aggregatedWeakTopics = weakTopics.map((w) => ({
      subject: w.subject,
      chapter: w.chapter,
      topic: w.topic,
      accuracy: w.accuracy,
      attempts: w.attempts,
      severity: w.accuracy < 40 ? "high" : w.accuracy < 50 ? "medium" : "low",
    }))

    return NextResponse.json({
      weakTopics: aggregatedWeakTopics,
      aiAnalyzedTopics,
      recentAnalyses: analyses.map((a) => ({
        id: a.id,
        strengths: a.strengths,
        weakTopics: a.weakTopics,
        recommendations: a.recommendations,
        createdAt: a.createdAt,
      })),
    })
  } catch (error: any) {
    console.error("Weak topics fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch weak topics", message: error?.message ?? "Unknown error" },
      { status: 500 }
    )
  }
}
