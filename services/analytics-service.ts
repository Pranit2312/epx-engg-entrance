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

    const totalAttempts = attempts.length
    const averageScore = totalAttempts > 0 ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / totalAttempts) : 0
    const averageAccuracy = totalAttempts > 0 ? Math.round(attempts.reduce((s, a) => s + a.accuracy, 0) / totalAttempts) : 0

    let bestScore = 0
    let bestTestName: string | null = null
    const bySubject: Record<string, { count: number; totalScore: number; totalAccuracy: number }> = {}
    for (const a of attempts) {
      if (a.score > bestScore) {
        bestScore = a.score
        bestTestName = a.mockTest?.name ?? null
      }
      const subject = a.mockTest?.subject ?? "Unknown"
      if (!bySubject[subject]) bySubject[subject] = { count: 0, totalScore: 0, totalAccuracy: 0 }
      bySubject[subject].count++
      bySubject[subject].totalScore += a.score
      bySubject[subject].totalAccuracy += a.accuracy
    }

    const subjectPerformance = Object.entries(bySubject).map(([subject, s]) => ({
      subject,
      attempts: s.count,
      averageScore: Math.round(s.totalScore / s.count),
      averageAccuracy: Math.round(s.totalAccuracy / s.count),
    }))

    const totalTimeSpent = attempts.reduce((s, a) => s + a.timeTaken, 0)
    const currentStreak = calculateStreak(attempts)

    const scoreHistory = attempts.slice(0, 20).map((a) => ({
      date: a.createdAt.toISOString().split("T")[0],
      score: a.score,
      testName: a.mockTest?.name ?? "Unknown",
    }))

    const weakTopics = subjectPerformance.filter((s) => s.averageScore < 60).map((s) => s.subject)
    const strongTopics = subjectPerformance.filter((s) => s.averageScore >= 80).map((s) => s.subject)

    const recommendedTests: AnalyticsOverview["recommendedTests"] = []

    return {
      totalAttempts,
      averageScore,
      averageAccuracy,
      bestScore,
      bestTestName,
      totalTimeSpent,
      currentStreak,
      subjectPerformance,
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
