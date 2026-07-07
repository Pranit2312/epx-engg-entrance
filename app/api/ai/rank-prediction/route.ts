import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { predictRank } from "@/lib/services/ai-service"
import { requireAIAccess } from "@/lib/ai/access"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasAccess = await requireAIAccess(session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: "AI rank prediction requires a premium subscription", premiumRequired: true }, { status: 403 })
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
      return NextResponse.json({ 
        error: "No test attempts found",
        message: "Complete at least one test to get rank prediction"
      }, { status: 400 })
    }

    const currentScore = attempts[0].score
    const historicalScores = attempts.map((a) => a.score)
    const targetExam = user?.targetExam ?? "JEE_MAIN"

    const prediction = await predictRank(currentScore, targetExam, historicalScores)

    return NextResponse.json({
      currentScore,
      targetExam,
      prediction,
      historicalScores
    })
  } catch (error: any) {
    console.error("Rank prediction error:", error)
    return NextResponse.json(
      { error: "Failed to predict rank", message: error?.message ?? "Unknown error" },
      { status: 500 }
    )
  }
}
