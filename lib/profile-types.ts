import type { ExamType } from "@prisma/client"
import { EXAMS } from "@/config/exams"
import { SUBJECTS } from "@/config/subjects"

export type UserProfile = {
  id: string
  email: string
  name: string | null
  username: string | null
  image: string | null
  bio: string | null
  targetExam: ExamType | null
  preferredSubjects: string[]
  emailNotifications: boolean
  testReminders: boolean
  createdAt: string
  updatedAt: string
  stats: {
    testsAttempted: number
    averageScore: number
    averageAccuracy: number
    bestScore: number
    currentStreak: number
  }
}

export type UpdateProfileInput = {
  name?: string
  username?: string
  image?: string | null
  bio?: string | null
  targetExam?: ExamType | null
  preferredSubjects?: string[]
}

export type UpdateSettingsInput = {
  emailNotifications?: boolean
  testReminders?: boolean
}

export const EXAM_OPTIONS = EXAMS.map((e) => ({ value: e.value, label: e.label }))
export const SUBJECT_OPTIONS = SUBJECTS as readonly string[]
