import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ExamType } from "@prisma/client"
import { seedDefaultWeakTopics } from "@/lib/services/analytics"
import { success, error, unauthorized, notFound, serverError, parseBody } from "@/lib/api-response"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorized()
    }

    const { data: body, error: bodyError } = await parseBody<{ targetExam?: string; preferredSubjects?: string[]; currentScore?: number; weakSubjects?: string[]; strongSubjects?: string[] }>(request)
    if (bodyError) return bodyError
    const { targetExam, preferredSubjects, currentScore, weakSubjects, strongSubjects } = body!

    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    })
    if (!userExists) {
      return notFound("User not found")
    }

    const updateData: Record<string, unknown> = {}
    if (targetExam) updateData.targetExam = targetExam as ExamType
    if (preferredSubjects) updateData.preferredSubjects = preferredSubjects

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    })

    if (targetExam) {
      await seedDefaultWeakTopics(session.user.id, targetExam)
    }

    return success({ success: true })
  } catch (error: any) {
    console.error("Setup error:", error)
    return serverError(error)
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return unauthorized()
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { targetExam: true, preferredSubjects: true },
    })

    if (!user) {
      return notFound("User not found")
    }

    const attemptCount = await prisma.attempt.count({
      where: { userId: session.user.id },
    })

    return success({ hasCompletedSetup: !!(user.targetExam), isNewUser: attemptCount === 0, targetExam: user.targetExam, preferredSubjects: user.preferredSubjects })
  } catch (error: any) {
    console.error("Setup check error:", error)
    return serverError(error)
  }
}
