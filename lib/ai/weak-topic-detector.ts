import { generateJsonWithGemini, generateWithRetry } from "./gemini"
import { getCached, setCache, generateCacheKey } from "./cache"
import type { WeakTopicResult } from "./types"

export interface WeakTopicDetectionInput {
  subjectBreakdown: { subject: string; correct: number; total: number; accuracy: number }[]
  chapterAccuracy: { subject: string; chapter: string; correct: number; total: number; accuracy: number }[]
  topicAccuracy: { subject: string; chapter: string; topic: string; correct: number; total: number; accuracy: number }[]
  recentAttempts: number
}

const WEAK_TOPIC_SYSTEM_PROMPT = `You are an analytics engine for exam preparation platforms.
Analyze the student's performance across subjects, chapters, and topics to detect weak areas.

Return JSON with this exact structure:
{
  "weakTopics": [{
    "subject": "string",
    "chapter": "string",
    "topic": "string | null",
    "accuracy": number,
    "attempts": number,
    "severity": "high" | "medium" | "low"
  }]
}

Rules:
- A topic is "weak" if accuracy < 60%
- Severity is "high" if accuracy < 40%
- Severity is "medium" if accuracy 40-50%
- Severity is "low" if accuracy 50-60%
- Include ALL weak topics, not just the worst ones
- Group related weak topics together`

function buildWeakTopicPrompt(input: WeakTopicDetectionInput): string {
  const subjectLines = input.subjectBreakdown
    .map((s) => `  ${s.subject}: ${s.correct}/${s.total} (${s.accuracy}%)`)
    .join("\n")

  const chapterLines = input.chapterAccuracy
    .map((c) => `  ${c.subject}/${c.chapter}: ${c.correct}/${c.total} (${c.accuracy}%)`)
    .join("\n")

  const topicLines = input.topicAccuracy
    .map((t) => `  ${t.subject}/${t.chapter}/${t.topic}: ${t.correct}/${t.total} (${t.accuracy}%)`)
    .join("\n")

  return `Analyze this student's exam performance data (${input.recentAttempts} recent attempts):

Subject Performance:
${subjectLines}

Chapter Performance:
${chapterLines}

Topic Performance:
${topicLines}

Identify all weak topics (accuracy < 60%). Rate severity as high (<40%), medium (40-50%), or low (50-60%).`
}

export async function detectWeakTopics(
  userId: string,
  input: WeakTopicDetectionInput
): Promise<WeakTopicResult[]> {
  const cacheKey = generateCacheKey("weakTopics", userId)
  const cached = getCached<{ weakTopics: WeakTopicResult[] }>(cacheKey)
  if (cached) return cached.weakTopics

  const prompt = buildWeakTopicPrompt(input)

  const result = await generateWithRetry(() =>
    generateJsonWithGemini<{ weakTopics: WeakTopicResult[] }>(prompt, WEAK_TOPIC_SYSTEM_PROMPT)
  )

  setCache(cacheKey, result, 30 * 60 * 1000)
  return result.weakTopics
}
