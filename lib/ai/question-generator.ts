import { generateJsonWithGemini, generateWithRetry } from "./gemini"
import type { GeneratedQuestion } from "./types"

export interface QuestionGenerationInput {
  subject: string
  chapter: string
  topic: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  examType: string
}

const QUESTION_GEN_SYSTEM_PROMPT = `You are an expert question creator for Indian engineering entrance exams (JEE Main, JEE Advanced, MHT-CET, BITSAT, COMEDK).

Generate a realistic multiple-choice question.

Return JSON with this exact structure:
{
  "questionText": "string - the question text with proper units and formatting",
  "options": ["string - first option", "string - second option", "string - third option", "string - fourth option"],
  "correctOption": number - 0-based index of correct answer,
  "explanation": "string - step-by-step solution with reasoning",
  "subject": "string",
  "chapter": "string",
  "topic": "string",
  "difficulty": "EASY" | "MEDIUM" | "HARD"
}

Guidelines:
- Questions must be exam-quality with realistic difficulty
- All 4 options should be plausible
- Include proper units and numerical values
- Explanation must show complete step-by-step solution
- Match the actual exam pattern for the specified exam type
- For JEE Main: 4 options, single correct answer
- Include numerical values that require calculation`

export async function generateAIQuestion(
  input: QuestionGenerationInput
): Promise<GeneratedQuestion> {
  const prompt = `Generate a ${input.difficulty} difficulty ${input.examType} question for:
Subject: ${input.subject}
Chapter: ${input.chapter}
Topic: ${input.topic}

Create a realistic exam question with 4 options and a detailed solution.`

  return generateWithRetry(() =>
    generateJsonWithGemini<GeneratedQuestion>(prompt, QUESTION_GEN_SYSTEM_PROMPT)
  )
}
