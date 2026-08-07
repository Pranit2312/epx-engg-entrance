export type MentorIntent =
  | "greeting"
  | "motivation"
  | "overall-performance-analysis"
  | "mock-test-analysis"
  | "weak-topic-analysis"
  | "study-plan"
  | "chapter-recommendation"
  | "explain-concept"
  | "solve-doubt"
  | "compare-progress"
  | "time-management"
  | "strategy-discussion"
  | "general-conversation"

function normalize(text: string): string {
  return text.toLowerCase().trim()
}

export function classifyIntent(message: string): MentorIntent {
  const text = normalize(message)

  if (!text) return "general-conversation"

  if (/\b(hello|hi|hey|good morning|good evening|good afternoon|thanks|thank you|how are you)\b/.test(text)) {
    return "greeting"
  }

  if (/\b(motivate|motivated|discouraged|confidence|keep going|you can do|don't give up)\b/.test(text)) {
    return "motivation"
  }

  if (/\b(how am i performing|performance|overall|progress|my progress|am i improving|how am i doing)\b/.test(text)) {
    return "overall-performance-analysis"
  }

  if (/\b(mock test|test analysis|analysis of my test|test review|how did i do on)\b/.test(text)) {
    return "mock-test-analysis"
  }

  if (/\b(weak topic|weak topics|where am i weak|which topics should i focus|my weak areas)\b/.test(text)) {
    return "weak-topic-analysis"
  }

  if (/\b(study plan|plan for me|give me a plan|daily plan|7 day plan|schedule)\b/.test(text)) {
    return "study-plan"
  }

  if (/\b(chapter|recommend|recommendation|which chapter|which topic)\b/.test(text)) {
    return "chapter-recommendation"
  }

  if (/\b(explain|what is|define|teach me|concept)\b/.test(text)) {
    return "explain-concept"
  }

  if (/\b(why|how do i|can you help me understand|solve this|doubt|confused)\b/.test(text)) {
    return "solve-doubt"
  }

  if (/\b(compare|compared to|improved|better than|worse than|trend)\b/.test(text)) {
    return "compare-progress"
  }

  if (/\b(time management|manage time|time|speed|pacing)\b/.test(text)) {
    return "time-management"
  }

  if (/\b(strategy|approach|attempt strategy|exam strategy|tactics)\b/.test(text)) {
    return "strategy-discussion"
  }

  return "general-conversation"
}
