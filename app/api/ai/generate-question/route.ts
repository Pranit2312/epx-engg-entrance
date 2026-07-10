import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateAIQuestion } from "@/lib/services/ai-service"
import { requireAIAccess } from "@/lib/ai/access"
import { success, error, unauthorized, forbidden, serverError, parseBody } from "@/lib/api-response"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorized()
    }

    const hasAccess = await requireAIAccess(session.user.id)
    if (!hasAccess) {
      return forbidden("AI question generation requires a premium subscription")
    }

    const { data, error: bodyError } = await parseBody<{ subject: string; chapter: string; topic: string; difficulty?: string; examType?: string }>(request)
    if (bodyError) return bodyError
    const { subject, chapter, topic, difficulty, examType } = data!

    if (!subject || !chapter || !topic) {
      return error("VALIDATION_ERROR", "subject, chapter, and topic are required")
    }

    const result = await generateAIQuestion({
      subject,
      chapter,
      topic,
      difficulty: difficulty ?? "MEDIUM",
      examType: examType ?? "JEE_MAIN",
    })

    if (!result) {
      return error("SERVICE_UNAVAILABLE", "AI service unavailable", 503)
    }

    return success({ question: result })
  } catch (error: any) {
    console.error("AI question generation error:", error)
    return serverError(error)
  }
}
