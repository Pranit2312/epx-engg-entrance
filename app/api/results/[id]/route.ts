import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { attemptRepo } from "@/repositories/attempt-repository"
import { prisma } from "@/lib/prisma"
import { success, error, unauthorized, notFound, serverError } from "@/lib/api-response"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return unauthorized()
  }

  try {
    const { id } = await params
    const attempt = await attemptRepo.findById(id)
    if (!attempt) {
      return notFound("Attempt not found")
    }
    if (attempt.userId !== session.user.id) {
      return unauthorized()
    }

    const questionAnswers = await prisma.userMockTestQuestionAttemptAnswer.findMany({
      where: { attemptId: id },
      include: {
        question: {
          select: {
            id: true,
            questionText: true,
            options: true,
            correctOption: true,
            explanation: true,
            subject: true,
            chapter: true,
            topic: true,
            difficulty: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    const questions = questionAnswers.map((qa) => ({
      id: qa.question.id,
      questionText: qa.question.questionText,
      options: qa.question.options,
      correctOption: qa.question.correctOption,
      explanation: qa.question.explanation,
      subject: qa.question.subject,
      chapter: qa.question.chapter,
      topic: qa.question.topic,
      difficulty: qa.question.difficulty,
      selectedOption: qa.selectedOption,
      isCorrect: qa.isCorrect,
      timeSpent: qa.timeSpent,
      markedForReview: qa.markedForReview,
    }))

    const subjectBreakdown = calculateSubjectBreakdown(questionAnswers)

    return success({
      attempt: {
        id: attempt.id,
        score: attempt.score,
        correct: attempt.correct,
        incorrect: attempt.incorrect,
        accuracy: attempt.accuracy,
        timeTaken: attempt.timeTaken,
        totalQuestions: (attempt.correct ?? 0) + (attempt.incorrect ?? 0) + (attempt.unattempted ?? 0),
        testName: attempt.mockTest?.name ?? "Mock Test",
        subject: attempt.mockTest?.subject ?? "General",
        submittedAt: attempt.submittedAt,
        markedForReview: attempt.markedForReview,
      },
      questions,
      subjectBreakdown,
    })
  } catch (err) {
    console.error("Results API error:", err)
    return serverError()
  }
}

function calculateSubjectBreakdown(
  answers: Array<{
    isCorrect: boolean | null
    question: { subject: string | null }
  }>
) {
  const bySubject: Record<string, { correct: number; total: number }> = {}
  for (const a of answers) {
    const subj = a.question.subject ?? "Unknown"
    if (!bySubject[subj]) bySubject[subj] = { correct: 0, total: 0 }
    bySubject[subj].total++
    if (a.isCorrect) bySubject[subj].correct++
  }
  return Object.entries(bySubject).map(([subject, data]) => ({
    subject,
    correct: data.correct,
    total: data.total,
    accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
  }))
}


