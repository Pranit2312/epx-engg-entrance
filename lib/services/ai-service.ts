import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

export async function generateAIResponse(prompt: string, context?: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const fullPrompt = context 
      ? `Context: ${context}\n\nQuestion: ${prompt}`
      : prompt

    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('AI generation error:', error)
    throw new Error('Failed to generate AI response')
  }
}

export async function generateRecommendations(
  weakTopics: string[],
  strongTopics: string[],
  recentScores: number[],
  targetExam: string
): Promise<string> {
  const prompt = `
    Based on the following student performance data, provide personalized study recommendations:
    
    Weak Topics: ${weakTopics.join(', ')}
    Strong Topics: ${strongTopics.join(', ')}
    Recent Scores: ${recentScores.join(', ')}%
    Target Exam: ${targetExam}
    
    Provide specific, actionable recommendations in 3-4 sentences. Focus on:
    1. Which weak topics to prioritize
    2. How to leverage strong topics
    3. Study strategy based on recent performance trend
  `

  return generateAIResponse(prompt)
}

export async function generateStudyPlan(
  weakTopics: string[],
  targetExam: string,
  targetScore: number,
  days: number
): Promise<string> {
  const prompt = `
    Generate a ${days}-day study plan for ${targetExam} exam preparation.
    
    Student's weak topics: ${weakTopics.join(', ')}
    Target score: ${targetScore}%
    
    Create a structured daily plan that:
    1. Allocates time for each weak topic
    2. Includes practice tests
    3. Allows for revision
    4. Is realistic and achievable
    
    Format the response as a day-by-day schedule.
  `

  return generateAIResponse(prompt)
}

export async function generateMentorResponse(
  question: string,
  userContext: {
    recentAttempts: number
    averageScore: number
    weakTopics: string[]
    strongTopics: string[]
    targetExam: string
  }
): Promise<string> {
  const context = `
    Student Profile:
    - Recent attempts: ${userContext.recentAttempts}
    - Average score: ${userContext.averageScore}%
    - Weak topics: ${userContext.weakTopics.join(', ')}
    - Strong topics: ${userContext.strongTopics.join(', ')}
    - Target exam: ${userContext.targetExam}
  `

  return generateAIResponse(question, context)
}

export async function predictRank(
  currentScore: number,
  targetExam: string,
  historicalScores: number[]
): Promise<{ predictedPercentile: number; predictedRank: number; confidence: string }> {
  const prompt = `
    Based on the following data, predict the student's exam performance:
    
    Current Score: ${currentScore}%
    Target Exam: ${targetExam}
    Historical Scores: ${historicalScores.join(', ')}%
    
    Provide:
    1. Predicted percentile (0-100)
    2. Predicted rank (estimated based on typical exam participation)
    3. Confidence level (High/Medium/Low)
    
    Format as JSON with keys: predictedPercentile, predictedRank, confidence
  `

  const response = await generateAIResponse(prompt)
  
  try {
    const parsed = JSON.parse(response)
    return {
      predictedPercentile: parsed.predictedPercentile || 50,
      predictedRank: parsed.predictedRank || 10000,
      confidence: parsed.confidence || 'Medium'
    }
  } catch {
    // Fallback if AI doesn't return valid JSON
    const avgScore = [...historicalScores, currentScore].reduce((a, b) => a + b, 0) / (historicalScores.length + 1)
    return {
      predictedPercentile: Math.round(avgScore),
      predictedRank: Math.round(10000 * (1 - avgScore / 100)),
      confidence: 'Medium'
    }
  }
}

export async function analyzeWeakTopics(
  subjectPerformance: { subject: string; accuracy: number; attempts: number }[]
): Promise<string[]> {
  const prompt = `
    Analyze the following subject performance data and identify the top 3 weak topics that need immediate attention:
    
    ${subjectPerformance.map(sp => `- ${sp.subject}: ${sp.accuracy}% accuracy (${sp.attempts} attempts)`).join('\n')}
    
    Return only the subject names, separated by commas.
  `

  const response = await generateAIResponse(prompt)
  return response.split(',').map(s => s.trim()).filter(s => s)
}
