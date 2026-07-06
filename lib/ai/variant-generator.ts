import { generateJsonWithGemini, generateWithRetry } from "./gemini"
import type { QuestionVariant } from "./types"

export interface VariantGenerationInput {
  originalQuestion: string
  originalOptions: string[]
  correctOption: number
  subject: string
  chapter: string
  topic: string
  difficulty: string
}

const VARIANT_SYSTEM_PROMPT = `You are an expert question creator for Indian engineering entrance exams.

Given an existing question, create a variant that tests the SAME concept but with DIFFERENT values, different phrasing, and different distractors.

Return JSON with this exact structure:
{
  "variantText": "string - the variant question text",
  "options": ["string - first option", "string - second option", "string - third option", "string - fourth option"],
  "correctOption": number - 0-based index of correct answer,
  "explanation": "string - step-by-step solution for the variant"
}

Guidelines:
- Keep the same core concept and difficulty
- Change numerical values, variables, or scenarios
- Make all 4 options plausible
- Ensure the correct answer changes accordingly
- Write a full solution for the variant`

export async function generateVariant(
  input: VariantGenerationInput
): Promise<QuestionVariant> {
  const prompt = `Create a variant of this ${input.difficulty} ${input.subject}/${input.chapter} question:

Original Question: ${input.originalQuestion}
Options: ${input.originalOptions.join(" | ")}
Correct Answer Index: ${input.correctOption} (${input.originalOptions[input.correctOption]})

Create a variant that tests the same concept with different values and scenarios.`

  return generateWithRetry(() =>
    generateJsonWithGemini<QuestionVariant>(prompt, VARIANT_SYSTEM_PROMPT)
  )
}
