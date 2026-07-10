import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { changeUserPassword } from "@/lib/data-service"
import { success, error, unauthorized, parseBody } from "@/lib/api-response"

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorized()
    }

    const { data: body, error: bodyError } = await parseBody<{ currentPassword: string; newPassword: string }>(request)
    if (bodyError) return bodyError
    if (!body!.currentPassword || !body!.newPassword) {
      return error("VALIDATION_ERROR", "Current and new password are required")
    }

    await changeUserPassword(session.user.id, body!.currentPassword, body!.newPassword)
    return success({ success: true })
  } catch {
    return error("BAD_REQUEST", "Failed to change password", 400)
  }
}
