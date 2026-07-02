export interface Question {
  id: string
  questionText: string
  options: string[]
  correctOption: number
  explanation?: string
}

export const generateMockQuestions = (count: number): Question[] => {
  const questions: Question[] = []
  
  for (let i = 1; i <= count; i++) {
    questions.push({
      id: `q${i}`,
      questionText: `Question ${i}: This is a sample question for the mock test. In a real application, this would contain actual exam content related to the subject. The question would test your understanding of key concepts and problem-solving abilities.`,
      options: [
        "Option A: This is the first option",
        "Option B: This is the second option",
        "Option C: This is the third option",
        "Option D: This is the fourth option"
      ],
      correctOption: Math.floor(Math.random() * 4),
      explanation: `This is the explanation for question ${i}. It explains why the correct answer is right and why the other options are incorrect.`
    })
  }
  
  return questions
}
