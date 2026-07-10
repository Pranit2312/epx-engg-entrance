import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateRecommendations, analyzeWeakTopics } from "@/lib/services/ai-service"
import { requireAIAccess } from "@/lib/ai/access"
import { success, error, unauthorized, forbidden, serverError } from "@/lib/api-response"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorized()
    }

    const hasAccess = await requireAIAccess(session.user.id)
    if (!hasAccess) {
      return forbidden("AI features require a premium subscription")
    }

    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get("refresh") === "true"

    if (!forceRefresh) {
      const existing = await prisma.aIRecommendation.findMany({
        where: { userId: session.user.id, isViewed: false },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: 10,
      })
      if (existing.length > 0) {
        return success({ recommendations: existing, source: "database" })
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { targetExam: true, preferredSubjects: true },
    })

    const weakTopics = await prisma.weakTopic.findMany({
      where: { userId: session.user.id },
      orderBy: { accuracy: "asc" },
      take: 15,
    })

    const attempts = await prisma.attempt.findMany({
      where: { userId: session.user.id, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { mockTest: { select: { id: true, name: true, subject: true } } },
    })

    const recentScores = attempts.map((a) => a.score)
    const testHistory = attempts.map((a) => ({
      testId: a.mockTestId,
      testName: a.mockTest?.name ?? "Unknown",
      score: a.score,
      subject: a.mockTest?.subject ?? "General",
    }))

    const weakTopicNames = weakTopics.map((w) => `${w.subject} - ${w.chapter}${w.topic ? ` - ${w.topic}` : ''}`)

    const strongSubjects = new Set<string>()
    for (const a of attempts) {
      if (a.score >= 70 && a.mockTest?.subject) {
        strongSubjects.add(a.mockTest.subject)
      }
    }

    const aiRecommendation = await generateRecommendations(
      weakTopicNames,
      Array.from(strongSubjects),
      recentScores,
      user?.targetExam ?? "JEE_MAIN"
    )

    const rec = await prisma.aIRecommendation.create({
      data: {
        userId: session.user.id,
        type: "STUDY_PLAN",
        content: { recommendation: aiRecommendation } as any,
        reason: "AI-generated study recommendations",
        priority: 3,
      },
    })

    return success({ recommendations: [rec], aiRecommendation, source: "ai_generated" })
  } catch (error: any) {
    console.error("AI recommendations error:", error)
    return serverError(error)
  }
}
