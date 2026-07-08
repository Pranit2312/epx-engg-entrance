import { generateWithGroq, generateJsonWithGroq, generateWithRetry } from "@/lib/ai/groq"
import { getCached, setCache, generateCacheKey } from "@/lib/ai/cache"

const FALLBACK_MENTOR = "I'm currently unable to access the AI service. Please try again in a few minutes."
const FALLBACK_STUDY_PLAN = "Unable to generate study plan right now."
const FALLBACK_RECOMMENDATIONS = "Recommendations are temporarily unavailable."
const FALLBACK_WEAK_TOPICS: any[] = []
const FALLBACK_ANALYSIS = { strengths: [], weakTopics: [], recommendations: ["Analysis temporarily unavailable"], nextTests: [], studyPlan: [] }

function safeCall<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  return fn().catch((e) => {
    console.error("[AI] Error:", e?.message || e)
    return fallback
  })
}

export async function generateAIResponse(prompt: string, context?: string): Promise<string> {
  try {
    const fullPrompt = context ? `Context: ${context}\n\nQuestion: ${prompt}` : prompt
    return await generateWithGroq(fullPrompt)
  } catch (error: any) {
    console.error("AI generation error:", error)
    throw new Error("Failed to generate AI response")
  }
}

export async function generateStudyPlan(
  weakTopics: string[],
  targetExam: string,
  targetScore: number,
  days: number
): Promise<string> {
  if (!process.env.GROQ_API_KEY) return FALLBACK_STUDY_PLAN
  return safeCall(async () => {
    const prompt = `Generate a ${days}-day study plan for ${targetExam} exam preparation. Student's weak topics: ${weakTopics.join(", ")}. Target score: ${targetScore}%. Create a structured daily plan. Format as a day-by-day schedule.`
    return generateWithGroq(prompt)
  }, FALLBACK_STUDY_PLAN)
}

export async function generateRecommendations(
  weakTopics: string[],
  strongTopics: string[],
  recentScores: number[],
  targetExam: string
): Promise<string> {
  if (!process.env.GROQ_API_KEY) return FALLBACK_RECOMMENDATIONS
  return safeCall(async () => {
    const prompt = `Based on the following student performance data, provide personalized study recommendations in 3-4 sentences: Weak Topics: ${weakTopics.join(", ")}. Strong Topics: ${strongTopics.join(", ")}. Recent Scores: ${recentScores.join(", ")}%. Target Exam: ${targetExam}. Focus on: 1) which weak topics to prioritize, 2) how to leverage strong topics, 3) study strategy based on trend.`
    return generateWithGroq(prompt)
  }, FALLBACK_RECOMMENDATIONS)
}

export async function generateMentorResponse(
  question: string,
  userContext: { recentAttempts: number; averageScore: number; weakTopics: string[]; strongTopics: string[]; targetExam: string }
): Promise<string> {
  if (!process.env.GROQ_API_KEY) return FALLBACK_MENTOR
  return safeCall(async () => {
    const context = `Student Profile: Recent attempts: ${userContext.recentAttempts}, Average score: ${userContext.averageScore}%, Weak topics: ${userContext.weakTopics.join(", ")}, Strong topics: ${userContext.strongTopics.join(", ")}, Target exam: ${userContext.targetExam}`
    const prompt = `You are an AI mentor for Indian engineering exam prep. Be encouraging but honest, provide specific actionable advice, keep responses concise (2-3 paragraphs).\n\n${context}\n\nStudent question: ${question}`
    return generateWithGroq(prompt)
  }, FALLBACK_MENTOR)
}

export async function analyzeWeakTopics(
  subjectPerformance: { subject: string; accuracy: number; attempts: number }[]
): Promise<string[]> {
  if (!process.env.GROQ_API_KEY) return [...FALLBACK_WEAK_TOPICS]
  return safeCall(async () => {
    const prompt = `Analyze the following subject performance data and identify the top 3 weak topics that need immediate attention:\n${subjectPerformance.map(sp => `- ${sp.subject}: ${sp.accuracy}% accuracy (${sp.attempts} attempts)`).join("\n")}\nReturn only the subject names, separated by commas.`
    const response = await generateWithGroq(prompt)
    return response.split(",").map(s => s.trim()).filter(Boolean)
  }, [...FALLBACK_WEAK_TOPICS])
}

