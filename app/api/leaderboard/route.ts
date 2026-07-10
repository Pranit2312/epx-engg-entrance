import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { success, unauthorized } from "@/lib/api-response"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return unauthorized()
  }

  const url = new URL(request.url)
  const period = url.searchParams.get("period") || "all_time"
  const filter = url.searchParams.get("filter") || "global"
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100)

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { city: true, college: true },
    })

    const whereClause: any = {}
    if (filter === "city" && user?.city) {
      whereClause.city = user.city
    }
    if (filter === "college" && user?.college) {
      whereClause.college = user.college
    }

    const periodDate = new Date()
    if (period === "daily") periodDate.setDate(periodDate.getDate() - 1)
    else if (period === "weekly") periodDate.setDate(periodDate.getDate() - 7)
    else if (period === "monthly") periodDate.setDate(periodDate.getDate() - 30)
    else periodDate.setFullYear(periodDate.getFullYear() - 10)

    const leaderboardData = await prisma.attempt.groupBy({
      by: ["userId"],
      where: {
        status: "COMPLETED",
        submittedAt: { gte: periodDate },
        user: whereClause,
      },
      _avg: { score: true, accuracy: true },
      _count: { id: true },
      _max: { score: true },
      orderBy: { _avg: { score: "desc" } },
      take: limit,
    })

    const userIds = leaderboardData.map((e) => e.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, username: true, image: true, city: true, college: true },
    })
    const userMap = new Map(users.map((u) => [u.id, u]))

    const entries = leaderboardData.map((entry, index) => {
      const u = userMap.get(entry.userId)
      return {
        rank: index + 1,
        userId: entry.userId,
        name: u?.name || u?.username || "Anonymous",
        username: u?.username,
        image: u?.image,
        city: u?.city,
        college: u?.college,
        averageScore: Math.round(entry._avg.score ?? 0),
        averageAccuracy: Math.round(entry._avg.accuracy ?? 0),
        bestScore: entry._max.score ?? 0,
        testsTaken: entry._count.id,
        isCurrentUser: entry.userId === session.user.id,
      }
    })

    const currentUserEntry = entries.find((e) => e.isCurrentUser)

    return success({ entries, currentUser: currentUserEntry ?? null, totalParticipants: leaderboardData.length, period, filter })
  } catch (err) {
    console.error("Leaderboard API error:", err)
    return success({ entries: [], currentUser: null, totalParticipants: 0, period, filter })
  }
}
