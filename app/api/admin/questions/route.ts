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
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Failed to fetch questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { questionText, options, correctOption, explanation, subject, chapter, topic, difficulty, examType } = body

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
        order: 0,
        embedding: "",
      },
    })

    return NextResponse.json({ question }, { status: 201 })
  } catch (error) {
    console.error("Failed to create question:", error)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}
