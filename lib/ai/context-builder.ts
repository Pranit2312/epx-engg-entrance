import { prisma } from "@/lib/prisma"
import { getDemoAnalytics, seedDefaultWeakTopics } from "@/lib/services/analytics"
import { MentorContext } from "@/lib/services/ai-service"
import { classifyIntent } from "@/lib/ai/intent-classifier"

export interface MentorRequestContext {
  intent: ReturnType<typeof classifyIntent>
  shouldUseAnalytics: boolean
  context: MentorContext
  isDemo: boolean
}

export async function buildMentorContext(input: {
  userId: string
  message: string
  targetExam: string
  userName?: string | null
  preferredSubjects?: string[]
}): Promise<MentorRequestContext> {
  const intent = classifyIntent(input.message)
  const shouldUseAnalytics = !["greeting", "motivation", "explain-concept", "solve-doubt", "general-conversation"].includes(intent)

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { targetExam: true, preferredSubjects: true, name: true },
  })

  const targetExam = input.targetExam || user?.targetExam || "JEE_MAIN"

  const attempts = await prisma.attempt.findMany({
    where: { userId: input.userId, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { mockTest: { select: { name: true, examType: true } } },
  })

  const attemptIds = attempts.map((attempt) => attempt.id)
  const recentScores = attempts.map((attempt) => attempt.score)
  const averageScore = recentScores.length > 0 ? Math.round(recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length) : 0
  const percentiles = attempts.map((attempt) => attempt.percentile).filter((value): value is number => value !== null)
  const latestPercentile = percentiles[0] ?? null
  const latestRank = attempts.find((attempt) => attempt.rank !== null)?.rank ?? null

  let subjectAccuracy: MentorContext["subjectAccuracy"] = []
  let chapterAccuracy: MentorContext["chapterAccuracy"] = []
  let timeSpentPerSubject: MentorContext["timeSpentPerSubject"] = []

  if (shouldUseAnalytics && attemptIds.length > 0) {
    const answerRecords = await prisma.userMockTestQuestionAttemptAnswer.findMany({
      where: { userId: input.userId, attemptId: { in: attemptIds } },
      include: { question: { select: { subject: true, chapter: true, topic: true } } },
    })

    const subjectStats = new Map<string, { correct: number; total: number; timeSpent: number }>()
    const chapterStats = new Map<string, { correct: number; total: number }>()

    for (const record of answerRecords) {
      const subject = record.question.subject
      const subjectCurrent = subjectStats.get(subject) || { correct: 0, total: 0, timeSpent: 0 }
      if (record.isCorrect === true) subjectCurrent.correct++
      if (record.isCorrect !== null) subjectCurrent.total++
      subjectCurrent.timeSpent += record.timeSpent || 0
      subjectStats.set(subject, subjectCurrent)

      const chapterKey = `${record.question.subject}|${record.question.chapter || "unknown"}`
      const chapterCurrent = chapterStats.get(chapterKey) || { correct: 0, total: 0 }
      if (record.isCorrect === true) chapterCurrent.correct++
      if (record.isCorrect !== null) chapterCurrent.total++
      chapterStats.set(chapterKey, chapterCurrent)
    }

    subjectAccuracy = Array.from(subjectStats.entries()).map(([subject, stats]) => ({
      subject,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      correct: stats.correct,
      total: stats.total,
      timeSpent: stats.timeSpent,
    }))

    chapterAccuracy = Array.from(chapterStats.entries()).map(([key, stats]) => {
      const [subject, chapter] = key.split("|")
      return {
        subject,
        chapter,
        accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
        correct: stats.correct,
        total: stats.total,
      }
    })

    timeSpentPerSubject = Array.from(subjectStats.entries()).map(([subject, stats]) => ({
      subject,
      timeMinutes: Math.round(stats.timeSpent / 60),
    }))
  }

  let weakTopics = [] as Array<{ subject: string; chapter: string; topic: string | null; accuracy: number; attempts: number }>

  if (shouldUseAnalytics) {
    weakTopics = await prisma.weakTopic.findMany({
      where: { userId: input.userId },
      orderBy: { accuracy: "asc" },
      take: 15,
    })

    if (weakTopics.length === 0) {
      await seedDefaultWeakTopics(input.userId, targetExam)
      weakTopics = await prisma.weakTopic.findMany({
        where: { userId: input.userId },
        orderBy: { accuracy: "asc" },
        take: 15,
      })
    }
  }

  const hasRealData = attempts.length > 0
  let demo: ReturnType<typeof getDemoAnalytics> | null = null
  if (!hasRealData && shouldUseAnalytics) {
    demo = getDemoAnalytics(targetExam)
    if (subjectAccuracy.length === 0) subjectAccuracy = demo.subjectAccuracy
    if (chapterAccuracy.length === 0) chapterAccuracy = demo.chapterAccuracy
    if (timeSpentPerSubject.length === 0) timeSpentPerSubject = demo.timeSpentPerSubject
  }

  const strongChapters = chapterAccuracy.filter((entry) => entry.accuracy >= 70).map((entry) => `${entry.subject} - ${entry.chapter}`)
  const strongTopics = [
    ...(input.preferredSubjects || user?.preferredSubjects || []),
    ...strongChapters,
    ...(demo?.strongTopics ?? []),
  ]

  const chatHistory = await prisma.chatHistory.findMany({
    where: { userId: input.userId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { role: true, content: true },
  })

  const historyContext = chatHistory
    .reverse()
    .map((entry) => `${entry.role === "user" ? "Student" : "Mentor"}: ${entry.content.substring(0, 200)}`)
    .join("\n")

  const isDemo = !hasRealData && shouldUseAnalytics

  return {
    intent,
    shouldUseAnalytics,
    isDemo,
    context: {
      targetExam,
      name: input.userName ?? user?.name ?? undefined,
      subjectAccuracy,
      chapterAccuracy,
      weakTopics: weakTopics.map((weakTopic) => ({
        subject: weakTopic.subject,
        chapter: weakTopic.chapter,
        topic: weakTopic.topic,
        accuracy: weakTopic.accuracy,
        attempts: weakTopic.attempts,
      })),
      strongTopics,
      recentAttempts: hasRealData ? attempts.length : (demo?.recentAttempts ?? 0),
      averageScore: hasRealData ? averageScore : (demo?.averageScore ?? 0),
      recentScores: hasRealData ? recentScores : (demo?.recentScores ?? []),
      percentiles: hasRealData ? percentiles : (demo?.percentiles ?? []),
      timeSpentPerSubject,
      latestPercentile: hasRealData ? latestPercentile : (demo?.latestPercentile ?? null),
      latestRank: hasRealData ? latestRank : (demo?.latestRank ?? null),
      historyContext: isDemo
        ? `${historyContext}\nNote: This student has no test history yet. The analytics below are based on their initial assessment.`
        : historyContext,
    },
  }
}
