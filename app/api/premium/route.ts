import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { premiumService } from "@/services/premium-service"

export async function GET() {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const status = await premiumService.getStatus(session.user.id)
    return NextResponse.json(status ?? { isPremium: false })
  } catch {
    return NextResponse.json({ isPremium: false })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { action, planId } = await request.json()

    if (action === "upgrade") {
      const result = await premiumService.upgrade(session.user.id, planId)
      return NextResponse.json(result)
    }
    if (action === "downgrade") {
      const result = await premiumService.downgrade(session.user.id)
      return NextResponse.json(result)
    }
    if (action === "trial") {
      const result = await premiumService.startFreeTrial(session.user.id)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Failed to process" }, { status: 500 })
  }
}
