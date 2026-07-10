import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateTest, generateAdaptiveTest, TestGenerationConfig } from "@/lib/services/test-generator"
import { success, error, unauthorized, serverError, parseBody } from "@/lib/api-response"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorized()
    }

    const { data: body, error: bodyError } = await parseBody<any>(request)
    if (bodyError) return bodyError

    if (!body!.examType || !body!.totalQuestions || !body!.duration) {
      return error("VALIDATION_ERROR", "Missing required fields: examType, totalQuestions, duration")
    }

    const config: TestGenerationConfig = {
      examType: body.examType,
      subject: body.subject,
      chapter: body.chapter,
      difficulty: body.difficulty,
      totalQuestions: body.totalQuestions,
      duration: body.duration,
      isPYQTest: body.isPYQTest,
      pyqYear: body.pyqYear,
    }

    const isAdaptive = body.isAdaptive || false

    let generatedTest
    if (isAdaptive) {
      generatedTest = await generateAdaptiveTest(session.user.id, config.examType, config.subject)
    } else {
      generatedTest = await generateTest(config)
    }

    const mockTest = await prisma.mockTest.create({
      data: {
        name: body.testName || `${config.examType} Generated Test`,
        examType: (config.examType ?? "JEE_MAIN") as any,
        subject: config.subject || null,
        duration: generatedTest.config.duration,
        totalQuestions: generatedTest.config.totalQuestions,
        difficulty: (config.difficulty || "MEDIUM") as any,
        description: body.description || "AI-generated test",
        marksPerQuestion: generatedTest.config.marksPerQuestion,
        negativeMarking: generatedTest.config.negativeMarking,
        isPublished: true,
        isAIGenerated: true,
        createdBy: session.user.id,
      },
    })

    for (const question of generatedTest.questions) {
      await prisma.question.update({
        where: { id: question.id },
        data: { mockTestId: mockTest.id },
      })
    }

    return success({ testId: mockTest.id, test: mockTest, questions: generatedTest.questions, config: generatedTest.config })
  } catch (error) {
    console.error("Test generation error:", error)
    return serverError(error)
  }
}
