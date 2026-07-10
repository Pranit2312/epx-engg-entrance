import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NotificationType } from "@prisma/client"
import { success, error, unauthorized, serverError, parseBody } from "@/lib/api-response"

export async function GET() {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return unauthorized()
  }
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    return success(notifications)
  } catch {
    return success([])
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return unauthorized()
  }
  try {
    const { data, error: bodyError } = await parseBody<{ type: string; title: string; message?: string; actionUrl?: string }>(request)
    if (bodyError) return bodyError
    const { type, title, message, actionUrl } = data!
    if (!type || !title) {
      return error("VALIDATION_ERROR", "type and title are required")
    }
    const notification = await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: type as NotificationType,
        title,
        message: message ?? "",
        actionUrl: actionUrl ?? null,
      },
    })
    return success(notification, 201)
  } catch {
    return serverError()
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return unauthorized()
  }
  try {
    const { data, error: bodyError } = await parseBody<{ id?: string; read?: boolean }>(request)
    if (bodyError) return bodyError
    const { id, read } = data!
    if (id) {
      await prisma.notification.updateMany({
        where: { id, userId: session.user.id },
        data: { read: read ?? true },
      })
    } else {
      await prisma.notification.updateMany({
        where: { userId: session.user.id },
        data: { read: true },
      })
    }
    return success({ success: true })
  } catch {
    return serverError()
  }
}
