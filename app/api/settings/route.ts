import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUserProfile, updateUserSettings } from "@/lib/data-service"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await getUserProfile(session.user.id)

    return NextResponse.json({
      emailNotifications: profile?.emailNotifications ?? true,
      testReminders: profile?.testReminders ?? true,
    })
  } catch (error) {
    console.error("Settings GET error:", error)
    return NextResponse.json({ emailNotifications: true, testReminders: true })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const profile = await updateUserSettings(session.user.id, {
      emailNotifications: body.emailNotifications,
      testReminders: body.testReminders,
    })

    return NextResponse.json({
      emailNotifications: profile?.emailNotifications ?? body.emailNotifications ?? true,
      testReminders: profile?.testReminders ?? body.testReminders ?? true,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update settings"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
