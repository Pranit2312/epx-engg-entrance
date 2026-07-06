import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireAIAccess } from "@/lib/ai/access"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasAccess = await requireAIAccess(session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: "AI weak topic analysis requires a premium subscription", premiumRequired: true }, { status: 403 })
    }

    const weakTopics = await prisma.weakTopic.findMany({
      where: { userId: session.user.id },
      orderBy: [{ accuracy: "asc" }, { attempts: "desc" }],
    })

    const analyses = await prisma.aIAnalysis.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    })

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
