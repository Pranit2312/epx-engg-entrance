import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { submitAttempt } from "@/lib/data-service"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await request.json()
    const attempt = await submitAttempt({
      userId: session.user.id,
      ...payload,
    })

    return NextResponse.json({ attempt })
  } catch (error) {
    console.error("Attempts API error:", error)
    return NextResponse.json({ error: "Failed to submit attempt" }, { status: 500 })
  }
}
