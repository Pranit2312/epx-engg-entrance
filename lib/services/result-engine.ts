import { prisma } from "@/lib/prisma"

export interface ResultAnalysis {
  score: number
  maxScore: number
  correct: number
  incorrect: number
  unattempted: number
  accuracy: number
  percentile?: number
  rank?: number
  timeTaken: number
  subjectWise: SubjectWiseAnalysis[]
  chapterWise: ChapterWiseAnalysis[]
  topicWise: TopicWiseAnalysis[]
  difficultyWise: DifficultyWiseAnalysis
}

export interface SubjectWiseAnalysis {
  subject: string
  total: number
  correct: number
  incorrect: number
  unattempted: number
  accuracy: number
  timeSpent: number
  avgTimePerQuestion: number
}

export interface ChapterWiseAnalysis {
  subject: string
  chapter: string
  total: number
  correct: number
  incorrect: number
  unattempted: number
  accuracy: number
  weakArea: boolean
}

export interface TopicWiseAnalysis {
  subject: string
  chapter: string
  topic: string
  total: number
  correct: number
  accuracy: number
}

export interface DifficultyWiseAnalysis {
  easy: { total: number; correct: number; accuracy: number }
  medium: { total: number; correct: number; accuracy: number }
  hard: { total: number; correct: number; accuracy: number }
}

export async function analyzeAttempt(attemptId: string): Promise<ResultAnalysis> {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      answerRecords: {
        include: {
          question: true
        }
      },
      mockTest: true
    }
  })

  if (!attempt) {
    throw new Error('Attempt not found')
  }

  const questions = attempt.answerRecords.map(ar => ar.question)
  const totalQuestions = questions.length
  const maxScore = attempt.mockTest.marksPerQuestion * totalQuestions

  // Calculate subject-wise analysis
  const subjectMap = new Map<string, SubjectWiseAnalysis>()
  
  for (const answerRecord of attempt.answerRecords) {
    const question = answerRecord.question
    const subject = question.subject || 'General'
    
    if (!subjectMap.has(subject)) {
      subjectMap.set(subject, {
        subject,
        total: 0,
        correct: 0,
        incorrect: 0,
        unattempted: 0,
        accuracy: 0,
        timeSpent: 0,
        avgTimePerQuestion: 0
      })
    }
    
    const analysis = subjectMap.get(subject)!
    analysis.total++
    analysis.timeSpent += answerRecord.timeSpent || 0
    
    if (answerRecord.selectedOption === null) {
      analysis.unattempted++
    } else if (answerRecord.isCorrect) {
      analysis.correct++
    } else {
      analysis.incorrect++
    }
  }

  // Calculate accuracy and avg time for each subject
  for (const [subject, analysis] of subjectMap) {
    analysis.accuracy = analysis.total > 0 ? (analysis.correct / analysis.total) * 100 : 0
    analysis.avgTimePerQuestion = analysis.total > 0 ? analysis.timeSpent / analysis.total : 0
  }

  const subjectWise = Array.from(subjectMap.values())

  // Calculate chapter-wise analysis
  const chapterMap = new Map<string, ChapterWiseAnalysis>()
  
  for (const answerRecord of attempt.answerRecords) {
    const question = answerRecord.question
    const subject = question.subject || 'General'
    const chapter = question.chapter || 'General'
    const key = `${subject}-${chapter}`
    
    if (!chapterMap.has(key)) {
      chapterMap.set(key, {
        subject,
        chapter,
        total: 0,
        correct: 0,
        incorrect: 0,
        unattempted: 0,
        accuracy: 0,
        weakArea: false
      })
    }
    
    const analysis = chapterMap.get(key)!
    analysis.total++
    
    if (answerRecord.selectedOption === null) {
      analysis.unattempted++
    } else if (answerRecord.isCorrect) {
      analysis.correct++
    } else {
      analysis.incorrect++
    }
  }

  // Calculate accuracy and identify weak areas
  for (const [key, analysis] of chapterMap) {
    analysis.accuracy = analysis.total > 0 ? (analysis.correct / analysis.total) * 100 : 0
    analysis.weakArea = analysis.accuracy < 50 && analysis.total >= 3
  }

  const chapterWise = Array.from(chapterMap.values())

  // Calculate topic-wise analysis
  const topicMap = new Map<string, TopicWiseAnalysis>()
  
  for (const answerRecord of attempt.answerRecords) {
    const question = answerRecord.question
    const subject = question.subject || 'General'
    const chapter = question.chapter || 'General'
    const topic = question.topic || 'General'
    const key = `${subject}-${chapter}-${topic}`
    
    if (!topicMap.has(key)) {
      topicMap.set(key, {
        subject,
        chapter,
        topic,
        total: 0,
        correct: 0,
        accuracy: 0
      })
    }
    
    const analysis = topicMap.get(key)!
    analysis.total++
    
    if (answerRecord.isCorrect) {
      analysis.correct++
    }
  }

  // Calculate accuracy for each topic
  for (const [key, analysis] of topicMap) {
    analysis.accuracy = analysis.total > 0 ? (analysis.correct / analysis.total) * 100 : 0
  }

  const topicWise = Array.from(topicMap.values())

  // Calculate difficulty-wise analysis
  const difficultyWise: DifficultyWiseAnalysis = {
    easy: { total: 0, correct: 0, accuracy: 0 },
    medium: { total: 0, correct: 0, accuracy: 0 },
    hard: { total: 0, correct: 0, accuracy: 0 }
  }

  for (const answerRecord of attempt.answerRecords) {
    const question = answerRecord.question
    const difficulty = question.difficulty || 'MEDIUM'
    
    if (difficultyWise[difficulty.toLowerCase() as keyof typeof difficultyWise]) {
      const analysis = difficultyWise[difficulty.toLowerCase() as keyof typeof difficultyWise]
      analysis.total++
      if (answerRecord.isCorrect) {
        analysis.correct++
      }
    }
  }

  // Calculate accuracy for each difficulty
  for (const difficulty of ['easy', 'medium', 'hard']) {
    const analysis = difficultyWise[difficulty as keyof typeof difficultyWise]
    analysis.accuracy = analysis.total > 0 ? (analysis.correct / analysis.total) * 100 : 0
  }

  // Calculate percentile
  const percentile = await calculatePercentile(attempt.score, attempt.mockTest.id)

  // Calculate rank
  const rank = await calculateRank(attempt.score, attempt.mockTest.id)

  return {
    score: attempt.score,
    maxScore,
    correct: attempt.correct,
    incorrect: attempt.incorrect,
    unattempted: attempt.unattempted,
    accuracy: attempt.accuracy,
    percentile,
    rank,
    timeTaken: attempt.timeTaken,
    subjectWise,
    chapterWise,
    topicWise,
    difficultyWise
  }
}

