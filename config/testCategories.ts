export type TestCategory = {
  id: string
  name: string
  description: string
  duration: number
  questions: number
  difficulty: string
  icon: string
  gradient: string
}

export const PRACTICE_SETS: TestCategory[] = [
  {
    id: "daily-revision",
    name: "Daily Revision",
    description: "Quick 15-min refresher on key concepts",
    duration: 15,
    questions: 10,
    difficulty: "EASY",
    icon: "Flame",
    gradient: "from-emerald-500 to-green-500",
  },
  {
    id: "weak-areas",
    name: "Weak Areas Focus",
    description: "Target your weak spots with precision",
    duration: 30,
    questions: 20,
    difficulty: "MEDIUM",
    icon: "Brain",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    id: "challenge",
    name: "Challenge Mode",
    description: "Push your limits with advanced problems",
    duration: 45,
    questions: 30,
    difficulty: "HARD",
    icon: "Zap",
    gradient: "from-red-500 to-pink-500",
  },
]
