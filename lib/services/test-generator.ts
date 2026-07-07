import { prisma } from "@/lib/prisma"
import { EXAM_CONFIG } from "@/lib/data/mht-cet-syllabus"

export interface TestGenerationConfig {
  examType: string
  subject?: string
  chapter?: string
  difficulty?: string
  totalQuestions?: number
  duration?: number
  isPYQTest?: boolean
  pyqYear?: number
}

export interface GeneratedTest {
  questions: any[]
  config: {
    totalQuestions: number
    duration: number
    marksPerQuestion: number
    negativeMarking: number
  }
}

export async function generateTest(config: TestGenerationConfig): Promise<GeneratedTest> {
  const {
    examType,
    subject,
    chapter,
    difficulty,
    isPYQTest = false,
    pyqYear
  } = config

  // Get exam configuration
  const examConfig = EXAM_CONFIG[examType as keyof typeof EXAM_CONFIG] || EXAM_CONFIG.JEE_MAIN
  const totalQuestions = config.totalQuestions || examConfig.totalQuestions
  const duration = config.duration || examConfig.duration

  // Build query conditions
  const where: any = {
    examType: examType.toUpperCase(),
  }

  if (isPYQTest) {
    where.isPYQ = true
    if (pyqYear) {
      where.pyqYear = pyqYear
    }
  }

  if (subject) {
    where.subject = subject
  }

  if (chapter) {
    where.chapter = chapter
  }

  if (difficulty) {
    where.difficulty = difficulty.toUpperCase()
  }

  // Get available questions
  const availableQuestions = await prisma.question.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  })

  if (availableQuestions.length === 0) {
    throw new Error('No questions available for the given criteria')
  }

  // Generate test based on exam type
  let selectedQuestions: any[] = []

  if (examType === 'MHT_CET' && !subject) {
    // MHT-CET: Balanced subject distribution (50 each for Physics, Chemistry, Mathematics)
    selectedQuestions = await generateBalancedTest(
      availableQuestions,
      { Physics: 50, Chemistry: 50, Mathematics: 50 },
      totalQuestions
    )
  } else if (examType === 'JEE_MAIN' && !subject) {
    // JEE Main: Balanced subject distribution (25 each for Physics, Chemistry, Mathematics)
    selectedQuestions = await generateBalancedTest(
      availableQuestions,
      { Physics: 25, Chemistry: 25, Mathematics: 25 },
      totalQuestions
    )
  } else if (examType === 'JEE_ADVANCED' && !subject) {
    // JEE Advanced: Balanced subject distribution (18 each for Physics, Chemistry, Mathematics)
    selectedQuestions = await generateBalancedTest(
      availableQuestions,
      { Physics: 18, Chemistry: 18, Mathematics: 18 },
      totalQuestions
    )
  } else {
    // Subject-specific or chapter-specific test
    selectedQuestions = await generateRandomTest(availableQuestions, totalQuestions)
  }

  // Shuffle questions
  selectedQuestions = shuffleArray(selectedQuestions)

  // Assign order numbers
  selectedQuestions = selectedQuestions.map((q, index) => ({
    ...q,
    order: index + 1
  }))

  return {
    questions: selectedQuestions,
    config: {
      totalQuestions: selectedQuestions.length,
      duration,
      marksPerQuestion: examConfig.marksPerQuestion,
      negativeMarking: examConfig.negativeMarking
    }
  }
}

async function generateBalancedTest(
  availableQuestions: any[],
  subjectDistribution: { [key: string]: number },
  totalQuestions: number
): Promise<any[]> {
  const selectedQuestions: any[] = []

  for (const [subject, count] of Object.entries(subjectDistribution)) {
    const subjectQuestions = availableQuestions.filter(q => q.subject === subject)
    
    if (subjectQuestions.length < count) {
      console.warn(`Not enough questions for ${subject}. Available: ${subjectQuestions.length}, Required: ${count}`)
    }

    // Select questions with difficulty balancing
    const subjectSelected = await selectQuestionsWithDifficultyBalance(
      subjectQuestions,
      Math.min(count, subjectQuestions.length)
    )

    selectedQuestions.push(...subjectSelected)
  }

  // If we don't have enough questions, fill with remaining questions
  if (selectedQuestions.length < totalQuestions) {
    const remainingNeeded = totalQuestions - selectedQuestions.length
    const usedIds = new Set(selectedQuestions.map(q => q.id))
    const remainingQuestions = availableQuestions.filter(q => !usedIds.has(q.id))
    
    const additional = await selectQuestionsWithDifficultyBalance(
      remainingQuestions,
      Math.min(remainingNeeded, remainingQuestions.length)
    )
    
    selectedQuestions.push(...additional)
  }

  return selectedQuestions.slice(0, totalQuestions)
}

