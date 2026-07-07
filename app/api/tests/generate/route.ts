import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateTest, generateAdaptiveTest, TestGenerationConfig } from "@/lib/services/test-generator"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const config: TestGenerationConfig = {
      examType: body.examType,
      subject: body.subject,
      chapter: body.chapter,
      difficulty: body.difficulty,
      totalQuestions: body.totalQuestions,
      duration: body.duration,
      isPYQTest: body.isPYQTest,
      pyqYear: body.pyqYear
    }

    const isAdaptive = body.isAdaptive || false

    let generatedTest
    if (isAdaptive) {
      generatedTest = await generateAdaptiveTest(session.user.id, config.examType, config.subject)
    } else {
      generatedTest = await generateTest(config)
    }

    // Create a temporary mock test for this generated test
    const { prisma } = await import("@/lib/prisma")
    
    const mockTest = await prisma.mockTest.create({
      data: {
        name: body.testName || `${config.examType} Generated Test`,
        examType: config.examType.toUpperCase() as any,
        subject: config.subject || null,
        duration: generatedTest.config.duration,
        totalQuestions: generatedTest.config.totalQuestions,
        difficulty: (config.difficulty || 'MEDIUM').toUpperCase() as any,
        description: body.description || 'AI-generated test',
        marksPerQuestion: generatedTest.config.marksPerQuestion,
        negativeMarking: generatedTest.config.negativeMarking,
        isPublished: true,
        isAIGenerated: true,
        createdBy: session.user.id
      }
    })

    // Link questions to the test
    for (const question of generatedTest.questions) {
      await prisma.question.update({
        where: { id: question.id },
        data: { mockTestId: mockTest.id }
      })
    }

    return NextResponse.json({ 
      testId: mockTest.id,
      test: mockTest,
      questions: generatedTest.questions,
      config: generatedTest.config
    })
  } catch (error) {
    console.error("Test generation error:", error)
    return NextResponse.json({ error: "Failed to generate test", details: String(error) }, { status: 500 })
  }
}
