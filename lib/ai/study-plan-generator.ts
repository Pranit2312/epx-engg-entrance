import { generateJsonWithGemini, generateWithRetry } from "./gemini"
import { getCached, setCache, generateCacheKey } from "./cache"
import type { StudyPlanResult, StudyPlanDay } from "./types"

export interface StudyPlanInput {
  targetExam: string
  weakTopics: { subject: string; chapter: string; topic: string | null; accuracy: number }[]
  strongSubjects: string[]
  availableHoursPerDay: number
  durationDays: 7 | 15 | 30
}

const STUDY_PLAN_SYSTEM_PROMPT = `You are an expert academic planner for Indian engineering entrance exams.
Create a detailed, realistic study plan.

Return JSON with this exact structure:
{
  "title": "string - plan title",
  "description": "string - plan overview",
  "days": [{
    "day": number,
    "focus": "string - main focus area",
    "topics": ["string - topics to study"],
    "hours": number - study hours,
    "tasks": ["string - specific tasks"]
  }]
}

Rules:
- Allocate more time to weak topics
- Include regular revision days
- Include mock test days
- Be realistic about daily hours
- Cover syllabus systematically
- Follow exam weightage distribution`

function buildStudyPlanPrompt(input: StudyPlanInput): string {
  return `Create a ${input.durationDays}-day study plan for ${input.targetExam} preparation.

Available study hours per day: ${input.availableHoursPerDay}

Weak areas (need more focus):
${input.weakTopics.map((w) => `  - ${w.subject}/${w.chapter}${w.topic ? `/${w.topic}` : ""} (accuracy: ${w.accuracy}%)`).join("\n")}

Strong subjects (less time needed):
${input.strongSubjects.map((s) => `  - ${s}`).join("\n")}

Create a day-by-day study plan with specific topics, hours, and tasks. Include revision days and mock tests.`
}

export async function generateStudyPlan(
  userId: string,
  input: StudyPlanInput
): Promise<StudyPlanResult> {
  const cacheKey = generateCacheKey("studyplan", userId, `days_${input.durationDays}`)
  const cached = getCached<StudyPlanResult>(cacheKey)
  if (cached) return cached

  const prompt = buildStudyPlanPrompt(input)

  const result = await generateWithRetry(() =>
    generateJsonWithGemini<StudyPlanResult>(prompt, STUDY_PLAN_SYSTEM_PROMPT)
  )

  setCache(cacheKey, result, 30 * 60 * 1000)
  return result
}

export function calculatePlanDateRange(durationDays: 7 | 15 | 30): { startDate: Date; endDate: Date } {
  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + durationDays)
  return { startDate, endDate }
}
