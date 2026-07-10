import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { success, error, unauthorized, serverError } from "@/lib/api-response"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "ADMIN") {
      return unauthorized()
    }
    const [totalUsers, totalTests, totalQuestions, totalAttempts, recentAttempts, testStats] = await Promise.all([
      prisma.user.count(),
      prisma.mockTest.count(),
      prisma.question.count(),
      prisma.attempt.count(),
      prisma.attempt.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { mockTest: { select: { name: true } }, user: { select: { name: true } } } }),
      prisma.mockTest.findMany({ select: { id: true, name: true, examType: true, _count: { select: { questions: true, attempts: true } } }, orderBy: { createdAt: "desc" } }),
    ])
    const activeUsers = await prisma.user.count({ where: { attempts: { some: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } } } })
    return success({ totalUsers, totalTests, totalQuestions, totalAttempts, activeUsers, recentAttempts, testStats })
  } catch (error) {
    return serverError(error)
  }
}
