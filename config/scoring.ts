export const SCORING = {
  PASS_THRESHOLD: 40,
  EXCELLENT_THRESHOLD: 90,
  GOOD_THRESHOLD: 75,
  WEAK_THRESHOLD: 50,
  STREAK_BONUS_THRESHOLD: 3,
  DEFAULT_STREAK: 7,
  MAX_RECENT_TESTS: 10,
  CHART_POINTS: 7,
} as const

export const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
}

export const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  MEDIUM: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  HARD: "border-red-500/20 bg-red-500/10 text-red-400",
}

export function getScoreMessage(score: number): { text: string; emoji: string } {
  if (score >= SCORING.EXCELLENT_THRESHOLD) return { text: "Outstanding performance!", emoji: "🏆" }
  if (score >= SCORING.GOOD_THRESHOLD) return { text: "Excellent pace and accuracy.", emoji: "🎯" }
  if (score >= SCORING.WEAK_THRESHOLD) return { text: "Strong effort with room to sharpen your speed.", emoji: "💪" }
  if (score >= SCORING.PASS_THRESHOLD) return { text: "Steady progress. More revision will lift your score.", emoji: "📈" }
  return { text: "Every attempt builds mastery. Keep practicing.", emoji: "🚀" }
}
