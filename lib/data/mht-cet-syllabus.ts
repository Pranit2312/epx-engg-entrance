export const MHT_CET_SYLLABUS = {
  PHYSICS: {
    CLASS_11: [
      "Units and Measurements",
      "Motion in Plane",
      "Laws of Motion",
      "Gravitation",
      "Thermal Properties",
      "Sound",
      "Optics"
    ],
    CLASS_12: [
      "Rotational Motion",
      "Oscillations",
      "Electrostatics",
      "Current Electricity",
      "Magnetic Effects",
      "Electromagnetic Induction",
      "AC",
      "Dual Nature",
      "Atoms",
      "Nuclei",
      "Semiconductor"
    ]
  },
  CHEMISTRY: {
    PHYSICAL: [
      "Some Basic Concepts",
      "States of Matter",
      "Atomic Structure",
      "Chemical Bonding",
      "Thermodynamics",
      "Chemical Equilibrium",
      "Ionic Equilibrium",
      "Redox Reactions",
      "Solid State",
      "Solutions",
      "Electrochemistry",
      "Chemical Kinetics",
      "Surface Chemistry"
    ],
    ORGANIC: [
      "GOC",
      "Hydrocarbons",
      "Haloalkanes and Haloarenes",
      "Alcohols, Phenols and Ethers",
      "Aldehydes, Ketones and Carboxylic Acids",
      "Amines",
      "Biomolecules",
      "Polymers",
      "Chemistry in Everyday Life"
    ],
    INORGANIC: [
      "Classification of Elements",
      "Periodic Properties",
      "Chemical Bonding",
      "s-Block Elements",
      "p-Block Elements (Group 13-14)",
      "p-Block Elements (Group 15-18)",
      "d-Block Elements",
      "f-Block Elements",
      "Coordination Compounds"
    ]
  },
  MATHEMATICS: {
    CLASS_11: [
      "Trigonometry",
      "Straight Line",
      "Circle",
      "Probability",
      "Statistics"
    ],
    CLASS_12: [
      "Matrices",
      "Determinants",
      "Differentiation",
      "Integration",
      "Differential Equations",
      "Vectors",
      "3D Geometry",
      "Linear Programming"
    ]
  }
}

export const JEE_MAIN_SYLLABUS = {
  PHYSICS: [
    "Physics and Measurement",
    "Kinematics",
    "Laws of Motion",
    "Work, Energy and Power",
    "Rotational Motion",
    "Gravitation",
    "Properties of Solids and Liquids",
    "Thermodynamics",
    "Kinetic Theory of Gases",
    "Oscillations and Waves",
    "Electrostatics",
    "Current Electricity",
    "Magnetic Effects",
    "Electromagnetic Induction",
    "AC",
    "Optics",
    "Dual Nature",
    "Atoms and Nuclei",
    "Electronic Devices"
  ],
  CHEMISTRY: [
    "Some Basic Concepts",
    "Atomic Structure",
    "Chemical Bonding",
    "States of Matter",
    "Thermodynamics",
    "Equilibrium",
    "Redox Reactions",
    "Hydrogen",
    "s-Block Elements",
    "p-Block Elements",
    "Organic Chemistry",
    "Hydrocarbons",
    "Environmental Chemistry",
    "Solid State",
    "Solutions",
    "Electrochemistry",
    "Chemical Kinetics",
    "Surface Chemistry",
    "General Principles",
    "p-Block Elements",
    "d and f Block Elements",
    "Coordination Compounds",
    "Haloalkanes and Haloarenes",
    "Alcohols, Phenols and Ethers",
    "Aldehydes, Ketones and Carboxylic Acids",
    "Amines",
    "Biomolecules",
    "Polymers",
    "Chemistry in Everyday Life"
  ],
  MATHEMATICS: [
    "Sets, Relations and Functions",
    "Complex Numbers",
    "Matrices and Determinants",
    "Permutations and Combinations",
    "Mathematical Induction",
    "Binomial Theorem",
    "Sequences and Series",
    "Limits, Continuity and Differentiability",
    "Integral Calculus",
    "Differential Equations",
    "Coordinate Geometry",
    "3D Geometry",
    "Vectors",
    "Statistics and Probability",
    "Trigonometry"
  ]
}

export const EXAM_CONFIG = {
  MHT_CET: {
    totalQuestions: 150,
    duration: 180,
    subjects: {
      Physics: 50,
      Chemistry: 50,
      Mathematics: 50
    },
    marksPerQuestion: 1,
    negativeMarking: 0
  },
  JEE_MAIN: {
    totalQuestions: 75,
    duration: 180,
    subjects: {
      Physics: 25,
      Chemistry: 25,
      Mathematics: 25
    },
    marksPerQuestion: 4,
    negativeMarking: 1
  },
  JEE_ADVANCED: {
    totalQuestions: 54,
    duration: 180,
    subjects: {
      Physics: 18,
      Chemistry: 18,
      Mathematics: 18
    },
    marksPerQuestion: 4,
    negativeMarking: 1
  },
  BITSAT: {
    totalQuestions: 130,
    duration: 180,
    subjects: {
      Physics: 40,
      Chemistry: 40,
      Mathematics: 40,
      English: 10
    },
    marksPerQuestion: 3,
    negativeMarking: 1
  }
}
