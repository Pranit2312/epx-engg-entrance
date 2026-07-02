import bcrypt from "bcryptjs"
import type { Prisma } from "@prisma/client"
import { mockTests as fallbackTests } from "@/lib/data/mock-tests"
import { generateMockQuestions } from "@/lib/data/mock-questions"
import { prisma, isPrismaAvailable } from "@/lib/prisma"

type StoredUser = {
  id: string
  name?: string | null
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

type StoredAttempt = {
  id: string
  userId: string
  mockTestId: string
  score: number
  correct: number
  incorrect: number
  accuracy: number
  timeTaken: number
  answers: Record<string, number>
  markedForReview: string[]
  status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED"
  startedAt: Date
  submittedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

type StoredAnswerRecord = {
  id: string
  userId: string
  attemptId: string
  questionId: string
  selectedOption?: number | null
  markedForReview: boolean
  createdAt: Date
  updatedAt: Date
}

const memoryState = {
  users: [] as StoredUser[],
  attempts: [] as StoredAttempt[],
  answerRecords: [] as StoredAnswerRecord[],
}

let seeded = false

function ensureSeeded() {
  if (seeded) return

  memoryState.users = []
  memoryState.attempts = []
  memoryState.answerRecords = []
  seeded = true
}

function toMockTest(test: (typeof fallbackTests)[number]) {
  return {
    ...test,
    description: test.description ?? "Premium practice test",
  }
}

export async function findUserByEmail(email: string) {
  if (!isPrismaAvailable()) {
    ensureSeeded()
    return memoryState.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null
  }

  return prisma.user.findUnique({ where: { email } })
}

export async function createUser(input: { email: string; password: string; name?: string | null }) {
  if (!isPrismaAvailable()) {
    ensureSeeded()
    const existing = memoryState.users.find((user) => user.email.toLowerCase() === input.email.toLowerCase())
    if (existing) {
      throw new Error("User already exists")
    }

    const hashedPassword = await bcrypt.hash(input.password, 12)
    const user: StoredUser = {
      id: `user_${Date.now()}`,
      email: input.email,
      name: input.name ?? null,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    memoryState.users.push(user)
    return user
  }

  const hashedPassword = await bcrypt.hash(input.password, 12)
  return prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      name: input.name ?? null,
    },
  })
}

export async function verifyPassword(candidatePassword: string, storedHash: string) {
  return bcrypt.compare(candidatePassword, storedHash)
}

export async function getTests() {
  if (!isPrismaAvailable()) {
    ensureSeeded()
    return fallbackTests.map(toMockTest)
  }

  const tests = await prisma.mockTest.findMany({
    orderBy: { createdAt: "asc" },
  })

  if (tests.length > 0) {
    return tests
  }

  return fallbackTests.map(toMockTest)
}

export async function getTestById(id: string) {
  if (!isPrismaAvailable()) {
    ensureSeeded()
    return fallbackTests.find((test) => test.id === id) ? toMockTest(fallbackTests.find((test) => test.id === id)!) : null
  }

  const test = await prisma.mockTest.findUnique({ where: { id } })
  return test
}

export async function getQuestionsForTest(testId: string, count: number) {
  return generateMockQuestions(count)
}

export async function getDashboardData(userId: string) {
  const attempts = await getAttemptsForUser(userId)
  const tests = await getTests()
  const attemptedTests = attempts.length
  const averageScore = attemptedTests > 0 ? Math.round(attempts.reduce((sum, item) => sum + item.score, 0) / attemptedTests) : 0
  const averageAccuracy = attemptedTests > 0 ? Math.round(attempts.reduce((sum, item) => sum + item.accuracy, 0) / attemptedTests) : 0

  return {
    totalTests: tests.length,
    testsAttempted: attemptedTests,
    averageScore,
    averageAccuracy,
    recentTests: attempts.slice(0, 3),
    recommendedTests: tests.slice(0, 3),
  }
}

export async function getAttemptsForUser(userId: string) {
  if (!isPrismaAvailable()) {
    ensureSeeded()
    return memoryState.attempts.filter((attempt) => attempt.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  const attempts = await prisma.attempt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })

  return attempts
}

export async function getAttemptById(id: string) {
  if (!isPrismaAvailable()) {
    ensureSeeded()
    return memoryState.attempts.find((attempt) => attempt.id === id) ?? null
  }

  return prisma.attempt.findUnique({ where: { id } })
}

export async function submitAttempt(input: {
  userId: string
  mockTestId: string
  score: number
  correct: number
  incorrect: number
  accuracy: number
  timeTaken: number
  answers: Record<string, number>
  markedForReview: string[]
  status?: "IN_PROGRESS" | "COMPLETED" | "ABANDONED"
  startedAt: Date
  submittedAt?: Date | null
}) {
  if (!isPrismaAvailable()) {
    ensureSeeded()
    const attempt: StoredAttempt = {
      id: `attempt_${Date.now()}`,
      userId: input.userId,
      mockTestId: input.mockTestId,
      score: input.score,
      correct: input.correct,
      incorrect: input.incorrect,
      accuracy: input.accuracy,
      timeTaken: input.timeTaken,
      answers: input.answers,
      markedForReview: input.markedForReview,
      status: input.status ?? "COMPLETED",
      startedAt: input.startedAt,
      submittedAt: input.submittedAt ?? new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    memoryState.attempts.push(attempt)

    Object.entries(input.answers).forEach(([questionId, selectedOption]) => {
      memoryState.answerRecords.push({
        id: `answer_${Date.now()}_${questionId}`,
        userId: input.userId,
        attemptId: attempt.id,
        questionId,
        selectedOption,
        markedForReview: input.markedForReview.includes(questionId),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    })

    return attempt
  }

  const attempt = await prisma.attempt.create({
    data: {
      userId: input.userId,
      mockTestId: input.mockTestId,
      score: input.score,
      correct: input.correct,
      incorrect: input.incorrect,
      accuracy: input.accuracy,
      timeTaken: input.timeTaken,
      answers: input.answers as unknown as Prisma.JsonObject,
      status: input.status ?? "COMPLETED",
      startedAt: input.startedAt,
      submittedAt: input.submittedAt ?? new Date(),
    },
  })

  return attempt
}
