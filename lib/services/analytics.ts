import { prisma } from "@/lib/prisma"

export interface DemoAnalytics {
  subjectAccuracy: { subject: string; accuracy: number; correct: number; total: number; timeSpent: number }[]
  chapterAccuracy: { subject: string; chapter: string; accuracy: number; correct: number; total: number }[]
  weakTopics: { subject: string; chapter: string; topic: string | null; accuracy: number; attempts: number }[]
  strongTopics: string[]
  recentScores: number[]
  averageScore: number
  percentiles: number[]
  latestPercentile: number | null
  latestRank: number | null
  timeSpentPerSubject: { subject: string; timeMinutes: number }[]
  recentAttempts: number
}

const EXAM_CHAPTERS: Record<string, Record<string, string[]>> = {
  MHT_CET: {
    Physics: [
      "Units & Measurements", "Motion in Plane", "Laws of Motion", "Gravitation",
      "Rotational Motion", "Oscillations", "Waves", "Electrostatics",
      "Current Electricity", "Magnetism", "Modern Physics", "Optics",
      "Thermodynamics", "Kinetic Theory of Gases", "Semiconductor Devices",
      "Electromagnetic Induction", "Alternating Current", "Dual Nature of Radiation",
    ],
    Chemistry: [
      "Solid State", "Solutions", "Chemical Kinetics", "Electrochemistry",
      "Coordination Compounds", "Organic Chemistry", "Hydrocarbons",
      "Haloalkanes & Haloarenes", "Alcohols Phenols & Ethers",
      "Aldehydes Ketones & Carboxylic Acids", "Amines", "Biomolecules",
      "Polymers", "p-Block Elements", "d&f Block Elements",
      "Thermodynamics", "Chemical Bonding", "Periodic Table",
    ],
    Mathematics: [
      "Trigonometry", "Matrices", "Determinants", "Limits",
      "Differentiation", "Application of Derivatives", "Integration",
      "Definite Integration", "Differential Equations", "Vectors",
      "3D Geometry", "Probability", "Statistics", "Linear Programming",
      "Sets & Relations", "Complex Numbers", "Sequences & Series",
      "Binomial Theorem", "Permutations & Combinations", "Mathematical Logic",
    ],
  },
  JEE_MAIN: {
    Physics: [
      "Units & Measurements", "Motion in a Straight Line", "Motion in a Plane",
      "Laws of Motion", "Work Energy & Power", "System of Particles",
      "Gravitation", "Properties of Matter", "Thermodynamics",
      "Kinetic Theory of Gases", "Oscillations", "Waves",
      "Electrostatics", "Current Electricity", "Magnetic Effects",
      "Electromagnetic Induction", "Alternating Current",
      "Electromagnetic Waves", "Optics", "Dual Nature of Radiation",
      "Atoms & Nuclei", "Semiconductor Electronics",
    ],
    Chemistry: [
      "Some Basic Concepts", "Atomic Structure", "Chemical Bonding",
      "Thermodynamics", "Solutions", "Equilibrium", "Redox Reactions",
      "Electrochemistry", "Chemical Kinetics", "Surface Chemistry",
      "Periodic Table", "p-Block Elements", "d&f Block Elements",
      "Coordination Compounds", "Organic Chemistry Principles",
      "Hydrocarbons", "Haloalkanes & Haloarenes",
      "Alcohols Phenols & Ethers", "Aldehydes Ketones & Acids",
      "Amines", "Biomolecules", "Polymers", "Chemistry in Daily Life",
    ],
    Mathematics: [
      "Sets & Relations", "Complex Numbers", "Sequences & Series",
      "Binomial Theorem", "Permutations & Combinations",
      "Matrices & Determinants", "Limits & Continuity",
      "Differentiability", "Application of Derivatives",
      "Indefinite Integration", "Definite Integration",
      "Differential Equations", "Vectors", "3D Geometry",
      "Probability", "Statistics", "Trigonometry",
      "Mathematical Reasoning", "Linear Programming",
    ],
  },
}

function getDefaultSubjects(examType: string): string[] {
  if (examType === "MHT_CET") return ["Physics", "Chemistry", "Mathematics"]
  if (examType === "JEE_MAIN") return ["Physics", "Chemistry", "Mathematics"]
  return ["Physics", "Chemistry", "Mathematics"]
}

