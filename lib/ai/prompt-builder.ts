import { classifyIntent, MentorIntent } from "@/lib/ai/intent-classifier"
import { MentorContext } from "@/lib/services/ai-service"

export interface PromptPayload {
  intent: MentorIntent
  question: string
  context: MentorContext
  shouldUseAnalytics: boolean
}

export function buildMentorPrompt(payload: PromptPayload): string {
  const intent = payload.intent
  const context = payload.context
  const useAnalytics = payload.shouldUseAnalytics

  const styleInstructions = [
    "You are a helpful, warm, and perceptive AI study mentor.",
    "Answer naturally as a conversational tutor, not as a rigid report generator.",
    "Use the student's data only when it is relevant to the question.",
    "If the question is simple or conversational, keep the reply brief and friendly.",
    "For greetings or casual check-ins, reply in 1-3 short sentences with no headings, no bullet points, no emojis, and no report-style sections.",
    "Do not use headings, bullet points, emojis, or report-style sections for greetings, motivation, or simple conversation.",
    "If the student asks for analysis, be specific and evidence-based.",
    "If the student asks for a concept explanation, teach clearly and simply.",
    "If the student asks for a study plan, create a practical plan with priorities.",
  ]

  const systemPrompt = [
    ...styleInstructions,
    "",
    "Student profile:",
    context.name ? `- Name: ${context.name}` : "- Name: not provided",
    `- Target exam: ${context.targetExam}`,
    `- Intent detected: ${intent}`,
  ].join("\n")

  const analyticsSection = useAnalytics
    ? [
        "Student performance context:",
        context.subjectAccuracy.length > 0
          ? `- Subject accuracy: ${context.subjectAccuracy.map((item) => `${item.subject} ${item.accuracy}%`).join(", ")}`
          : "- Subject accuracy: not enough data",
        context.weakTopics.length > 0
          ? `- Weak topics: ${context.weakTopics.slice(0, 5).map((item) => `${item.subject}/${item.chapter}/${item.topic ?? "general"} (${item.accuracy}%)`).join(", ")}`
          : "- Weak topics: none identified",
        context.strongTopics.length > 0
          ? `- Strong topics: ${context.strongTopics.slice(0, 5).join(", ")}`
          : "- Strong topics: not enough data",
        context.recentScores.length > 0
          ? `- Recent scores: ${context.recentScores.join(", ")}`
          : "- Recent scores: not enough data",
        context.latestPercentile !== null ? `- Latest percentile: ${context.latestPercentile}` : "- Latest percentile: not available",
      ].join("\n")
    : "Student performance context: not needed for this request."

  const historySection = context.historyContext ? `Conversation history:\n${context.historyContext}` : "Conversation history: none"

  const userPrompt = [
    `System instructions:\n${systemPrompt}`,
    "",
    analyticsSection,
    "",
    historySection,
    "",
    `Student message: ${payload.question}`,
    "",
    "Respond naturally, briefly when appropriate, and do not force a fixed report format. Use the context only where it helps.",
  ].join("\n")

  return userPrompt
}
