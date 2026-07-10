import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { success, error, unauthorized, serverError, parseBody } from "@/lib/api-response"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "ADMIN") {
      return unauthorized()
    }

    const tests = await prisma.mockTest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    })

    return success({ tests })
  } catch (error) {
    console.error("Failed to fetch tests:", error)
    return serverError(error)
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "ADMIN") {
      return unauthorized()
    }

    const { data: body, error: bodyError } = await parseBody<any>(request)
    if (bodyError) return bodyError
    const { name, examType, duration, difficulty, description, sections, questionIds } = body!

    if (!name || !examType || !duration) {
      return error("VALIDATION_ERROR", "Missing required fields: name, examType, duration")
    }

    const qIds = questionIds ?? []

    // Create the test
    const test = await prisma.mockTest.create({
      data: {
        name,
        examType,
        duration,
        difficulty,
        description,
        totalQuestions: qIds.length,
        isPublished: false,
        marksPerQuestion: 4,
        negativeMarking: 1,
        createdBy: session.user.id,
      },
    })

    // Create test sections
    if (sections && sections.length > 0) {
      for (const section of sections) {
        await prisma.testSection.create({
          data: {
            mockTestId: test.id,
            subject: section.subject,
            questionCount: section.questionCount,
            marks: section.marks,
          },
        })
      }
    }

    // Link questions to the test
    for (const questionId of qIds) {
      await prisma.question.update({
        where: { id: questionId },
        data: { mockTestId: test.id },
      })
    }

    return success({ test }, 201)
  } catch (error) {
    console.error("Failed to create test:", error)
    return serverError(error)
  }
}
