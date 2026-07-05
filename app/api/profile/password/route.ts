import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { changeUserPassword } from "@/lib/data-service"

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json({ error: "Current and new password are required" }, { status: 400 })
    }

    await changeUserPassword(session.user.id, body.currentPassword, body.newPassword)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to change password"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
