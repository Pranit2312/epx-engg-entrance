import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireAIAccess } from "@/lib/ai/access"
import { success, error, unauthorized, forbidden, serverError } from "@/lib/api-response"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorized()
    }

    const hasAccess = await requireAIAccess(session.user.id)
    if (!hasAccess) {
      return forbidden("AI Mentor requires a premium subscription")
    }

    // Verify user exists in DB before querying chat history
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    })
    if (!userExists) {
      return success({ messages: [] })
    }

    const history = await prisma.chatHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    const messages = history.reverse().map((h) => ({
      id: h.id,
      role: h.role as "user" | "assistant",
      content: h.content,
      createdAt: h.createdAt,
    }))

    return success({ messages })
  } catch (error: any) {
    console.error("Chat history error:", error)
    return success({ messages: [] })
  }
}
