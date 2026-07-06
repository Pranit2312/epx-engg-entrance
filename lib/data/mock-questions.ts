export interface Question {
  id: string
  questionText: string
  options: string[]
  correctOption: number
  explanation?: string
}

const fallbackBank: Question[] = [
  { id: "fb1", questionText: "A particle moves with uniform acceleration of 4 m/s². If its initial velocity is 10 m/s, what is its velocity after 3 seconds?", options: ["18 m/s", "22 m/s", "20 m/s", "24 m/s"], correctOption: 1, explanation: "Using v = u + at = 10 + 4×3 = 22 m/s" },
  { id: "fb2", questionText: "The force between two charges separated by distance r is F. If the distance is halved, the new force is:", options: ["4F", "2F", "F/2", "F/4"], correctOption: 0, explanation: "F ∝ 1/r², so halving distance quadruples force." },
  { id: "fb3", questionText: "What is the pH of 0.001 M HCl solution?", options: ["3", "11", "1", "7"], correctOption: 0, explanation: "[H⁺] = 10⁻³ M, pH = -log(10⁻³) = 3" },
  { id: "fb4", questionText: "The derivative of x³ with respect to x is:", options: ["3x²", "x²", "3x", "x⁴/4"], correctOption: 0, explanation: "d/dx(xⁿ) = nxⁿ⁻¹, so d/dx(x³) = 3x²" },
  { id: "fb5", questionText: "A 5 kg block is pulled on a frictionless surface by a force of 20 N. The acceleration is:", options: ["4 m/s²", "5 m/s²", "10 m/s²", "2 m/s²"], correctOption: 0, explanation: "a = F/m = 20/5 = 4 m/s²" },
  { id: "fb6", questionText: "The value of sin²30° + cos²30° is:", options: ["1", "1/2", "3/4", "1/4"], correctOption: 0, explanation: "sin²θ + cos²θ = 1 for any θ." },
  { id: "fb7", questionText: "How many moles are present in 18 g of water? (H=1, O=16)", options: ["1 mol", "2 mol", "0.5 mol", "1.5 mol"], correctOption: 0, explanation: "Molar mass H₂O = 18 g/mol. Moles = 18/18 = 1 mol" },
  { id: "fb8", questionText: "The sum of first 10 natural numbers is:", options: ["55", "45", "50", "60"], correctOption: 0, explanation: "Σn = n(n+1)/2 = 10×11/2 = 55" },
  { id: "fb9", questionText: "A lens of focal length 20 cm has power:", options: ["+5 D", "-5 D", "+0.05 D", "+2 D"], correctOption: 0, explanation: "P = 1/f(in m) = 1/0.2 = +5 D" },
  { id: "fb10", questionText: "The half-life of a radioactive substance is 8 days. The time for 75% decay is:", options: ["16 days", "24 days", "8 days", "32 days"], correctOption: 0, explanation: "75% decay means 25% remains = (1/2)², so 2 half-lives = 16 days." },
  { id: "fb11", questionText: "The empirical formula of a compound containing 40% C, 6.67% H, and 53.33% O is:", options: ["CH₂O", "C₂H₄O₂", "CHO", "CH₂O₂"], correctOption: 0, explanation: "C:H:O mole ratio = 40/12 : 6.67/1 : 53.33/16 = 3.33:6.67:3.33 = 1:2:1 = CH₂O" },
  { id: "fb12", questionText: "If A = [[1,2],[3,4]], then |A| is:", options: ["-2", "2", "10", "4"], correctOption: 0, explanation: "|A| = 1×4 - 2×3 = 4 - 6 = -2" },
  { id: "fb13", questionText: "The escape velocity from Earth is 11.2 km/s. The escape velocity from a planet of half the radius and same density is:", options: ["5.6 km/s", "11.2 km/s", "22.4 km/s", "2.8 km/s"], correctOption: 0, explanation: "ve ∝ R if density same. Half radius = half escape velocity = 5.6 km/s" },
  { id: "fb14", questionText: "The IUPAC name of CH₃CH₂CH₂OH is:", options: ["Propan-1-ol", "Propan-2-ol", "Propanol", "Propyl alcohol"], correctOption: 0, explanation: "3-carbon chain with -OH at terminal carbon: propan-1-ol" },
  { id: "fb15", questionText: "The probability of getting exactly 2 heads in 3 coin tosses is:", options: ["3/8", "1/8", "1/4", "1/2"], correctOption: 0, explanation: "P = ³C₂(1/2)²(1/2) = 3 × 1/8 = 3/8" },
  { id: "fb16", questionText: "The area bounded by y = x², x-axis, x=0 and x=1 is:", options: ["1/3", "1", "2/3", "1/2"], correctOption: 0, explanation: "∫₀¹ x²dx = [x³/3]₀¹ = 1/3" },
  { id: "fb17", questionText: "Benzene undergoes which type of reaction most readily?", options: ["Electrophilic substitution", "Nucleophilic substitution", "Addition", "Elimination"], correctOption: 0, explanation: "Benzene undergoes electrophilic aromatic substitution (e.g., nitration, halogenation)." },
  { id: "fb18", questionText: "A car accelerates from rest at 2 m/s² for 5 s. The distance covered is:", options: ["25 m", "10 m", "50 m", "20 m"], correctOption: 0, explanation: "s = ut + ½at² = 0 + ½×2×25 = 25 m" },
  { id: "fb19", questionText: "The value of cos 60° is:", options: ["1/2", "√3/2", "1/√2", "0"], correctOption: 0, explanation: "cos 60° = 1/2" },
  { id: "fb20", questionText: "The hybridization of carbon in methane is:", options: ["sp³", "sp²", "sp", "dsp²"], correctOption: 0, explanation: "In CH₄, carbon has 4 sigma bonds and tetrahedral geometry: sp³ hybridization." },
]

export const generateMockQuestions = (count: number): Question[] => {
  const questions: Question[] = []
  for (let i = 0; i < count; i++) {
    if (i < fallbackBank.length) {
      const q = { ...fallbackBank[i] }
      q.id = `q${i + 1}`
      questions.push(q)
    } else {
      const q = { ...fallbackBank[i % fallbackBank.length] }
      q.id = `q${i + 1}`
      questions.push(q)
    }
  }
  return questions
}
