import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const questions = await prisma.question.findMany({
      where: { mockTestId: id },
      orderBy: { order: "asc" },
      select: {
        id: true,
        questionText: true,
        options: true,
        correctOption: true,
        explanation: true,
        subject: true,
        chapter: true,
        topic: true,
        difficulty: true,
      },
    })

    if (questions.length === 0) {
      return NextResponse.json({ questions: [], fallback: true, message: "No questions found for this test" })
    }

    return NextResponse.json({ questions, fallback: false })
  } catch (error) {
    console.error("Failed to fetch questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}
