import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { analyzePerformance, generateWeakTopicAnalysis } from "@/lib/services/ai-service"
import { requireAIAccess } from "@/lib/ai/access"
import { success, error, unauthorized, forbidden, notFound, serverError, parseBody } from "@/lib/api-response"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorized()
    }

    const hasAccess = await requireAIAccess(session.user.id)
    if (!hasAccess) {
      return forbidden("AI features require a premium subscription")
    }

    const { data, error: bodyError } = await parseBody<{ attemptId: string }>(request)
    if (bodyError) return bodyError
    const { attemptId } = data!
    if (!attemptId) {
      return error("VALIDATION_ERROR", "attemptId is required")
    }

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        mockTest: true,
        answerRecords: {
          include: {
            question: {
              select: { id: true, subject: true, chapter: true, topic: true, difficulty: true },
            },
          },
        },
      },
    })

    if (!attempt) {
      return notFound("Attempt not found")
    }
    if (attempt.userId !== session.user.id) {
      return unauthorized()
    }

    const subjectMap = new Map<string, { correct: number; total: number }>()
    const chapterMap = new Map<string, { correct: number; total: number }>()
    const topicMap = new Map<string, { correct: number; total: number }>()

    const questionDetails = attempt.answerRecords.map((record) => {
      const subj = record.question.subject
      const chapter = record.question.chapter ?? "General"
      const topic = record.question.topic
      const isCorrect = record.isCorrect

      const subjKey = subj
      if (!subjectMap.has(subjKey)) subjectMap.set(subjKey, { correct: 0, total: 0 })
      const s = subjectMap.get(subjKey)!
      s.total++
      if (isCorrect) s.correct++

      const chapKey = `${subj}:${chapter}`
      if (!chapterMap.has(chapKey)) chapterMap.set(chapKey, { correct: 0, total: 0 })
      const c = chapterMap.get(chapKey)!
      c.total++
      if (isCorrect) c.correct++

      if (topic) {
        const topKey = `${subj}:${chapter}:${topic}`
        if (!topicMap.has(topKey)) topicMap.set(topKey, { correct: 0, total: 0 })
        const t = topicMap.get(topKey)!
        t.total++
        if (isCorrect) t.correct++
      }

      return {
        id: record.question.id,
        subject: subj,
        chapter,
        topic,
        isCorrect,
        timeSpent: record.timeSpent ?? 0,
        difficulty: record.question.difficulty,
      }
    })

    const subjectBreakdown = Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject,
      correct: data.correct,
      total: data.total,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    }))

    const performanceData = {
      totalScore: attempt.score,
      maxScore: attempt.maxScore,
      accuracy: attempt.accuracy,
      correct: attempt.correct,
      incorrect: attempt.incorrect,
      unattempted: attempt.unattempted,
      timeTaken: attempt.timeTaken,
      subjectBreakdown,
      questionDetails,
    }

    const [analysisResult, weakTopics] = await Promise.all([
      analyzePerformance(session.user.id, attemptId, performanceData),
      generateWeakTopicAnalysis(session.user.id, {
        subjectBreakdown,
        chapterAccuracy: Array.from(chapterMap.entries()).map(([key, data]) => {
          const [subject, chapter] = key.split(":")
          return { subject, chapter, correct: data.correct, total: data.total, accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0 }
        }),
        topicAccuracy: Array.from(topicMap.entries()).map(([key, data]) => {
          const [subject, chapter, topic] = key.split(":")
          return { subject, chapter, topic, correct: data.correct, total: data.total, accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0 }
        }),
        recentAttempts: 1,
      }),
    ])

    await prisma.aIAnalysis.create({
      data: {
        userId: session.user.id,
        attemptId,
        subjectAnalysis: subjectBreakdown as any,
        strengths: analysisResult.strengths,
        weakTopics: analysisResult.weakTopics,
        recommendations: analysisResult.recommendations,
        predictedScore: null,
      },
    })

    for (const wt of weakTopics) {
      await prisma.weakTopic.upsert({
        where: {
          userId_subject_chapter_topic: {
            userId: session.user.id,
            subject: wt.subject,
            chapter: wt.chapter,
            topic: wt.topic ?? "",
          },
        },
        update: {
          accuracy: wt.accuracy,
          attempts: wt.attempts,
        },
        create: {
          userId: session.user.id,
          subject: wt.subject,
          chapter: wt.chapter,
          topic: wt.topic,
          accuracy: wt.accuracy,
          attempts: wt.attempts,
        },
      })
    }

    return success({ analysis: analysisResult, weakTopics })
  } catch (error: any) {
    console.error("AI analyze error:", error)
    return serverError(error)
  }
}
