export interface PerformanceData {
  totalScore: number
  maxScore: number
  accuracy: number
  correct: number
  incorrect: number
  unattempted: number
  timeTaken: number
  subjectBreakdown: SubjectBreakdown[]
  questionDetails: QuestionDetail[]
}

export interface SubjectBreakdown {
  subject: string
  correct: number
  total: number
  accuracy: number
}

export interface QuestionDetail {
  id: string
  subject: string
  chapter: string
  topic: string | null
  isCorrect: boolean | null
  timeSpent: number
  difficulty: string
}

export interface AIAnalysisResult {
  strengths: string[]
  weakTopics: string[]
  recommendations: string[]
  nextTests: string[]
  studyPlan: string[]
}

export interface StudyPlanDay {
  day: number
  focus: string
  topics: string[]
  hours: number
  tasks: string[]
}

export interface StudyPlanResult {
  title: string
  description: string
  days: StudyPlanDay[]
}

export interface MentorMessage {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: Date
}

export interface GeneratedQuestion {
  questionText: string
  options: string[]
  correctOption: number
  explanation: string
  subject: string
  chapter: string
  topic: string
  difficulty: string
}

export interface QuestionVariant {
  variantText: string
  options: string[]
  correctOption: number
  explanation: string
}

export interface WeakTopicResult {
  subject: string
  chapter: string
  topic: string | null
  accuracy: number
  attempts: number
  severity: "low" | "medium" | "high"
}
