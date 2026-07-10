import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateMentorResponse, MentorContext } from "@/lib/services/ai-service"
import { requireAIAccess } from "@/lib/ai/access"
import { getDemoAnalytics, seedDefaultWeakTopics } from "@/lib/services/analytics"
import { success, error, unauthorized, forbidden, serverError, parseBody } from "@/lib/api-response"

export async function POST(request: Request) {
  const requestId = crypto.randomUUID().slice(0, 8)
  console.log(`[AI:Mentor:${requestId}] POST /api/ai/mentor`)

  try {
    const session = await getServerSession(authOptions)
    console.log(`[AI:Mentor:${requestId}] Session:`, session ? `found (user=${session.user?.id}, role=${session.user?.role})` : "NOT FOUND")

    if (!session?.user?.id) {
      console.log(`[AI:Mentor:${requestId}] Auth FAILED — no session`)
      return unauthorized()
    }

    const hasAccess = await requireAIAccess(session.user.id)
    console.log(`[AI:Mentor:${requestId}] Access check: ${hasAccess}`)
    if (!hasAccess) {
      return forbidden("AI Mentor requires a premium subscription")
    }

    const { data: body, error: bodyError } = await parseBody<{ message: string }>(request)
    if (bodyError) return bodyError
    const { message } = body!
    console.log(`[AI:Mentor:${requestId}] Message received: "${message?.substring(0, 50)}..."`)

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      console.log(`[AI:Mentor:${requestId}] Validation FAILED — empty message`)
      return error("VALIDATION_ERROR", "Message is required")
    }

    console.log(`[AI:Mentor:${requestId}] Fetching comprehensive student data...`)

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { targetExam: true, preferredSubjects: true, name: true },
    })

    const targetExam = user?.targetExam ?? "JEE_MAIN"

    const attempts = await prisma.attempt.findMany({
      where: { userId: session.user.id, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        mockTest: { select: { name: true, examType: true } },
      },
    })

    const attemptIds = attempts.map(a => a.id)
    const recentScores = attempts.map(a => a.score)
    const averageScore = recentScores.length > 0
      ? Math.round(recentScores.reduce((s, a) => s + a, 0) / recentScores.length)
      : 0
    const percentiles = attempts.map(a => a.percentile).filter((p): p is number => p !== null)
    const latestPercentile = percentiles.length > 0 ? percentiles[0] : null
    const latestRank = attempts.find(a => a.rank !== null)?.rank ?? null

    let subjectAccuracy: MentorContext["subjectAccuracy"] = []
    let chapterAccuracy: MentorContext["chapterAccuracy"] = []
    let timeSpentPerSubject: MentorContext["timeSpentPerSubject"] = []

    if (attemptIds.length > 0) {
      const answerRecords = await prisma.userMockTestQuestionAttemptAnswer.findMany({
        where: { userId: session.user.id, attemptId: { in: attemptIds } },
        include: {
          question: { select: { subject: true, chapter: true, topic: true } },
        },
      })

      const subjectStats = new Map<string, { correct: number; total: number; timeSpent: number }>()
      const chapterStats = new Map<string, { correct: number; total: number }>()

      for (const rec of answerRecords) {
        const subj = rec.question.subject
        const subjCurr = subjectStats.get(subj) || { correct: 0, total: 0, timeSpent: 0 }
        if (rec.isCorrect === true) subjCurr.correct++
        if (rec.isCorrect !== null) subjCurr.total++
        subjCurr.timeSpent += rec.timeSpent || 0
        subjectStats.set(subj, subjCurr)

        const chapKey = `${rec.question.subject}|${rec.question.chapter || "unknown"}`
        const chapCurr = chapterStats.get(chapKey) || { correct: 0, total: 0 }
        if (rec.isCorrect === true) chapCurr.correct++
        if (rec.isCorrect !== null) chapCurr.total++
        chapterStats.set(chapKey, chapCurr)
      }

      subjectAccuracy = Array.from(subjectStats.entries()).map(([subject, stats]) => ({
        subject,
        accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
        correct: stats.correct,
        total: stats.total,
        timeSpent: stats.timeSpent,
      }))

      chapterAccuracy = Array.from(chapterStats.entries()).map(([key, stats]) => {
        const [subject, chapter] = key.split("|")
        return {
          subject,
          chapter,
          accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
          correct: stats.correct,
          total: stats.total,
        }
      })

      timeSpentPerSubject = Array.from(subjectStats.entries()).map(([subject, stats]) => ({
        subject,
        timeMinutes: Math.round(stats.timeSpent / 60),
      }))
    }

    let weakTopics = await prisma.weakTopic.findMany({
      where: { userId: session.user.id },
      orderBy: { accuracy: "asc" },
      take: 15,
    })

    // If user has no weak topics, seed demo data so the mentor is useful
    if (weakTopics.length === 0) {
      console.log(`[AI:Mentor:${requestId}] No weak topics found, seeding demo analytics for ${targetExam}`)
      await seedDefaultWeakTopics(session.user.id, targetExam)
      weakTopics = await prisma.weakTopic.findMany({
        where: { userId: session.user.id },
        orderBy: { accuracy: "asc" },
        take: 15,
      })
    }

    const hasRealData = attempts.length > 0

    // If no real attempts exist, use demo analytics as base context
    let demo: ReturnType<typeof getDemoAnalytics> | null = null
    if (!hasRealData) {
      demo = getDemoAnalytics(targetExam)
      if (subjectAccuracy.length === 0) subjectAccuracy = demo.subjectAccuracy
      if (chapterAccuracy.length === 0) chapterAccuracy = demo.chapterAccuracy
      if (timeSpentPerSubject.length === 0) timeSpentPerSubject = demo.timeSpentPerSubject
    }

    const strongChapters = chapterAccuracy
      .filter(c => c.accuracy >= 70)
      .map(c => `${c.subject} - ${c.chapter}`)
    const strongTopics = [
      ...(user?.preferredSubjects || []),
      ...strongChapters,
      ...(demo?.strongTopics ?? []),
    ]

    const isDemo = !hasRealData

    const chatHistory = await prisma.chatHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { role: true, content: true },
    })
    const historyContext = chatHistory
      .reverse()
      .map(h => `${h.role === "user" ? "Student" : "Mentor"}: ${h.content.substring(0, 200)}`)
      .join("\n")

    const mentorContext: MentorContext = {
      targetExam,
      name: user?.name ?? undefined,
      subjectAccuracy,
      chapterAccuracy,
      weakTopics: weakTopics.map(w => ({
        subject: w.subject,
        chapter: w.chapter,
        topic: w.topic,
        accuracy: w.accuracy,
        attempts: w.attempts,
      })),
      strongTopics,
      recentAttempts: hasRealData ? attempts.length : (demo?.recentAttempts ?? 0),
      averageScore: hasRealData ? averageScore : (demo?.averageScore ?? 0),
      recentScores: hasRealData ? recentScores : (demo?.recentScores ?? []),
      percentiles: hasRealData ? percentiles : (demo?.percentiles ?? []),
      timeSpentPerSubject,
      latestPercentile: hasRealData ? latestPercentile : (demo?.latestPercentile ?? null),
      latestRank: hasRealData ? latestRank : (demo?.latestRank ?? null),
      historyContext: isDemo
        ? `${historyContext}\nNote: This student has no test history yet. The analytics below are based on their initial assessment.`
        : historyContext,
    }

    console.log(`[AI:Mentor:${requestId}] Context built: exam=${targetExam}, subjects=${subjectAccuracy.length}, chapters=${chapterAccuracy.length}, weakTopics=${weakTopics.length}, attempts=${attempts.length}, demo=${isDemo}`)

    const reply = await generateMentorResponse(message, mentorContext)
    console.log(`[AI:Mentor:${requestId}] AI response: ${reply.substring(0, 80)}...`)

    // Validate user exists before saving chat history (prevents FK constraint crash)
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    })
    if (userExists) {
      try {
        await prisma.$transaction([
          prisma.chatHistory.create({
            data: { userId: session.user.id, role: "user", content: message, context: { ...mentorContext, isDemo } as any },
          }),
          prisma.chatHistory.create({
            data: { userId: session.user.id, role: "assistant", content: reply, context: { ...mentorContext, isDemo } as any },
          }),
        ])
      } catch (e: any) {
        console.warn(`[AI:Mentor:${requestId}] Failed to save chat history: ${e?.message ?? e}`)
      }
    } else {
      console.warn(`[AI:Mentor:${requestId}] User ${session.user.id} not found in DB, skipping chat history save`)
    }

    return success({ reply, isDemo })
  } catch (error: any) {
    console.error(`[AI:Mentor:${requestId}] ERROR:`, {
      message: error?.message ?? "Unknown error",
      stack: error?.stack?.split("\n").slice(0, 3).join("\n"),
      name: error?.name,
    })
    return serverError(error)
  }
}
