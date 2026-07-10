import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { premiumService } from "@/services/premium-service"
import { success, error, unauthorized, serverError, parseBody } from "@/lib/api-response"

export async function GET() {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return unauthorized()
  }
  try {
    const status = await premiumService.getStatus(session.user.id)
    return success(status ?? { isPremium: false })
  } catch {
    return success({ isPremium: false })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return unauthorized()
  }
  try {
    const { data, error: bodyError } = await parseBody<{ action: string; planId?: string }>(request)
    if (bodyError) return bodyError
    const { action, planId } = data!

    if (action === "upgrade") {
      const result = await premiumService.upgrade(session.user.id, planId ?? "")
      return success(result)
    }
    if (action === "downgrade") {
      const result = await premiumService.downgrade(session.user.id)
      return success(result)
    }
    if (action === "trial") {
      const result = await premiumService.startFreeTrial(session.user.id)
      return success(result)
    }

    return error("VALIDATION_ERROR", "Invalid action")
  } catch {
    return serverError()
  }
}
