import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { submitAttempt } from "@/lib/data-service"
import { attemptRepo } from "@/repositories/attempt-repository"

async function triggerAIAnalysis(userId: string, attemptId: string) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/ai/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `next-auth.session-token=${process.env.NEXTAUTH_SECRET ?? ""}` },
      body: JSON.stringify({ attemptId }),
    })
  } catch {
    // AI analysis is non-blocking — failure should not affect test submission
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await request.json()
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

    return NextResponse.json({ attempt })
  } catch (error) {
    console.error("Attempts API error:", error)
    return NextResponse.json({ error: "Failed to submit attempt" }, { status: 500 })
  }
}