async function selectQuestionsWithDifficultyBalance(
  questions: any[],
  count: number
): Promise<any[]> {
  if (questions.length <= count) {
    return questions
  }

  // Distribute by difficulty: 30% Easy, 50% Medium, 20% Hard
  const easyCount = Math.floor(count * 0.3)
  const mediumCount = Math.floor(count * 0.5)
  const hardCount = count - easyCount - mediumCount

  const easyQuestions = shuffleArray(questions.filter(q => q.difficulty === 'EASY'))
  const mediumQuestions = shuffleArray(questions.filter(q => q.difficulty === 'MEDIUM'))
  const hardQuestions = shuffleArray(questions.filter(q => q.difficulty === 'HARD'))

  const selected: any[] = []

  // Add easy questions
  selected.push(...easyQuestions.slice(0, easyCount))

  // Add medium questions
  selected.push(...mediumQuestions.slice(0, mediumCount))

  // Add hard questions
  selected.push(...hardQuestions.slice(0, hardCount))

  // If we still need more questions, fill with medium difficulty
  if (selected.length < count) {
    const remaining = count - selected.length
    const usedIds = new Set(selected.map(q => q.id))
    const remainingMedium = mediumQuestions.filter(q => !usedIds.has(q.id))
    selected.push(...remainingMedium.slice(0, remaining))
  }

  return selected.slice(0, count)
}

async function generateRandomTest(
  availableQuestions: any[],
  count: number
): Promise<any[]> {
  const shuffled = shuffleArray([...availableQuestions])
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function generateAdaptiveTest(
  userId: string,
  examType: string,
  subject?: string
): Promise<GeneratedTest> {
  // Get user's weak topics from analytics
  const weakTopics = await prisma.weakTopic.findMany({
    where: { userId },
    orderBy: { accuracy: 'asc' },
    take: 5
  })

  // Get user's recent performance
  const recentAttempts = await prisma.attempt.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      mockTest: true
    }
  })

  // Determine difficulty based on performance
  let targetDifficulty = 'MEDIUM'
  if (recentAttempts.length > 0) {
    const avgAccuracy = recentAttempts.reduce((sum, a) => sum + a.accuracy, 0) / recentAttempts.length
    if (avgAccuracy > 80) targetDifficulty = 'HARD'
    else if (avgAccuracy < 50) targetDifficulty = 'EASY'
  }

  // Build query focusing on weak topics
  const where: any = {
    examType: examType.toUpperCase(),
    difficulty: targetDifficulty
  }

  if (subject) {
    where.subject = subject
  } else if (weakTopics.length > 0) {
    // Focus on weak topics
    const weakChapters = weakTopics.map(wt => wt.chapter)
    where.chapter = { in: weakChapters }
  }

  const availableQuestions = await prisma.question.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  })

  const examConfig = EXAM_CONFIG[examType as keyof typeof EXAM_CONFIG] || EXAM_CONFIG.JEE_MAIN
  const selectedQuestions = await selectQuestionsWithDifficultyBalance(
    availableQuestions,
    examConfig.totalQuestions
  )

  return {
    questions: shuffleArray(selectedQuestions).map((q, index) => ({
      ...q,
      order: index + 1
    })),
    config: {
      totalQuestions: selectedQuestions.length,
      duration: examConfig.duration,
      marksPerQuestion: examConfig.marksPerQuestion,
      negativeMarking: examConfig.negativeMarking
    }
  }
}
