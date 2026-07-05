import { prisma } from "@/lib/prisma"

export const attemptRepo = {
  async findByUser(userId: string) {
    try {
      return await prisma.attempt.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { mockTest: true },
      })
    } catch {
      return []
    }
  },

  async findById(id: string) {
    try {
      return await prisma.attempt.findUnique({ where: { id }, include: { mockTest: true } })
    } catch {
      return null
    }
  },

  async create(data: any) {
    try {
      return await prisma.attempt.create({
        data: data as any,
        include: { mockTest: true },
      })
    } catch (e) {
      console.error("Failed to create attempt:", e)
      return null
    }
  },

  async getStats(userId: string) {
    try {
      const attempts = await prisma.attempt.findMany({
        where: { userId, status: "COMPLETED" },
        include: { mockTest: true },
      })
      return attempts
    } catch {
      return []
    }
  },

  async getSubjectStats(userId: string) {
    try {
      const attempts = await prisma.attempt.findMany({
        where: { userId, status: "COMPLETED" },
        include: { mockTest: true },
      })
      const bySubject: Record<string, { count: number; totalScore: number; totalAccuracy: number }> = {}
      for (const a of attempts) {
        const subject = a.mockTest?.subject ?? "Unknown"
        if (!bySubject[subject]) bySubject[subject] = { count: 0, totalScore: 0, totalAccuracy: 0 }
        bySubject[subject].count++
        bySubject[subject].totalScore += a.score
        bySubject[subject].totalAccuracy += a.accuracy
      }
      return Object.entries(bySubject).map(([subject, s]) => ({
        subject,
        attempts: s.count,
        averageScore: Math.round(s.totalScore / s.count),
        averageAccuracy: Math.round(s.totalAccuracy / s.count),
      }))
    } catch {
      return []
    }
  },

  async saveQuestionAnswers(answers: Array<{
    userId: string
    attemptId: string
    questionId: string
    selectedOption: number | null
    timeSpent: number
    markedForReview: boolean
    isCorrect: boolean | null
  }>) {
    try {
      await prisma.userMockTestQuestionAttemptAnswer.createMany({
        data: answers,
        skipDuplicates: true,
      })
    } catch (e) {
      console.error("Failed to save question answers:", e)
    }
  },
}
