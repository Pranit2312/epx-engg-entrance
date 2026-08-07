import Groq from "groq-sdk"
import { createRequestLogger } from "@/lib/logger"

const DEFAULT_MODEL = process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile"
const DEFAULT_TEMPERATURE = 0.7
const DEFAULT_MAX_TOKENS = 2048

function getGroqApiKey(): string | undefined {
  return process.env.GROQ_API_KEY?.trim() || undefined
}

function getGroqClient(): Groq | null {
  const apiKey = getGroqApiKey()
  if (!apiKey) return null
  return new Groq({ apiKey })
}

function isRetryable(error: any): boolean {
  const status = error?.status ?? error?.response?.status
  return status === 429 || error?.message?.includes("429") || error?.message?.includes("rate limit") || error?.message?.includes("rate_limit")
}

export function getGroqModel() {
  return process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL
}

export async function generateWithGroq(
  prompt: string,
  systemInstruction?: string,
  modelName = getGroqModel()
): Promise<string> {
  const client = getGroqClient()
  if (!client) {
    throw new Error("GROQ_API_KEY is not configured")
  }

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = []
  if (systemInstruction) messages.push({ role: "system", content: systemInstruction })
  messages.push({ role: "user", content: prompt })

  const logger = createRequestLogger("AI")
  try {
    const result = await generateWithRetry(
      () =>
        client.chat.completions.create({
          model: modelName,
          messages,
          temperature: DEFAULT_TEMPERATURE,
          max_tokens: DEFAULT_MAX_TOKENS,
        }),
      3,
      1000
    )

    const content = result.choices[0]?.message?.content?.trim() || ""
    logger.done("Groq completion completed")
    return content
  } catch (error: any) {
    logger.error("Groq completion failed", error as Error)
    throw error
  }
}

export async function generateJsonWithGroq<T>(
  prompt: string,
  systemInstruction?: string,
  modelName = getGroqModel()
): Promise<T> {
  const jsonPrompt = `${prompt}\n\nRespond ONLY with valid JSON. No markdown, no backticks, no explanation.`
  const systemWithJson = systemInstruction
    ? `${systemInstruction}\n\nYou must respond with valid JSON only. Never wrap in markdown or backticks.`
    : "You must respond with valid JSON only. Never wrap in markdown or backticks."

  const text = await generateWithGroq(jsonPrompt, systemWithJson, modelName)
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim()

  try {
    return JSON.parse(cleaned) as T
  } catch (error) {
    throw new Error("Invalid JSON response from AI provider")
  }
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
      if (attempt === maxRetries - 1 || !isRetryable(error)) {
        throw error
      }

      const delay = baseDelay * Math.pow(2, attempt)
      console.warn(`[Groq] Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error?.message)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new Error("Max retries exceeded")
}
