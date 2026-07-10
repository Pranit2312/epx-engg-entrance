import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { success, unauthorized, serverError } from "@/lib/api-response"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "ADMIN") {
      return unauthorized()
    }
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        targetExam: true,
        emailNotifications: true,
        createdAt: true,
        _count: { select: { attempts: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    const total = await prisma.user.count()
    return success({ users, total })
  } catch (error) {
    return serverError(error)
  }
}
