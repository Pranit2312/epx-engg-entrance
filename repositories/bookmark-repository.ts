import { prisma } from "@/lib/prisma"

export const bookmarkRepo = {
  async findByUser(userId: string) {
    try {
      return await prisma.bookmark.findMany({
        where: { userId },
        include: { test: true },
        orderBy: { createdAt: "desc" },
      })
    } catch {
      return []
    }
  },

  async findByUserAndTest(userId: string, testId: string) {
    try {
      return await prisma.bookmark.findUnique({
        where: { userId_testId: { userId, testId } },
      })
    } catch {
      return null
    }
  },

  async create(userId: string, testId: string) {
    try {
      return await prisma.bookmark.create({
        data: { userId, testId },
        include: { test: true },
      })
    } catch {
      return null
    }
  },

  async remove(userId: string, testId: string) {
    try {
      await prisma.bookmark.delete({
        where: { userId_testId: { userId, testId } },
      })
      return true
    } catch {
      return false
    }
  },

  async count(userId: string) {
    try {
      return await prisma.bookmark.count({ where: { userId } })
    } catch {
      return 0
    }
  },

  async getBookmarkedTestIds(userId: string): Promise<string[]> {
    try {
      const bookmarks = await prisma.bookmark.findMany({
        where: { userId },
        select: { testId: true },
      })
      return bookmarks.map((b) => b.testId)
    } catch {
      return []
    }
  },
}
