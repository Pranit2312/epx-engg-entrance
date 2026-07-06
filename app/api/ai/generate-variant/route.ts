import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateVariant } from "@/lib/ai/variant-generator"
import { requireAIAccess } from "@/lib/ai/access"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasAccess = await requireAIAccess(session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: "AI variant generation requires a premium subscription", premiumRequired: true }, { status: 403 })
    }

    const { questionId } = await request.json()
    if (!questionId) {
      return NextResponse.json({ error: "questionId is required" }, { status: 400 })
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true, questionText: true, options: true, correctOption: true, subject: true, chapter: true, topic: true, difficulty: true },
    })

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
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

    return NextResponse.json({ variant })
  } catch (error: any) {
    console.error("AI variant generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate variant", message: error?.message ?? "Unknown error" },
      { status: 500 }
    )
  }
}
