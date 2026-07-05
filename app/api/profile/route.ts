import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUserProfile, updateUserProfile, deleteUserAccount } from "@/lib/data-service"

export async function GET() {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    let profile = await getUserProfile(session.user.id)
    if (!profile) {
      profile = {
        id: session.user.id,
        email: session.user.email ?? "",
        name: null,
        username: null,
        image: null,
        bio: null,
        targetExam: null,
        preferredSubjects: [],
        emailNotifications: true,
        testReminders: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stats: { testsAttempted: 0, averageScore: 0, averageAccuracy: 0, bestScore: 0, currentStreak: 0 },
      }
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Profile GET error:", error)
    return NextResponse.json(
      {
        id: session.user.id,
        email: session.user.email ?? "",
        name: null,
        username: null,
        image: null,
        bio: null,
        targetExam: null,
        preferredSubjects: [],
        emailNotifications: true,
        testReminders: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stats: { testsAttempted: 0, averageScore: 0, averageAccuracy: 0, bestScore: 0, currentStreak: 0 },
      },
      { status: 200 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const profile = await updateUserProfile(session.user.id, {
      name: body.name,
      username: body.username,
      image: body.image,
      bio: body.bio,
      targetExam: body.targetExam,
      preferredSubjects: body.preferredSubjects,
    })

    return NextResponse.json({ success: true, profile })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update profile"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    if (!body.password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    await deleteUserAccount(session.user.id, body.password)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete account"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
