import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireAIAccess } from "@/lib/ai/access"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasAccess = await requireAIAccess(session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: "AI Mentor requires a premium subscription", premiumRequired: true }, { status: 403 })
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

    return NextResponse.json({ messages })
  } catch (error: any) {
    console.error("Chat history error:", error)
    return NextResponse.json(
      { error: "Failed to fetch chat history", message: error?.message ?? "Unknown error" },
      { status: 500 }
    )
  }
}
