import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateStudyPlan as generateAIStudyPlan } from "@/lib/services/ai-service"
import { requireAIAccess } from "@/lib/ai/access"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasAccess = await requireAIAccess(session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: "AI study plans require a premium subscription", premiumRequired: true }, { status: 403 })
    }

    const plans = await prisma.studyPlan.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    return NextResponse.json({ plans })
  } catch (error: any) {
    console.error("Study plan fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch study plans", message: error?.message ?? "Unknown error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasAccess = await requireAIAccess(session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: "AI study plans require a premium subscription", premiumRequired: true }, { status: 403 })
    }

    const { durationDays: rawDuration, availableHoursPerDay: rawHours } = await request.json()
    const durationDays = (rawDuration ?? 7) as 7 | 15 | 30
    const availableHoursPerDay = rawHours ?? 4

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { targetExam: true, preferredSubjects: true },
    })

    const weakTopics = await prisma.weakTopic.findMany({
      where: { userId: session.user.id },
      orderBy: { accuracy: "asc" },
      take: 20,
    })

    const attempts = await prisma.attempt.findMany({
      where: { userId: session.user.id, status: "COMPLETED" },
      include: { mockTest: { select: { subject: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    const strongSubjectSet = new Set<string>()
    const subjectScores = new Map<string, number[]>()
    for (const a of attempts) {
      const subj = a.mockTest?.subject ?? "General"
      if (!subjectScores.has(subj)) subjectScores.set(subj, [])
      subjectScores.get(subj)!.push(a.score)
      if (a.score >= 70) strongSubjectSet.add(subj)
    }

    const weakTopicNames = weakTopics.map((w) => `${w.subject} - ${w.chapter}${w.topic ? ` - ${w.topic}` : ''}`)
    const recentScores = attempts.map((a) => a.score)
    const targetScore = Math.max(...recentScores, 80)

    const aiPlan = await generateAIStudyPlan(
      weakTopicNames,
      user?.targetExam ?? "JEE_MAIN",
      targetScore,
      durationDays
    )

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + durationDays)

    const plan = await prisma.studyPlan.create({
      data: {
        userId: session.user.id,
        title: `${durationDays}-Day Study Plan for ${user?.targetExam ?? 'JEE_MAIN'}`,
        description: `AI-generated study plan targeting ${targetScore}% score`,
        planData: { plan: aiPlan, weakTopics: weakTopicNames, targetScore } as any,
        startDate,
        endDate,
        isAIGenerated: true,
      },
    })

    return NextResponse.json({ plan, aiPlan })
  } catch (error: any) {
    console.error("Study plan generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate study plan", message: error?.message ?? "Unknown error" },
      { status: 500 }
    )
  }
}
