import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    return NextResponse.json(notifications)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { type, title, message, actionUrl } = await request.json()
    if (!type || !title) {
      return NextResponse.json({ error: "type and title are required" }, { status: 400 })
    }
    const notification = await prisma.notification.create({
      data: {
        userId: session.user.id,
        type,
        title,
        message: message ?? "",
        actionUrl: actionUrl ?? null,
      },
    })
    return NextResponse.json(notification, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { id, read } = await request.json()
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
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}
