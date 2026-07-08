import bcrypt from "bcryptjs"
import type { Prisma, ExamType } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { UpdateProfileInput, UpdateSettingsInput, UserProfile } from "@/lib/profile-types"
import { mockTests as fallbackTests } from "@/lib/data/mock-tests"
import { analyticsService } from "@/services/analytics-service"

const emptyStats: UserProfile["stats"] = {
  testsAttempted: 0,
  averageScore: 0,
  averageAccuracy: 0,
  bestScore: 0,
  currentStreak: 0,
}

function generateUsername(email: string) {
  const base = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase()
  return base || `user_${Date.now()}`
}

function toProfileUser(user: any, stats: UserProfile["stats"]): UserProfile {
  return {
    id: user.id ?? "",
    email: user.email ?? "",
    name: user.name ?? null,
    username: user.username ?? null,
    image: user.image ?? null,
    bio: user.bio ?? null,
    targetExam: user.targetExam ?? null,
    preferredSubjects: user.preferredSubjects ?? [],
    emailNotifications: user.emailNotifications ?? true,
    testReminders: user.testReminders ?? true,
    createdAt: user.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: user.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    stats,
  }
}

async function getProfileStats(userId: string): Promise<UserProfile["stats"]> {
  try {
    const dashboard = await getDashboardData(userId)
    const attempts = await getAttemptsForUser(userId)
    const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : 0
    const streak = attempts.length > 0 ? analyticsService.calculateStreak(attempts) : 0
    return {
      testsAttempted: dashboard.testsAttempted,
      averageScore: dashboard.averageScore,
      averageAccuracy: dashboard.averageAccuracy,
      bestScore,
      currentStreak: streak,
    }
  } catch {
    return { ...emptyStats }
  }
}

export async function findUserById(id: string) {
  try {
    return await prisma.user.findUnique({ where: { id } })
  } catch {
    return null
  }
}

export async function findUserByEmail(email: string) {
  try {
    return await prisma.user.findUnique({ where: { email } })
  } catch {
    return null
  }
}

async function findUserByUsername(username: string) {
  try {
    return await prisma.user.findUnique({ where: { username } })
  } catch {
    return null
  }
}

export async function createUser(input: { email: string; password: string; name?: string | null }) {
  try {
    const hashedPassword = await bcrypt.hash(input.password, 12)
    const username = generateUsername(input.email)
    return await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name ?? null,
        username,
        role: 'STUDENT',
      },
    })
  } catch {
    return null
  }
}

export async function verifyPassword(candidatePassword: string, storedHash: string) {
  try {
    return await bcrypt.compare(candidatePassword, storedHash)
  } catch {
    return false
  }
}

export async function getTests() {
  try {
    const tests = await prisma.mockTest.findMany({
      orderBy: { createdAt: "asc" },
    })
    if (tests.length > 0) return tests
    const createdTests = await Promise.all(
      fallbackTests.map(async (test) => {
        return prisma.mockTest.create({
          data: {
            name: test.name,
            examType: test.examType as any,
            subject: test.subject as any,
            duration: test.duration,
            totalQuestions: test.totalQuestions,
            difficulty: test.difficulty as any,
            description: test.description ?? null,
          },
        })
      })
    )
    return createdTests
  } catch {
    return fallbackTests as any
  }
}

export async function getTestById(id: string) {
  try {
    return await prisma.mockTest.findUnique({ where: { id } })
  } catch {
    return null
  }
}

export async function getQuestionsForTest(testId: string, count: number) {
  try {
    const { prisma } = await import("@/lib/prisma")
    const questions = await prisma.question.findMany({
      where: { mockTestId: testId },
      take: count
    })
    return questions
  } catch {
    return []
  }
}

export async function getDashboardData(userId: string) {
  try {
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
  } catch {
    return { totalTests: 0, testsAttempted: 0, averageScore: 0, averageAccuracy: 0, recentTests: [], recommendedTests: [] }
  }
}

export async function getAttemptsForUser(userId: string) {
  try {
    return await prisma.attempt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { mockTest: true },
    })
  } catch {
    return []
  }
}

export async function getAttemptById(id: string) {
  try {
    return await prisma.attempt.findUnique({ where: { id } })
  } catch {
    return null
  }
}

export async function submitAttempt(input: {
  userId: string
  mockTestId: string
  score: number
  correct: number
  incorrect: number
  totalQuestions: number
  accuracy: number
  timeTaken: number
  answers: Record<string, number>
  markedForReview: string[]
  status?: "IN_PROGRESS" | "COMPLETED" | "ABANDONED"
  startedAt: Date
  submittedAt?: Date | null
}) {
  try {
    const unattempted = input.totalQuestions - input.correct - input.incorrect
    return await prisma.attempt.create({
      data: {
        userId: input.userId,
        mockTestId: input.mockTestId,
        score: input.score,
        maxScore: 100,
        correct: input.correct,
        incorrect: input.incorrect,
        unattempted,
        accuracy: input.accuracy,
        timeTaken: input.timeTaken,
        answers: input.answers as unknown as Prisma.JsonObject,
        status: input.status ?? "COMPLETED",
        startedAt: input.startedAt,
        submittedAt: input.submittedAt ?? new Date(),
      },
    })
  } catch {
    return null
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const user = await findUserById(userId)
    if (!user) return null
    const stats = await getProfileStats(userId)
    return toProfileUser(user, stats)
  } catch {
    return null
  }
}

export async function updateUserProfile(userId: string, input: UpdateProfileInput): Promise<UserProfile | null> {
  try {
    if (input.username) {
      const existing = await findUserByUsername(input.username)
      if (existing && existing.id !== userId) {
        throw new Error("Username is already taken")
      }
    }
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        username: input.username,
        image: input.image,
        bio: input.bio,
        targetExam: input.targetExam as ExamType | null | undefined,
        preferredSubjects: input.preferredSubjects,
      },
    })
    const stats = await getProfileStats(userId)
    return toProfileUser(updated, stats)
  } catch (e) {
    if (e instanceof Error && e.message === "Username is already taken") throw e
    return null
  }
}

export async function updateUserSettings(userId: string, input: UpdateSettingsInput): Promise<UserProfile | null> {
  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: input,
    })
    const stats = await getProfileStats(userId)
    return toProfileUser(updated, stats)
  } catch {
    return null
  }
}

export async function changeUserPassword(userId: string, currentPassword: string, newPassword: string) {
  try {
    const user = await findUserById(userId)
    if (!user) throw new Error("User not found")
    const valid = await verifyPassword(currentPassword, user.password)
    if (!valid) throw new Error("Current password is incorrect")
    if (newPassword.length < 6) throw new Error("Password must be at least 6 characters")
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })
    return { success: true }
  } catch (e) {
    if (e instanceof Error) throw e
    return { success: false }
  }
}

export async function deleteUserAccount(userId: string, password: string) {
  try {
    const user = await findUserById(userId)
    if (!user) throw new Error("User not found")
    const valid = await verifyPassword(password, user.password)
    if (!valid) throw new Error("Password is incorrect")
    await prisma.user.delete({ where: { id: userId } })
    return { success: true }
  } catch (e) {
    if (e instanceof Error) throw e
    return { success: false }
  }
}
