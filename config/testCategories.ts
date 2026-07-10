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

export type SubjectChapters = {
  id: string
  name: string
  chapters: { name: string; topics: string[] }[]
}

export const SUBJECT_CHAPTERS: SubjectChapters[] = [
  {
    id: "physics",
    name: "Physics",
    chapters: [
      { name: "Mechanics", topics: ["Kinematics", "Laws of Motion", "Work Energy Power", "Rotational Motion", "Gravitation"] },
      { name: "Thermodynamics", topics: ["Thermal Properties", "Kinetic Theory", "Laws of Thermodynamics", "Heat Transfer"] },
      { name: "Current Electricity", topics: ["Ohm's Law", "Kirchhoff's Laws", "Electrical Measurements", "Circuits"] },
      { name: "Electrostatics", topics: ["Coulomb's Law", "Electric Field", "Potential", "Capacitors", "Gauss Law"] },
      { name: "Optics", topics: ["Reflection", "Refraction", "Wave Optics", "Lenses", "Dispersion"] },
      { name: "Modern Physics", topics: ["Photoelectric Effect", "Atomic Models", "Nuclear Physics", "Semiconductors"] },
      { name: "Magnetism", topics: ["Magnetic Fields", "EMI", "AC Circuits", "Electromagnetic Waves"] },
      { name: "Waves & Sound", topics: ["Simple Harmonic Motion", "Wave Motion", "Sound Waves", "Doppler Effect"] },
    ],
  },
  {
    id: "chemistry",
    name: "Chemistry",
    chapters: [
      { name: "Physical Chemistry", topics: ["Mole Concept", "Atomic Structure", "Chemical Bonding", "Thermodynamics", "Equilibrium", "Kinetics", "Electrochemistry"] },
      { name: "Organic Chemistry", topics: ["Hydrocarbons", "Alcohols Phenols", "Aldehydes Ketones", "Carboxylic Acids", "Amines", "Biomolecules", "Polymers"] },
      { name: "Inorganic Chemistry", topics: ["Periodic Table", "s-block Elements", "p-block Elements", "d-block Elements", "Coordination Compounds", "Metallurgy"] },
    ],
  },
  {
    id: "mathematics",
    name: "Mathematics",
    chapters: [
      { name: "Algebra", topics: ["Sets Relations", "Complex Numbers", "Quadratic Equations", "Sequences Series", "Binomial Theorem", "Permutations Combinations", "Matrices Determinants"] },
      { name: "Calculus", topics: ["Limits Continuity", "Differentiation", "Application of Derivatives", "Integration", "Differential Equations", "Area Under Curve"] },
      { name: "Coordinate Geometry", topics: ["Straight Lines", "Circles", "Conic Sections", "Parabola", "Ellipse", "Hyperbola"] },
      { name: "Probability", topics: ["Probability Basics", "Conditional Probability", "Random Variables", "Bayes Theorem"] },
      { name: "Trigonometry", topics: ["Trigonometric Functions", "Inverse Trigonometry", "Trigonometric Equations", "Heights Distances"] },
    ],
  },
]
