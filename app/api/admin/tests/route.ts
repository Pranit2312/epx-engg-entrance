import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tests = await prisma.mockTest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    })

    return NextResponse.json({ tests })
  } catch (error) {
    console.error("Failed to fetch tests:", error)
    return NextResponse.json({ error: "Failed to fetch tests" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, examType, duration, difficulty, description, sections, questionIds } = body

    // Create the test
    const test = await prisma.mockTest.create({
      data: {
        name,
        examType,
        duration,
        difficulty,
        description,
        totalQuestions: questionIds.length,
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
    for (const questionId of questionIds) {
      await prisma.question.update({
        where: { id: questionId },
        data: { mockTestId: test.id },
      })
    }

    return NextResponse.json({ test }, { status: 201 })
  } catch (error) {
    console.error("Failed to create test:", error)
    return NextResponse.json({ error: "Failed to create test" }, { status: 500 })
  }
}
