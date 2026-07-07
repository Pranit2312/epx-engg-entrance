import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateMentorResponse } from "@/lib/services/ai-service"
import { requireAIAccess } from "@/lib/ai/access"

export async function POST(request: Request) {
  const requestId = crypto.randomUUID().slice(0, 8)
  console.log(`[AI:Mentor:${requestId}] POST /api/ai/mentor`)

  try {
    const session = await getServerSession(authOptions)
    console.log(`[AI:Mentor:${requestId}] Session:`, session ? `found (user=${session.user?.id}, role=${session.user?.role})` : "NOT FOUND")

    if (!session?.user?.id) {
      console.log(`[AI:Mentor:${requestId}] Auth FAILED — no session`)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasAccess = await requireAIAccess(session.user.id)
    console.log(`[AI:Mentor:${requestId}] Access check: ${hasAccess}`)
    if (!hasAccess) {
      return NextResponse.json({ error: "AI Mentor requires a premium subscription", premiumRequired: true }, { status: 403 })
    }

    const { message } = await request.json()
    console.log(`[AI:Mentor:${requestId}] Message received: "${message?.substring(0, 50)}..."`)

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      console.log(`[AI:Mentor:${requestId}] Validation FAILED — empty message`)
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    console.log(`[AI:Mentor:${requestId}] Fetching user profile, weak topics, and attempts...`)
    const [user, weakTopics, attempts] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { targetExam: true, preferredSubjects: true },
      }),
      prisma.weakTopic.findMany({
        where: { userId: session.user.id },
        orderBy: { accuracy: "asc" },
        take: 10,
      }),
      prisma.attempt.findMany({
        where: { userId: session.user.id, status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ])
    console.log(`[AI:Mentor:${requestId}] Profile loaded: targetExam=${user?.targetExam}, weakTopics=${weakTopics.length}, attempts=${attempts.length}`)

    const weakTopicNames = weakTopics.map((w) => `${w.subject} - ${w.chapter}${w.topic ? ` - ${w.topic}` : ''}`)
    const recentScores = attempts.map((a) => a.score)
    const averageScore = recentScores.length > 0 ? Math.round(recentScores.reduce((s, a) => s + a, 0) / recentScores.length) : 0

    const userContext = {
      recentAttempts: attempts.length,
      averageScore,
      weakTopics: weakTopicNames,
      strongTopics: user?.preferredSubjects || [],
      targetExam: user?.targetExam ?? "JEE_MAIN"
    }

    console.log(`[AI:Mentor:${requestId}] Context built, generating AI response...`)

    const reply = await generateMentorResponse(message, userContext)
    console.log(`[AI:Mentor:${requestId}] AI response: ${reply.substring(0, 80)}...`)

    // Save chat history
    await prisma.chatHistory.create({
      data: {
        userId: session.user.id,
        role: "user",
        content: message,
        context: userContext as any
      }
    })

    await prisma.chatHistory.create({
      data: {
        userId: session.user.id,
        role: "assistant",
        content: reply,
        context: userContext as any
      }
    })

    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error(`[AI:Mentor:${requestId}] ERROR:`, {
      message: error?.message ?? "Unknown error",
      stack: error?.stack?.split("\n").slice(0, 3).join("\n"),
      name: error?.name,
    })
    return NextResponse.json(
      { error: "AI mentor unavailable", message: error?.message ?? "Unknown error" },
      { status: 500 }
    )
  }
}
