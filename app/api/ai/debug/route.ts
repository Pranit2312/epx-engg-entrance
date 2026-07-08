import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
  }

  const groqKey = process.env.GROQ_API_KEY
  diagnostics.hasGroqKey = !!groqKey
  diagnostics.groqKeyPrefix = groqKey ? groqKey.substring(0, 8) + "..." : "NOT SET"

  try {
    const session = await getServerSession(authOptions)
    diagnostics.sessionFound = !!session
    diagnostics.sessionUser = session?.user
      ? { id: session.user.id, email: session.user.email, role: session.user.role }
      : null
  } catch (e: any) {
    diagnostics.sessionFound = false
    diagnostics.sessionError = e.message
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    diagnostics.dbConnected = true
  } catch (e: any) {
    diagnostics.dbConnected = false
    diagnostics.dbError = e.message
  }

  if (groqKey) {
    try {
      const Groq = (await import("groq-sdk")).default
      const groq = new Groq({ apiKey: groqKey })
      const result = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: "Reply with just the word: OK" }],
        max_tokens: 10,
      })
      diagnostics.groqConnected = true
      diagnostics.groqResponse = result.choices[0]?.message?.content?.trim()
    } catch (e: any) {
      diagnostics.groqConnected = false
      diagnostics.groqError = e.message
      diagnostics.groqStatus = e.status
    }
  } else {
    diagnostics.groqConnected = false
    diagnostics.groqError = "GROQ_API_KEY is not configured"
  }

  return NextResponse.json(diagnostics)
}
