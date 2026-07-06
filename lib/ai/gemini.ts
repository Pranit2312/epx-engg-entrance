import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = (typeof process !== "undefined" && process.env && process.env.GEMINI_API_KEY) || ""
console.log("[Gemini] GEMINI_API_KEY exists:", !!apiKey)
console.log("[Gemini] Key length:", apiKey?.length)

let genAI: GoogleGenerativeAI | null = null

const costPer1KTokens = {
  input: 0.000075,
  output: 0.0003,
}

let totalCost = 0

export function getGeminiClient(): GoogleGenerativeAI {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables")
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey)
  }
  return genAI
}

export function getGeminiModel(modelName = "gemini-2.0-flash") {
  const client = getGeminiClient()
  return client.getGenerativeModel({ model: modelName })
}

export async function generateWithGemini(
  prompt: string,
  systemInstruction?: string,
  modelName = "gemini-2.0-flash"
): Promise<string> {
  const model = getGeminiModel(modelName)
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    systemInstruction: systemInstruction ? { role: "user", parts: [{ text: systemInstruction }] } : undefined,
  })

  const response = result.response
  const text = response.text()

  if (response.usageMetadata) {
    const inputTokens = response.usageMetadata.promptTokenCount ?? 0
    const outputTokens = response.usageMetadata.candidatesTokenCount ?? 0
    const cost = (inputTokens / 1000) * costPer1KTokens.input + (outputTokens / 1000) * costPer1KTokens.output
    totalCost += cost
    console.debug(`[Gemini] Tokens in: ${inputTokens}, out: ${outputTokens}, cost: $${cost.toFixed(6)}, total: $${totalCost.toFixed(4)}`)
  }

  return text
}

export async function generateJsonWithGemini<T>(
  prompt: string,
  systemInstruction?: string,
  modelName = "gemini-2.0-flash"
): Promise<T> {
  const jsonPrompt = `${prompt}\n\nRespond ONLY with valid JSON. No markdown, no backticks, no explanation.`
  const text = await generateWithGemini(jsonPrompt, systemInstruction, modelName)
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim()
  return JSON.parse(cleaned) as T
}

export async function generateWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      if (attempt === maxRetries - 1) throw error
      const isRateLimit = error?.message?.includes("429") || error?.status === 429
      const delay = isRateLimit ? baseDelay * Math.pow(2, attempt) * 2 : baseDelay * Math.pow(2, attempt)
      console.warn(`[Gemini] Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error?.message)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw new Error("Max retries exceeded")
}

export function getTotalCost(): number {
  return totalCost
}
