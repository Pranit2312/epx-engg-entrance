import { attemptRepo } from "@/repositories/attempt-repository"
import { testRepo } from "@/repositories/test-repository"

export type SubjectPerformance = {
  subject: string
  attempts: number
  averageScore: number
  averageAccuracy: number
}

export type AnalyticsOverview = {
  totalAttempts: number
  averageScore: number
  averageAccuracy: number
  bestScore: number
  bestTestName: string | null
  totalTimeSpent: number
  currentStreak: number
  subjectPerformance: SubjectPerformance[]
  scoreHistory: { date: string; score: number; testName: string }[]
  weakTopics: string[]
  strongTopics: string[]
  recommendedTests: Array<{ id: string; name: string; subject: string; duration: number; totalQuestions: number; difficulty: string; description?: string | null }>
}

function calculateStreak(attempts: { createdAt: Date }[]): number {
  if (attempts.length === 0) return 0
  const dates = [...new Set(attempts.map((a) => a.createdAt.toISOString().split("T")[0]))].sort().reverse()
  let streak = 0
  const today = new Date()
  let checkDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  for (const dateStr of dates) {
    const attemptDate = new Date(dateStr + "T00:00:00")
    const diff = Math.round((checkDate.getTime() - attemptDate.getTime()) / 86400000)
    if (diff === 0) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else if (diff === 1) {
      streak++
      checkDate = attemptDate
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export const analyticsService = {
  async getOverview(userId: string): Promise<AnalyticsOverview> {
    const attempts = await attemptRepo.getStats(userId)
    const subjectStats = await attemptRepo.getSubjectStats(userId)
    const allTests = await testRepo.findAll()

    const totalAttempts = attempts.length
    const averageScore = totalAttempts > 0 ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / totalAttempts) : 0
    const averageAccuracy = totalAttempts > 0 ? Math.round(attempts.reduce((s, a) => s + a.accuracy, 0) / totalAttempts) : 0

    let bestScore = 0
    let bestTestName: string | null = null
    for (const a of attempts) {
      if (a.score > bestScore) {
        bestScore = a.score
        bestTestName = a.mockTest?.name ?? null
      }
    }

    const totalTimeSpent = attempts.reduce((s, a) => s + a.timeTaken, 0)
    const currentStreak = calculateStreak(attempts)

    const scoreHistory = attempts.slice(0, 20).map((a) => ({
      date: a.createdAt.toISOString().split("T")[0],
      score: a.score,
      testName: a.mockTest?.name ?? "Unknown",
    }))

    const weakTopics = subjectStats.filter((s) => s.averageScore < 60).map((s) => s.subject)
    const strongTopics = subjectStats.filter((s) => s.averageScore >= 80).map((s) => s.subject)

    const attemptedTestIds = new Set(attempts.map((a) => a.mockTestId))
    const weakSubjects = new Set(weakTopics)
    const recommendedTests = allTests
      .filter((t) => !attemptedTestIds.has(t.id))
      .sort((a, b) => {
        const aRelevant = weakSubjects.has(a.subject ?? "") ? 1 : 0
        const bRelevant = weakSubjects.has(b.subject ?? "") ? 1 : 0
        return bRelevant - aRelevant
      })
      .slice(0, 3)
      .map((t) => ({
        id: t.id,
        name: t.name,
        subject: t.subject ?? "",
        duration: t.duration,
        totalQuestions: t.totalQuestions,
        difficulty: t.difficulty ?? "MEDIUM",
        description: t.description,
      }))

    return {
      totalAttempts,
      averageScore,
      averageAccuracy,
      bestScore,
      bestTestName,
      totalTimeSpent,
      currentStreak,
      subjectPerformance: subjectStats,
      scoreHistory,
      weakTopics,
      strongTopics,
      recommendedTests,
    }
  },

  async getPerformanceData(userId: string) {
    const attempts = await attemptRepo.getStats(userId)
    return attempts.map((a) => ({
      id: a.id,
      score: a.score,
      accuracy: a.accuracy,
      subject: a.mockTest?.subject ?? "Unknown",
      testName: a.mockTest?.name ?? "Unknown",
      date: a.createdAt.toISOString().split("T")[0],
      timeTaken: a.timeTaken,
    }))
  },

  calculateStreak,
}
