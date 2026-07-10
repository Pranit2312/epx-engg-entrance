import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUserProfile, updateUserSettings } from "@/lib/data-service"
import { success, error, unauthorized, parseBody } from "@/lib/api-response"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorized()
    }

    const profile = await getUserProfile(session.user.id)

    return success({
      emailNotifications: profile?.emailNotifications ?? true,
      testReminders: profile?.testReminders ?? true,
    })
  } catch (err) {
    console.error("Settings GET error:", err)
    return success({ emailNotifications: true, testReminders: true })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorized()
    }

    const { data: body, error: bodyError } = await parseBody<{ emailNotifications?: boolean; testReminders?: boolean }>(request)
    if (bodyError) return bodyError
    const profile = await updateUserSettings(session.user.id, {
      emailNotifications: body!.emailNotifications,
      testReminders: body!.testReminders,
    })

    return success({
      emailNotifications: profile?.emailNotifications ?? body!.emailNotifications ?? true,
      testReminders: profile?.testReminders ?? body!.testReminders ?? true,
    })
  } catch (err) {
    return error("BAD_REQUEST", "Failed to update settings", 400)
  }
}
