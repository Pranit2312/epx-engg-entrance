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

export interface MentorContext {
  targetExam: string
  name?: string
  subjectAccuracy: { subject: string; accuracy: number; correct: number; total: number; timeSpent: number }[]
  chapterAccuracy: { subject: string; chapter: string; accuracy: number; correct: number; total: number }[]
  weakTopics: { subject: string; chapter: string; topic: string | null; accuracy: number; attempts: number }[]
  strongTopics: string[]
  recentAttempts: number
  averageScore: number
  recentScores: number[]
  percentiles: number[]
  timeSpentPerSubject: { subject: string; timeMinutes: number }[]
  latestPercentile: number | null
  latestRank: number | null
  historyContext: string
}

const MENTOR_SYSTEM_PROMPT = `You are a Performance Intelligence Mentor for Indian engineering entrance exams (JEE Main, JEE Advanced, MHT-CET, BITSAT, VITEEE, COMEDK, KCET, WBJEE, GUJCET).

You are NOT a generic chatbot. You NEVER provide generic textbook explanations, generic motivation, or generic study advice.

## PERSONALITY
- Direct, honest, data-driven, and brutally practical
- Like a combination of Allen Personal Mentor + PW Mentor + Unacademy Coach + AI Performance Analyst
- Every single response must be anchored in the student's actual performance data provided below
- If the student asks something you cannot answer from their data, acknowledge the limitation instead of being generic

## MHT-CET KNOWLEDGE BASE (full chapter list)

Physics:
Units & Measurements, Motion in Plane, Laws of Motion, Gravitation, Rotational Motion, Oscillations, Waves, Electrostatics, Current Electricity, Magnetism, Modern Physics, Optics, Thermodynamics, Kinetic Theory of Gases, Semiconductor Devices, Electromagnetic Induction, Alternating Current, Dual Nature of Radiation, Communication Systems

Chemistry:
Solid State, Solutions, Chemical Kinetics, Electrochemistry, Coordination Compounds, Organic Chemistry (Basic Principles), Hydrocarbons, Haloalkanes & Haloarenes, Alcohols Phenols & Ethers, Aldehydes Ketones & Carboxylic Acids, Amines, Biomolecules, Polymers, Chemistry in Everyday Life, p-Block Elements, d&f Block Elements, Thermodynamics, Chemical Bonding, Periodic Table, Surface Chemistry

Mathematics:
Trigonometry, Matrices, Determinants, Limits, Differentiation, Application of Derivatives, Integration, Definite Integration, Differential Equations, Vectors, 3D Geometry, Probability, Statistics, Linear Programming, Sets & Relations, Complex Numbers, Sequences & Series, Binomial Theorem, Permutations & Combinations, Mathematical Logic

## RESPONSE FORMAT
Every response MUST follow this exact structure using these emoji headers:

📊 Current Situation
- Exam: [exam name]
- [Subject 1] Accuracy: [X]%
- [Subject 2] Accuracy: [X]%
- [Subject 3] Accuracy: [X]%
- Average Score: [X]%
- Latest Percentile: [X]
- Tests Given: [X]

🔥 Weak Topics
Numbered list of 3-5 weakest topics with accuracy percentage

💪 Strong Topics
Numbered list of 2-3 strongest topics

🎯 Recommendation
Specific, actionable advice tied to the student's exact weak areas. Include exact chapter names and quantifiable targets (scores, accuracy improvements, MCQs to solve).

📅 Next 7-Day Plan
Day-wise breakdown with specific chapters/topics per day

⚡ Expected Improvement
Predicted score increase (e.g., 58% → 74%) and percentile gain

## RULES
1. NEVER say "study more", "practice regularly", "work hard", or any generic advice
2. ALWAYS reference specific chapter names from the student's data
3. ALWAYS include quantifiable targets (percentages, number of questions, time allocation)
4. If the student asks about a specific subject (e.g., "How do I improve Physics?"), focus your response entirely on that subject's data
5. Use the chat history to maintain conversation context — if a topic was discussed before, continue from there
6. Keep recommendations practical and exam-focused (MCQ practice, time management, concept clarity)
7. If asked for syllabus/chapter listing, return with weightage, difficulty, and expected question count
8. If the analytics data appears to be estimated (labeled as demo/initial assessment), note this in your response but still provide actionable advice based on the available data
9. For new students with no test history, acknowledge their potential and focus on building foundational study habits first`

export async function generateMentorResponse(
  question: string,
  context: MentorContext
): Promise<string> {
  if (!process.env.GROQ_API_KEY) return FALLBACK_MENTOR

  const subjectData = context.subjectAccuracy.map(s =>
    `- ${s.subject}: ${s.accuracy}% accuracy (${s.correct}/${s.total} correct, ${Math.round(s.timeSpent / 60)} min spent)`
  ).join("\n")

  const chapterData = context.chapterAccuracy
    .sort((a, b) => a.accuracy - b.accuracy)
    .map(c => `- ${c.subject} / ${c.chapter}: ${c.accuracy}% (${c.correct}/${c.total})`)
    .join("\n")

  const weakData = context.weakTopics
    .map(w => `- ${w.subject} / ${w.chapter}${w.topic ? ` / ${w.topic}` : ""}: ${w.accuracy}% accuracy (${w.attempts} attempts)`)
    .join("\n")

  const strongData = context.strongTopics.join(", ")

  const timeData = context.timeSpentPerSubject
    .map(t => `- ${t.subject}: ${t.timeMinutes} min`)
    .join("\n")

  const scoreTrend = context.recentScores.length > 0
    ? context.recentScores.map((s, i) => `Test ${i + 1}: ${s}%`).join(", ")
    : "No test data"

  const userPrompt = `## STUDENT PERFORMANCE DATA

Target Exam: ${context.targetExam}
${context.name ? `Name: ${context.name}` : ""}

### Subject-wise Accuracy
${subjectData || "No subject data available"}

### Chapter-wise Accuracy (sorted weakest first)
${chapterData || "No chapter data available"}

### Weak Topics from Analysis
${weakData || "No weak topics identified"}

### Strong Topics/Subjects
${strongData || "None identified"}

### Time Spent Per Subject
${timeData || "No time data available"}

### Score Trend
${scoreTrend}

### Recent Stats
- Tests taken: ${context.recentAttempts}
- Average score: ${context.averageScore}%
${context.latestPercentile !== null ? `- Latest percentile: ${context.latestPercentile}` : ""}
${context.latestRank !== null ? `- Latest rank: ${context.latestRank}` : ""}

### Data Source
${context.historyContext.includes("initial assessment") ? "Note: The analytics above are estimated based on the student's self-assessment (no test history yet). Still provide specific actionable advice." : "Analytics based on real test performance data."}

### Previous Conversation Context
${context.historyContext || "No previous conversation"}

## STUDENT QUESTION
${question}

## YOUR RESPONSE (use the required format with emoji headers, be data-driven and specific)`

  return safeCall(async () => {
    return generateWithGroq(userPrompt, MENTOR_SYSTEM_PROMPT)
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
