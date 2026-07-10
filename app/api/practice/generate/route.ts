import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { success, error, unauthorized, serverError, parseBody } from "@/lib/api-response"

const PRACTICE_TYPES = {
  "daily-revision": { difficulty: "EASY", count: 10, duration: 15, name: "Daily Revision" },
  "weak-areas": { difficulty: "MEDIUM", count: 20, duration: 30, name: "Weak Areas Focus" },
  challenge: { difficulty: "HARD", count: 30, duration: 45, name: "Challenge Mode" },
} as const

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return unauthorized()

    const { data: body, error: bodyError } = await parseBody<{
      subject?: string
      chapter?: string
      topic?: string
      type?: string
      difficulty?: string
      count?: number
    }>(request)
    if (bodyError) return bodyError
    if (!body) return error("VALIDATION_ERROR", "Request body is required")

    const practiceType = body.type ? PRACTICE_TYPES[body.type as keyof typeof PRACTICE_TYPES] : null

    const difficulty = body.difficulty || practiceType?.difficulty || "MEDIUM"
    const count = body.count || practiceType?.count || 10
    const duration = practiceType?.duration || 15

    const where: any = {}
    if (body.subject) where.subject = body.subject
    if (body.chapter) where.chapter = body.chapter
    if (body.topic) where.topic = body.topic
    where.difficulty = difficulty

    const available = await prisma.question.findMany({
      where,
      select: { id: true },
    })

    if (available.length === 0) {
      return error("NO_QUESTIONS", `No questions found matching the selected criteria. Try a different topic or difficulty.`)
    }

    const shuffled = available.sort(() => Math.random() - 0.5).slice(0, Math.min(count, available.length))
    const questionIds = shuffled.map(q => q.id)

    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
    })

    const subjectLabel = body.subject || "Mixed"
    const testName = practiceType
      ? `${practiceType.name} — ${subjectLabel}`
      : `${subjectLabel} Practice`

    const mockTest = await prisma.mockTest.create({
      data: {
        name: testName,
        examType: "JEE_MAIN",
        subject: body.subject || null,
        duration,
        totalQuestions: questions.length,
        difficulty: difficulty as any,
        description: `Practice set — ${questions.length} ${body.subject ? body.subject : ""} questions (${difficulty.toLowerCase()})`,
        marksPerQuestion: 4,
        negativeMarking: 1,
        isPublished: true,
        isAIGenerated: true,
        createdBy: session.user.id,
      },
    })

    for (const q of questions) {
      await prisma.question.create({
        data: {
          mockTestId: mockTest.id,
          questionText: q.questionText,
          options: q.options,
          correctOption: q.correctOption,
          explanation: q.explanation,
          subject: q.subject,
          chapter: q.chapter,
          topic: q.topic,
          difficulty: q.difficulty,
          examType: q.examType,
          isPYQ: q.isPYQ,
          pyqYear: q.pyqYear,
          pyqSession: q.pyqSession,
          order: q.order,
          embedding: q.embedding,
          marks: q.marks,
          negativeMarks: q.negativeMarks,
        },
      })
    }

    return success({ testId: mockTest.id })
  } catch (err) {
    console.error("Practice generation error:", err)
    return serverError(err)
  }
}
