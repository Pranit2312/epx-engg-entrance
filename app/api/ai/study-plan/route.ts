import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateStudyPlan, calculatePlanDateRange } from "@/lib/ai/study-plan-generator"
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

    const result = await generateStudyPlan(session.user.id, {
      targetExam: user?.targetExam ?? "JEE_MAIN",
      weakTopics: weakTopics.map((w) => ({
        subject: w.subject,
        chapter: w.chapter,
        topic: w.topic,
        accuracy: w.accuracy,
      })),
      strongSubjects: Array.from(strongSubjectSet),
      availableHoursPerDay,
      durationDays,
    })

    const { startDate, endDate } = calculatePlanDateRange(durationDays)

    const plan = await prisma.studyPlan.create({
      data: {
        userId: session.user.id,
        title: result.title,
        description: result.description,
        planData: result as any,
        startDate,
        endDate,
        isAIGenerated: true,
      },
    })

    return NextResponse.json({ plan, result })
  } catch (error: any) {
    console.error("Study plan generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate study plan", message: error?.message ?? "Unknown error" },
      { status: 500 }
    )
  }
}
