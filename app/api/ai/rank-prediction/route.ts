import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { predictRank } from "@/lib/services/ai-service"
import { requireAIAccess } from "@/lib/ai/access"
import { success, error, unauthorized, forbidden, serverError } from "@/lib/api-response"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorized()
    }

    const hasAccess = await requireAIAccess(session.user.id)
    if (!hasAccess) {
      return forbidden("AI rank prediction requires a premium subscription")
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { targetExam: true },
    })

    const attempts = await prisma.attempt.findMany({
      where: { userId: session.user.id, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    if (attempts.length === 0) {
      return error("VALIDATION_ERROR", "Complete at least one test to get rank prediction")
    }

    const currentScore = attempts[0].score
    const historicalScores = attempts.map((a) => a.score)
    const targetExam = user?.targetExam ?? "JEE_MAIN"

    const prediction = await predictRank(currentScore, targetExam, historicalScores)

    return success({ currentScore, targetExam, prediction, historicalScores })
  } catch (error: any) {
    console.error("Rank prediction error:", error)
    return serverError(error)
  }
}
