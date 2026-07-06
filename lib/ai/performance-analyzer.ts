import { generateJsonWithGemini, generateWithRetry } from "./gemini"
import { getCached, setCache, generateCacheKey } from "./cache"
import type { PerformanceData, AIAnalysisResult, SubjectBreakdown, QuestionDetail } from "./types"

const PERFORMANCE_SYSTEM_PROMPT = `You are an expert engineering entrance exam mentor. Analyze the student's test performance and provide detailed feedback.

Return JSON with this exact structure:
{
  "strengths": ["string - topics where student performed well (accuracy > 80%)"],
  "weakTopics": ["string - specific topics needing improvement"],
  "recommendations": ["string - actionable study recommendations"],
  "nextTests": ["string - recommended test types or subjects to focus on"],
  "studyPlan": ["string - suggested study plan adjustments"]
}

Be specific and actionable. Use the actual subject/chapter names from the data.`

export function buildPerformancePrompt(data: PerformanceData): string {
  const subjectLines = data.subjectBreakdown
    .map((s: SubjectBreakdown) => `  - ${s.subject}: ${s.correct}/${s.total} (${s.accuracy}%)`)
    .join("\n")

  const questionLines = data.questionDetails
    .map((q: QuestionDetail) => {
      const status = q.isCorrect === true ? "Correct" : q.isCorrect === false ? "Incorrect" : "Unattempted"
      return `  - [${status}] ${q.subject}/${q.chapter}/${q.topic || "general"} (${q.timeSpent}s, ${q.difficulty})`
    })
    .join("\n")

  return `Analyze this student's test performance:

Overall Score: ${data.totalScore}/${data.maxScore} (${data.accuracy}%)
Correct: ${data.correct} | Incorrect: ${data.incorrect} | Unattempted: ${data.unattempted}
Time Taken: ${data.timeTaken}s

Subject Breakdown:
${subjectLines}

Question Details:
${questionLines}

Provide strengths, weak topics, recommendations, suggested next tests, and study plan adjustments.`
}

export async function analyzePerformance(
  userId: string,
  attemptId: string,
  data: PerformanceData
): Promise<AIAnalysisResult> {
  const cacheKey = generateCacheKey("performance", userId, attemptId)
  const cached = getCached<AIAnalysisResult>(cacheKey)
  if (cached) return cached

  const prompt = buildPerformancePrompt(data)

  const result = await generateWithRetry(() =>
    generateJsonWithGemini<AIAnalysisResult>(prompt, PERFORMANCE_SYSTEM_PROMPT)
  )

  setCache(cacheKey, result, 10 * 60 * 1000)
  return result
}
