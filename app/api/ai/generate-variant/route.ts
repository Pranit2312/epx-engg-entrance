import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateVariant } from "@/lib/services/ai-service"
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
      return forbidden("AI variant generation requires a premium subscription")
    }

    const { data, error: bodyError } = await parseBody<{ questionId: string }>(request)
    if (bodyError) return bodyError
    const { questionId } = data!
    if (!questionId) {
      return error("VALIDATION_ERROR", "questionId is required")
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true, questionText: true, options: true, correctOption: true, subject: true, chapter: true, topic: true, difficulty: true },
    })

    if (!question) {
      return notFound("Question not found")
    }

    const result = await generateVariant({
      originalQuestion: question.questionText,
      originalOptions: question.options,
      correctOption: question.correctOption,
      subject: question.subject,
      chapter: question.chapter ?? "General",
      topic: question.topic ?? "General",
      difficulty: question.difficulty,
    })

    if (!result) {
      return error("SERVICE_UNAVAILABLE", "AI service unavailable", 503)
    }

    const variant = await prisma.aIVariant.create({
      data: {
        originalQuestionId: question.id,
        variantText: result.variantText,
        options: result.options,
        correctOption: result.correctOption,
        explanation: result.explanation,
        subject: question.subject,
        chapter: question.chapter,
        topic: question.topic,
        difficulty: question.difficulty,
        createdBy: session.user.id,
      },
    })

    return success({ variant })
  } catch (error: any) {
    console.error("AI variant generation error:", error)
    return serverError(error)
  }
}