function getChaptersForSubject(examType: string, subject: string): string[] {
  const key = examType as keyof typeof EXAM_CHAPTERS
  return EXAM_CHAPTERS[key]?.[subject] ?? [
    `${subject} - Chapter 1`, `${subject} - Chapter 2`,
    `${subject} - Chapter 3`, `${subject} - Chapter 4`,
  ]
}

export function getDemoAnalytics(targetExam: string): DemoAnalytics {
  const examType = targetExam || "JEE_MAIN"
  const subjects = getDefaultSubjects(examType)

  const subjectAccuracy = subjects.map((subject) => {
    const accuracies: Record<string, number> = {
      Physics: 63,
      Chemistry: 72,
      Mathematics: 58,
    }
    const acc = accuracies[subject] ?? 65
    const total = 50
    const correct = Math.round(total * acc / 100)
    return { subject, accuracy: acc, correct, total, timeSpent: 2700 + Math.random() * 600 }
  })

  const chapterAccuracy: DemoAnalytics["chapterAccuracy"] = []
  const weakTopicsList: DemoAnalytics["weakTopics"] = []
  const strongTopics: string[] = []

  const weakConfig: Record<string, { chapters: string[]; accuracy: number }> = {
    Physics: { chapters: ["Rotational Motion", "Electrostatics", "Waves"], accuracy: 42 },
    Chemistry: { chapters: ["Coordination Compounds", "Electrochemistry"], accuracy: 48 },
    Mathematics: { chapters: ["Probability", "Limits", "Differential Equations"], accuracy: 38 },
  }

  const strongConfig: Record<string, string[]> = {
    Physics: ["Chemical Bonding", "Thermodynamics"],
    Chemistry: ["Chemical Bonding", "Vectors"],
    Mathematics: ["Integration", "Vectors"],
  }

  for (const subject of subjects) {
    const chapters = getChaptersForSubject(examType, subject)
    for (const chapter of chapters) {
      const weak = weakConfig[subject]?.chapters ?? []
      const isWeak = weak.includes(chapter)
      const acc = isWeak ? (weakConfig[subject]?.accuracy ?? 45) : 65 + Math.random() * 25
      const total = 8 + Math.floor(Math.random() * 12)
      const correct = Math.round(total * acc / 100)
      chapterAccuracy.push({ subject, chapter, accuracy: Math.round(acc), correct, total })

      if (isWeak) {
        weakTopicsList.push({
          subject,
          chapter,
          topic: null,
          accuracy: Math.round(acc),
          attempts: 3 + Math.floor(Math.random() * 5),
        })
      }
    }
    const strong = strongConfig[subject] ?? []
    for (const s of strong) {
      if (chapters.includes(s)) {
        strongTopics.push(`${subject} - ${s}`)
      }
    }
  }

  const recentScores = [52, 58, 63, 61, 67]
  const averageScore = Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length)
  const percentiles = [72, 78, 82, 81, 85]
  const latestPercentile = percentiles[percentiles.length - 1]
  const latestRank = Math.max(1, Math.round(50000 * (1 - latestPercentile / 100)))

  const timeSpentPerSubject = subjectAccuracy.map(s => ({
    subject: s.subject,
    timeMinutes: Math.round(s.timeSpent / 60),
  }))

  return {
    subjectAccuracy,
    chapterAccuracy,
    weakTopics: weakTopicsList.slice(0, 5),
    strongTopics: strongTopics.slice(0, 5),
    recentScores,
    averageScore,
    percentiles,
    latestPercentile,
    latestRank,
    timeSpentPerSubject,
    recentAttempts: recentScores.length,
  }
}

export async function seedDefaultWeakTopics(userId: string, targetExam: string): Promise<void> {
  const existing = await prisma.weakTopic.findFirst({ where: { userId } })
  if (existing) return

  const demo = getDemoAnalytics(targetExam)
  const now = new Date()

  for (const wt of demo.weakTopics) {
    try {
      await prisma.weakTopic.create({
        data: {
          userId,
          subject: wt.subject,
          chapter: wt.chapter,
          topic: wt.topic,
          accuracy: wt.accuracy,
          attempts: wt.attempts,
          detectedAt: now,
        },
      })
    } catch {
      // unique constraint violation — skip
    }
  }
}

export function getExamChapters(examType: string, subject: string): string[] {
  return getChaptersForSubject(examType, subject)
}
