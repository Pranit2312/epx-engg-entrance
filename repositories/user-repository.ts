import { prisma } from "@/lib/prisma"

export const userRepo = {
  async findById(id: string) {
    try {
      return await prisma.user.findUnique({ where: { id } })
    } catch {
      return null
    }
  },

  async findByEmail(email: string) {
    try {
      return await prisma.user.findUnique({ where: { email } })
    } catch {
      return null
    }
  },

  async findByUsername(username: string) {
    try {
      return await prisma.user.findUnique({ where: { username } })
    } catch {
      return null
    }
  },
}
