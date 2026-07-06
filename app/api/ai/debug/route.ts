import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
  }

  // Check all env access patterns
  const directKey = process.env.GEMINI_API_KEY
  const safeKey = (typeof process !== "undefined" && process.env && process.env.GEMINI_API_KEY) || ""
  console.log("[Debug] Direct process.env.GEMINI_API_KEY:", !!directKey, "length:", directKey?.length)
  console.log("[Debug] Safe access GEMINI_API_KEY:", !!safeKey, "length:", safeKey?.length)

  // 1. Check Gemini API key
  diagnostics.hasGeminiKey = !!safeKey
  diagnostics.geminiKeyPrefix = safeKey ? safeKey.substring(0, 8) + "..." : "NOT SET"
  diagnostics.directAccessResult = !!directKey

  // 2. Check session
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

  // 3. Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`
    diagnostics.dbConnected = true
  } catch (e: any) {
    diagnostics.dbConnected = false
    diagnostics.dbError = e.message
  }

  // 4. Try Gemini initialization
  if (safeKey) {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai")
      const genAI = new GoogleGenerativeAI(safeKey)
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: "Reply with just the word: OK" }] }],
      })
      diagnostics.geminiConnected = true
      diagnostics.geminiResponse = result.response.text().trim()
    } catch (e: any) {
      diagnostics.geminiConnected = false
      diagnostics.geminiError = e.message
      diagnostics.geminiStack = e.stack?.split("\n").slice(0, 3).join("\n")
    }
  } else {
    diagnostics.geminiConnected = false
    diagnostics.geminiError = "GEMINI_API_KEY is not configured"
  }

  return NextResponse.json(diagnostics)
}
