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

  try {
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

    return NextResponse.json({ questions, fallback: false, source: "database" })
  } catch (error) {
    console.error("Failed to fetch questions:", error)
    return NextResponse.json({ error: "Failed to load questions" }, { status: 500 })
  }
}