export async function predictRank(
  currentScore: number,
  targetExam: string,
  historicalScores: number[]
): Promise<{ predictedPercentile: number; predictedRank: number; confidence: string }> {
  if (!process.env.GROQ_API_KEY) {
    const avg = [...historicalScores, currentScore].reduce((a, b) => a + b, 0) / (historicalScores.length + 1)
    return { predictedPercentile: Math.round(avg), predictedRank: Math.round(10000 * (1 - avg / 100)), confidence: "Medium" }
  }
  return safeCall(async () => {
    const prompt = `Based on Current Score: ${currentScore}%, Target Exam: ${targetExam}, Historical Scores: ${historicalScores.join(", ")}%, predict the student's exam performance. Provide predicted percentile (0-100), predicted rank, and confidence level (High/Medium/Low). Respond with JSON only: {"predictedPercentile": number, "predictedRank": number, "confidence": string}`
    try {
      return JSON.parse(await generateWithGroq(prompt))
    } catch {
      const avg = [...historicalScores, currentScore].reduce((a, b) => a + b, 0) / (historicalScores.length + 1)
      return { predictedPercentile: Math.round(avg), predictedRank: Math.round(10000 * (1 - avg / 100)), confidence: "Medium" }
    }
  }, { predictedPercentile: 50, predictedRank: 10000, confidence: "Low" })
}

export async function analyzePerformance(
  userId: string,
  attemptId: string,
  data: {
    totalScore: number; maxScore: number; accuracy: number; correct: number; incorrect: number; unattempted: number; timeTaken: number
    subjectBreakdown: { subject: string; correct: number; total: number; accuracy: number }[]
    questionDetails: { id: string; subject: string; chapter: string; topic: string | null; isCorrect: boolean | null; timeSpent: number; difficulty: string }[]
  }
): Promise<{ strengths: string[]; weakTopics: string[]; recommendations: string[]; nextTests: string[]; studyPlan: string[] }> {
  if (!process.env.GROQ_API_KEY) return { ...FALLBACK_ANALYSIS }
  const cacheKey = generateCacheKey("performance", userId, attemptId)
  const cached = getCached<any>(cacheKey)
  if (cached) return cached

  return safeCall(async () => {
    const subjectLines = data.subjectBreakdown.map(s => `- ${s.subject}: ${s.correct}/${s.total} (${s.accuracy}%)`).join("\n")
    const questionLines = data.questionDetails.map(q => {
      const status = q.isCorrect === true ? "Correct" : q.isCorrect === false ? "Incorrect" : "Unattempted"
      return `- [${status}] ${q.subject}/${q.chapter}/${q.topic || "general"} (${q.timeSpent}s, ${q.difficulty})`
    }).join("\n")
    const prompt = `Analyze this test performance:\nScore: ${data.totalScore}/${data.maxScore} (${data.accuracy}%)\nCorrect: ${data.correct} | Incorrect: ${data.incorrect} | Unattempted: ${data.unattempted}\nTime: ${data.timeTaken}s\n\nSubject Breakdown:\n${subjectLines}\n\nQuestion Details:\n${questionLines}\n\nProvide strengths, weak topics, recommendations, suggested next tests, and study plan adjustments. Respond with JSON only: {"strengths":[],"weakTopics":[],"recommendations":[],"nextTests":[],"studyPlan":[]}`

    const result = await generateJsonWithGroq<any>(prompt)
    setCache(cacheKey, result, 10 * 60 * 1000)
    return result
  }, { ...FALLBACK_ANALYSIS })
}

export async function generateAIQuestion(input: {
  subject: string; chapter: string; topic: string; difficulty: string; examType: string
}): Promise<{ questionText: string; options: string[]; correctOption: number; explanation: string; subject: string; chapter: string; topic: string; difficulty: string } | null> {
  if (!process.env.GROQ_API_KEY) return null
  return safeCall(async () => {
    const prompt = `Generate a ${input.difficulty} ${input.examType} question for Subject: ${input.subject}, Chapter: ${input.chapter}, Topic: ${input.topic}. Create a realistic MCQ with 4 options and detailed solution. Respond with JSON: {"questionText":"","options":["","","",""],"correctOption":0,"explanation":"","subject":"${input.subject}","chapter":"${input.chapter}","topic":"${input.topic}","difficulty":"${input.difficulty}"}`
    return generateJsonWithGroq<any>(prompt)
  }, null)
}

