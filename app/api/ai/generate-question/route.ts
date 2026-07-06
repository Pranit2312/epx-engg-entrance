import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateAIQuestion } from "@/lib/ai/question-generator"
import { requireAIAccess } from "@/lib/ai/access"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasAccess = await requireAIAccess(session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: "AI question generation requires a premium subscription", premiumRequired: true }, { status: 403 })
    }

    const { subject, chapter, topic, difficulty, examType } = await request.json()

    if (!subject || !chapter || !topic) {
      return NextResponse.json({ error: "subject, chapter, and topic are required" }, { status: 400 })
    }

    const result = await generateAIQuestion({
      subject,
      chapter,
      topic,
      difficulty: difficulty ?? "MEDIUM",
      examType: examType ?? "JEE_MAIN",
    })

    return NextResponse.json({ question: result })
  } catch (error: any) {
    console.error("AI question generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate question", message: error?.message ?? "Unknown error" },
      { status: 500 }
    )
  }
}
