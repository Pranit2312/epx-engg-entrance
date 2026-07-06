import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateRecommendations } from "@/lib/ai/recommendation-engine"
import { requireAIAccess } from "@/lib/ai/access"
import type { WeakTopicResult } from "@/lib/ai/types"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasAccess = await requireAIAccess(session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: "AI features require a premium subscription", premiumRequired: true }, { status: 403 })
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
        return NextResponse.json({ recommendations: existing, source: "database" })
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

    const weakTopicResults: WeakTopicResult[] = weakTopics.map((w) => ({
      subject: w.subject,
      chapter: w.chapter,
      topic: w.topic,
      accuracy: w.accuracy,
      attempts: w.attempts,
      severity: w.accuracy < 40 ? "high" : w.accuracy < 50 ? "medium" : "low",
    }))

    const strongSubjects = new Set<string>()
    for (const a of attempts) {
      if (a.score >= 70 && a.mockTest?.subject) {
        strongSubjects.add(a.mockTest.subject)
      }
    }

    const aiResult = await generateRecommendations(session.user.id, {
      weakTopics: weakTopicResults,
      strongSubjects: Array.from(strongSubjects),
      recentScores,
      targetExam: user?.targetExam ?? "JEE_MAIN",
      availableStudyHours: 4,
      testHistory,
    })

    const recTypes: Array<"TEST" | "CHAPTER" | "STUDY_PLAN"> = ["TEST", "CHAPTER", "STUDY_PLAN"]
    const recommendations = []

    for (const topic of aiResult.recommendedTopics.slice(0, 5)) {
      const rec = await prisma.aIRecommendation.create({
        data: {
          userId: session.user.id,
          type: "CHAPTER",
          content: { topic: topic.topic, priority: topic.priority, reason: topic.reason } as any,
          reason: topic.reason,
          priority: topic.priority === "high" ? 3 : topic.priority === "medium" ? 2 : 1,
        },
      })
      recommendations.push(rec)
    }

    for (const test of aiResult.recommendedTests.slice(0, 3)) {
      const rec = await prisma.aIRecommendation.create({
        data: {
          userId: session.user.id,
          type: "TEST",
          content: { testName: test.testName, reason: test.reason } as any,
          reason: test.reason,
          priority: 2,
        },
      })
      recommendations.push(rec)
    }

    return NextResponse.json({
      recommendations,
      aiResult,
      source: "ai_generated",
    })
  } catch (error: any) {
    console.error("AI recommendations error:", error)
    return NextResponse.json(
      { error: "Failed to generate recommendations", message: error?.message ?? "Unknown error" },
      { status: 500 }
    )
  }
}
