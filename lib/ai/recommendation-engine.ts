import { generateJsonWithGemini, generateWithRetry } from "./gemini"
import { getCached, setCache, generateCacheKey } from "./cache"
import type { WeakTopicResult } from "./types"

export interface RecommendationInput {
  weakTopics: WeakTopicResult[]
  strongSubjects: string[]
  recentScores: number[]
  targetExam: string
  availableStudyHours: number
  testHistory: { testId: string; testName: string; score: number; subject: string }[]
}

export interface RecommendationOutput {
  recommendedTopics: { topic: string; priority: "high" | "medium" | "low"; reason: string }[]
  recommendedTests: { testName: string; reason: string }[]
  revisionPriorities: string[]
  dailyGoals: string[]
}

const RECOMMENDATION_SYSTEM_PROMPT = `You are an AI study coach for engineering entrance exams in India.
Generate personalized recommendations based on the student's performance data.

Return JSON with this exact structure:
{
  "recommendedTopics": [{ "topic": "string", "priority": "high"|"medium"|"low", "reason": "string" }],
  "recommendedTests": [{ "testName": "string", "reason": "string" }],
  "revisionPriorities": ["string"],
  "dailyGoals": ["string"]
}

Focus on actionable, specific recommendations. Consider the target exam's syllabus weightage.`

function buildRecommendationPrompt(input: RecommendationInput): string {
  return `Generate personalized study recommendations for a student preparing for ${input.targetExam}.

Their performance profile:
- Available study hours per day: ${input.availableStudyHours}
- Recent test scores: [${input.recentScores.join(", ")}]
- Strong subjects: [${input.strongSubjects.join(", ")}]

Weak areas detected:
${input.weakTopics.map((w) => `  - ${w.subject}/${w.chapter}${w.topic ? `/${w.topic}` : ""}: accuracy ${w.accuracy}% (${w.attempts} attempts, severity: ${w.severity})`).join("\n")}

Test history:
${input.testHistory.map((t) => `  - ${t.testName} (${t.subject}): ${t.score}%`).join("\n")}

Provide recommended topics to study, tests to take, revision priorities, and daily goals.`
}

export async function generateRecommendations(
  userId: string,
  input: RecommendationInput
): Promise<RecommendationOutput> {
  const cacheKey = generateCacheKey("recommendations", userId)
  const cached = getCached<RecommendationOutput>(cacheKey)
  if (cached) return cached

  const prompt = buildRecommendationPrompt(input)

  const result = await generateWithRetry(() =>
    generateJsonWithGemini<RecommendationOutput>(prompt, RECOMMENDATION_SYSTEM_PROMPT)
  )

  setCache(cacheKey, result, 15 * 60 * 1000)
  return result
}