async function calculatePercentile(score: number, mockTestId: string): Promise<number> {
  const allAttempts = await prisma.attempt.findMany({
    where: { mockTestId, status: 'COMPLETED' },
    select: { score: true }
  })

  if (allAttempts.length === 0) return 100

  const lowerScores = allAttempts.filter(a => a.score < score).length
  return Math.round((lowerScores / allAttempts.length) * 100)
}

async function calculateRank(score: number, mockTestId: string): Promise<number> {
  const higherScores = await prisma.attempt.count({
    where: {
      mockTestId,
      status: 'COMPLETED',
      score: { gt: score }
    }
  })

  return higherScores + 1
}

export async function generatePerformanceInsights(userId: string) {
  const recentAttempts = await prisma.attempt.findMany({
    where: { userId, status: 'COMPLETED' },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      mockTest: true
    }
  })

  if (recentAttempts.length === 0) {
    return {
      averageScore: 0,
      averageAccuracy: 0,
      improvementTrend: 0,
      strongSubjects: [],
      weakSubjects: [],
      recommendations: []
    }
  }

  const averageScore = recentAttempts.reduce((sum, a) => sum + a.score, 0) / recentAttempts.length
  const averageAccuracy = recentAttempts.reduce((sum, a) => sum + a.accuracy, 0) / recentAttempts.length

  // Calculate improvement trend (compare first 5 with last 5)
  const firstHalf = recentAttempts.slice(-5)
  const secondHalf = recentAttempts.slice(0, 5)
  
  const firstHalfAvg = firstHalf.length > 0 ? firstHalf.reduce((sum, a) => sum + a.score, 0) / firstHalf.length : 0
  const secondHalfAvg = secondHalf.length > 0 ? secondHalf.reduce((sum, a) => sum + a.score, 0) / secondHalf.length : 0
  
  const improvementTrend = secondHalfAvg - firstHalfAvg

  // Identify strong and weak subjects
  const subjectPerformance = new Map<string, { correct: number; total: number }>()
  
  for (const attempt of recentAttempts) {
    const answerRecords = await prisma.userMockTestQuestionAttemptAnswer.findMany({
      where: { attemptId: attempt.id },
      include: { question: true }
    })

    for (const ar of answerRecords) {
      const subject = ar.question.subject || 'General'
      if (!subjectPerformance.has(subject)) {
        subjectPerformance.set(subject, { correct: 0, total: 0 })
      }
      const perf = subjectPerformance.get(subject)!
      perf.total++
      if (ar.isCorrect) perf.correct++
    }
  }

  const strongSubjects: string[] = []
  const weakSubjects: string[] = []

  for (const [subject, perf] of subjectPerformance) {
    const accuracy = (perf.correct / perf.total) * 100
    if (accuracy >= 75) {
      strongSubjects.push(subject)
    } else if (accuracy <= 50) {
      weakSubjects.push(subject)
    }
  }

  // Generate recommendations
  const recommendations: string[] = []
  
  if (improvementTrend < 0) {
    recommendations.push("Your performance has been declining recently. Focus on revising weak topics.")
  } else if (improvementTrend > 5) {
    recommendations.push("Great improvement! Keep up the momentum.")
  }

  if (averageAccuracy < 60) {
    recommendations.push("Focus on improving accuracy by practicing more questions.")
  }

  if (weakSubjects.length > 0) {
    recommendations.push(`Pay special attention to: ${weakSubjects.join(', ')}`)
  }

  return {
    averageScore: Math.round(averageScore),
    averageAccuracy: Math.round(averageAccuracy),
    improvementTrend: Math.round(improvementTrend),
    strongSubjects,
    weakSubjects,
    recommendations
  }
}