export async function generateVariant(input: {
  originalQuestion: string; originalOptions: string[]; correctOption: number; subject: string; chapter: string; topic: string; difficulty: string
}): Promise<{ variantText: string; options: string[]; correctOption: number; explanation: string } | null> {
  if (!process.env.GROQ_API_KEY) return null
  return safeCall(async () => {
    const prompt = `Create a variant of this ${input.difficulty} ${input.subject}/${input.chapter} question:\nOriginal: ${input.originalQuestion}\nOptions: ${input.originalOptions.join(" | ")}\nCorrect: ${input.originalOptions[input.correctOption]}\n\nCreate a variant testing the same concept with different values. Respond with JSON: {"variantText":"","options":["","","",""],"correctOption":0,"explanation":""}`
    return generateJsonWithGroq<any>(prompt)
  }, null)
}

export async function generateWeakTopicAnalysis(
  userId: string,
  input: {
    subjectBreakdown: { subject: string; correct: number; total: number; accuracy: number }[]
    chapterAccuracy: { subject: string; chapter: string; correct: number; total: number; accuracy: number }[]
    topicAccuracy: { subject: string; chapter: string; topic: string; correct: number; total: number; accuracy: number }[]
    recentAttempts: number
  }
): Promise<{ subject: string; chapter: string; topic: string | null; accuracy: number; attempts: number; severity: string }[]> {
  if (!process.env.GROQ_API_KEY) return []
  const cacheKey = generateCacheKey("weakTopics", userId)
  const cached = getCached<{ weakTopics: any[] }>(cacheKey)
  if (cached) return cached.weakTopics

  return safeCall(async () => {
    const subjectLines = input.subjectBreakdown.map(s => `${s.subject}: ${s.correct}/${s.total} (${s.accuracy}%)`).join("\n")
    const chapterLines = input.chapterAccuracy.map(c => `${c.subject}/${c.chapter}: ${c.correct}/${c.total} (${c.accuracy}%)`).join("\n")
    const topicLines = input.topicAccuracy.map(t => `${t.subject}/${t.chapter}/${t.topic}: ${t.correct}/${t.total} (${t.accuracy}%)`).join("\n")
    const prompt = `Analyze this student's exam performance (${input.recentAttempts} recent attempts):\n\nSubject Performance:\n${subjectLines}\n\nChapter Performance:\n${chapterLines}\n\nTopic Performance:\n${topicLines}\n\nIdentify all weak topics (accuracy < 60%). Rate severity as high (<40%), medium (40-50%), or low (50-60%). Respond with JSON: {"weakTopics":[{"subject":"","chapter":"","topic":"","accuracy":0,"attempts":0,"severity":"low"}]}`
    const result = await generateJsonWithGroq<{ weakTopics: any[] }>(prompt)
    setCache(cacheKey, result, 30 * 60 * 1000)
    return result.weakTopics
  }, [])
}

export async function generateStudyPlanAI(
  userId: string,
  input: {
    targetExam: string
    weakTopics: { subject: string; chapter: string; topic: string | null; accuracy: number }[]
    strongSubjects: string[]
    availableHoursPerDay: number
    durationDays: 7 | 15 | 30
  }
): Promise<{ title: string; description: string; days: { day: number; focus: string; topics: string[]; hours: number; tasks: string[] }[] } | null> {
  if (!process.env.GROQ_API_KEY) return null
  const cacheKey = generateCacheKey("studyplan", userId, `days_${input.durationDays}`)
  const cached = getCached<any>(cacheKey)
  if (cached) return cached

  return safeCall(async () => {
    const weakLines = input.weakTopics.map(w => `- ${w.subject}/${w.chapter}${w.topic ? `/${w.topic}` : ""} (accuracy: ${w.accuracy}%)`).join("\n")
    const strongStr = input.strongSubjects.join(", ")
    const prompt = `Create a ${input.durationDays}-day study plan for ${input.targetExam} preparation. Available hours/day: ${input.availableHoursPerDay}. Weak areas:\n${weakLines}\n\nStrong subjects: ${strongStr}\n\nCreate a day-by-day plan with specific topics, hours, and tasks. Include revision days and mock tests. Respond with JSON: {"title":"","description":"","days":[{"day":1,"focus":"","topics":[],"hours":0,"tasks":[]}]}`
    const result = await generateJsonWithGroq<any>(prompt)
    setCache(cacheKey, result, 30 * 60 * 1000)
    return result
  }, null)
}
