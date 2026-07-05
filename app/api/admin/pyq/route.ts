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

    const questions = await prisma.question.findMany({
      where: { isPYQ: true },
      orderBy: [{ pyqYear: "desc" }, { createdAt: "desc" }],
    })

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Failed to fetch PYQs:", error)
    return NextResponse.json({ error: "Failed to fetch PYQs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { questionText, options, correctOption, explanation, subject, chapter, topic, difficulty, examType, pyqYear, pyqSession } = body

    const question = await prisma.question.create({
      data: {
        questionText,
        options,
        correctOption,
        explanation,
        subject,
        chapter,
        topic,
        difficulty,
        examType,
        isPYQ: true,
        pyqYear,
        pyqSession,
        order: 0,
        embedding: "",
      },
    })

    return NextResponse.json({ question }, { status: 201 })
  } catch (error) {
    console.error("Failed to create PYQ:", error)
    return NextResponse.json({ error: "Failed to create PYQ" }, { status: 500 })
  }
}
