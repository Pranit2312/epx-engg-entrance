import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUserProfile, updateUserProfile, deleteUserAccount } from "@/lib/data-service"
import { success, error, unauthorized, serverError, parseBody } from "@/lib/api-response"

export async function GET() {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return unauthorized()
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

    return success(profile)
  } catch (err) {
    console.error("Profile GET error:", err)
    // Graceful fallback even if DB fails
    const fallbackProfile = {
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
    return success(fallbackProfile)
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorized()
    }

    const { data: body, error: bodyError } = await parseBody<any>(request)
    if (bodyError) return bodyError
    const profile = await updateUserProfile(session.user.id, {
      name: body!.name,
      username: body!.username,
      image: body!.image,
      bio: body!.bio,
      targetExam: body!.targetExam,
      preferredSubjects: body!.preferredSubjects,
    })

    return success({ success: true, profile })
  } catch (err) {
    return error("BAD_REQUEST", "Failed to update profile", 400)
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorized()
    }

    const { data: body, error: bodyError } = await parseBody<{ password: string }>(request)
    if (bodyError) return bodyError
    if (!body!.password) {
      return error("VALIDATION_ERROR", "Password is required")
    }

    await deleteUserAccount(session.user.id, body!.password)
    return success({ success: true })
  } catch (err) {
    return error("BAD_REQUEST", "Failed to delete account", 400)
  }
}
