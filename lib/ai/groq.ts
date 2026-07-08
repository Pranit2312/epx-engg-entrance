import Groq from "groq-sdk"

const apiKey = (typeof process !== "undefined" && process.env && process.env.GROQ_API_KEY) || ""
const groq = new Groq({ apiKey: apiKey || "dummy" })

const DEFAULT_MODEL = "llama-3.3-70b-versatile"

export function getGroqModel() {
  return DEFAULT_MODEL
}

export async function generateWithGroq(
  prompt: string,
  systemInstruction?: string,
  modelName = DEFAULT_MODEL
): Promise<string> {
  const messages: { role: "system" | "user" | "assistant"; content: string }[] = []
  if (systemInstruction) messages.push({ role: "system", content: systemInstruction })
  messages.push({ role: "user", content: prompt })

  const result = await groq.chat.completions.create({
    model: modelName,
    messages,
    temperature: 0.7,
    max_tokens: 4096,
  })

  return result.choices[0]?.message?.content || ""
}

export async function generateJsonWithGroq<T>(
  prompt: string,
  systemInstruction?: string,
  modelName = DEFAULT_MODEL
): Promise<T> {
  const jsonPrompt = `${prompt}\n\nRespond ONLY with valid JSON. No markdown, no backticks, no explanation.`
  const systemWithJson = systemInstruction
    ? `${systemInstruction}\n\nYou must respond with valid JSON only. Never wrap in markdown or backticks.`
    : "You must respond with valid JSON only. Never wrap in markdown or backticks."

  const text = await generateWithGroq(jsonPrompt, systemWithJson, modelName)
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
      const isRateLimit = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("rate_limit")
      const delay = isRateLimit ? baseDelay * Math.pow(2, attempt) * 2 : baseDelay * Math.pow(2, attempt)
      console.warn(`[Groq] Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error?.message)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw new Error("Max retries exceeded")
}
