import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { submitAttempt } from "@/lib/data-service"
import { attemptRepo } from "@/repositories/attempt-repository"
import { analyzePerformance } from "@/lib/services/ai-service"
import { success, error, unauthorized, serverError, parseBody } from "@/lib/api-response"

async function triggerAIAnalysis(userId: string, attemptId: string) {
  try {
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        mockTest: { select: { id: true, name: true, examType: true, totalQuestions: true } },
        answerRecords: {
          include: { question: { select: { subject: true, chapter: true, topic: true, difficulty: true } } },
        },
      },
    })
    if (!attempt) return

    const subjectBreakdown: Record<string, { correct: number; total: number }> = {}
    for (const rec of attempt.answerRecords) {
      if (!subjectBreakdown[rec.question.subject]) {
        subjectBreakdown[rec.question.subject] = { correct: 0, total: 0 }
      }
      if (rec.isCorrect === true) subjectBreakdown[rec.question.subject].correct++
      if (rec.isCorrect !== null) subjectBreakdown[rec.question.subject].total++
    }

    await analyzePerformance(userId, attemptId, {
      totalScore: attempt.score,
      maxScore: attempt.maxScore,
      accuracy: attempt.accuracy,
      correct: attempt.correct,
      incorrect: attempt.incorrect,
      unattempted: attempt.unattempted,
      timeTaken: attempt.timeTaken,
      subjectBreakdown: Object.entries(subjectBreakdown).map(([subject, stats]) => ({
        subject,
        correct: stats.correct,
        total: stats.total,
        accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      })),
      questionDetails: attempt.answerRecords.map((rec) => ({
        id: rec.questionId,
        subject: rec.question.subject,
        chapter: rec.question.chapter ?? "",
        topic: rec.question.topic,
        isCorrect: rec.isCorrect,
        timeSpent: rec.timeSpent ?? 0,
        difficulty: rec.question.difficulty,
      })),
    })
  } catch {
    // AI analysis is non-blocking
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorized()
    }

    const url = new URL(request.url)
    const testId = url.searchParams.get("testId")
    if (!testId) {
      return error("VALIDATION_ERROR", "testId is required")
    }

    const existing = await prisma.attempt.findFirst({
      where: { userId: session.user.id, mockTestId: testId },
      select: { id: true },
    })

    return success(existing ? [existing] : [])
  } catch (err) {
    console.error("Attempts GET error:", err)
    return serverError()
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorized()
    }

    const { data: payload, error: bodyError } = await parseBody<any>(request)
    if (bodyError) return bodyError
    const {
      mockTestId,
      score,
      correct,
      incorrect,
      accuracy,
      timeTaken,
      answers,
      markedForReview,
      startedAt,
      submittedAt,
      questionAnswers,
      totalQuestions: payloadTotalQuestions,
    } = payload

    const totalQuestions = payloadTotalQuestions ?? correct + incorrect

    const attempt = await submitAttempt({
      userId: session.user.id,
      mockTestId,
      score,
      correct,
      incorrect,
      totalQuestions,
      accuracy,
      timeTaken,
      answers: answers ?? {},
      markedForReview: markedForReview ?? [],
      status: "COMPLETED",
      startedAt: new Date(startedAt),
      submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
    })

    if (attempt && questionAnswers?.length > 0) {
      await attemptRepo.saveQuestionAnswers(
        questionAnswers.map((qa: any) => ({
          userId: session.user.id,
          attemptId: attempt.id,
          questionId: qa.questionId,
          selectedOption: qa.selectedOption,
          timeSpent: qa.timeSpent ?? 0,
          markedForReview: qa.markedForReview ?? false,
          isCorrect: qa.isCorrect,
        }))
      )
    }

    if (attempt) {
      triggerAIAnalysis(session.user.id, attempt.id)
    }

    return success({ attempt })
  } catch (err) {
    console.error("Attempts API error:", err)
    return serverError()
  }
}
