import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma, isDbAvailable } from "@/lib/prisma"
import { generateMockQuestions } from "@/lib/data/mock-questions"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let id: string
  try {
    const p = await params
    id = p.id
  } catch {
    return NextResponse.json({ error: "Invalid test ID" }, { status: 400 })
  }

  if (!id || typeof id !== "string" || id.trim() === "") {
    return NextResponse.json({ error: "Test ID is required" }, { status: 400 })
  }

  // Try database first
  try {
    if (isDbAvailable() || true) {
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

      if (questions.length > 0) {
        return NextResponse.json({ questions, fallback: false, source: "database" })
      }
    }
  } catch (error) {
    console.error("DB question fetch failed, using fallback:", (error as Error)?.message || error)
  }

  // Fallback: get test to determine question count, then generate mock questions
  try {
    let totalQuestions = 30
    try {
      const testsRes = await fetch(new URL("/api/tests", _request.url).toString())
      const testsData = await testsRes.json()
      if (Array.isArray(testsData)) {
        const found = testsData.find((t: any) => t.id === id)
        if (found?.totalQuestions) totalQuestions = found.totalQuestions
      }
    } catch {
      // use default
    }

    const questions = generateMockQuestions(totalQuestions)
    return NextResponse.json({ questions, fallback: true, source: "generated" })
  } catch (error) {
    console.error("Failed to generate fallback questions:", error)
    return NextResponse.json({ error: "Failed to load questions", message: "Unable to load or generate questions" }, { status: 500 })
  }
}
