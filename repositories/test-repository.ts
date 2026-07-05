import { prisma } from "@/lib/prisma"

export const testRepo = {
  async findAll() {
    try {
      return await prisma.mockTest.findMany({ orderBy: { createdAt: "asc" } })
    } catch {
      return []
    }
  },

  async findById(id: string) {
    try {
      return await prisma.mockTest.findUnique({ where: { id } })
    } catch {
      return null
    }
  },
}
