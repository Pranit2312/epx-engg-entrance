export interface CSVQuestion {
  subject: string
  chapter: string
  topic: string
  difficulty: string
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  explanation: string
  exam: string
  imagePath?: string
}

export function parseCSV(csvText: string): CSVQuestion[] {
  const lines = csvText.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const questions: CSVQuestion[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const question: any = {}

    headers.forEach((header, index) => {
      question[header] = values[index]?.trim() || ''
    })

    // Map CSV columns to our format
    const mappedQuestion: CSVQuestion = {
      subject: question.subject || question.subjects || '',
      chapter: question.chapter || question.chapters || '',
      topic: question.topic || question.topics || '',
      difficulty: question.difficulty || 'MEDIUM',
      question: question.question || question.questiontext || question.question_text || '',
      optionA: question.optiona || question.option_a || question.a || '',
      optionB: question.optionb || question.option_b || question.b || '',
      optionC: question.optionc || question.option_c || question.c || '',
      optionD: question.optiond || question.option_d || question.d || '',
      correctAnswer: question.correctanswer || question.correct_answer || question.correct || '',
      explanation: question.explanation || '',
      exam: question.exam || question.examtype || question.exam_type || 'JEE_MAIN',
      imagePath: question.imagepath || question.image_path || question.image || undefined
    }

    // Validate required fields
    if (mappedQuestion.question && mappedQuestion.optionA && mappedQuestion.optionB && 
        mappedQuestion.optionC && mappedQuestion.optionD && mappedQuestion.correctAnswer) {
      questions.push(mappedQuestion)
    }
  }

  return questions
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current)
  return result
}

export function validateCSVQuestion(question: CSVQuestion): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!question.subject) errors.push('Subject is required')
  if (!question.chapter) errors.push('Chapter is required')
  if (!question.question) errors.push('Question is required')
  if (!question.optionA) errors.push('Option A is required')
  if (!question.optionB) errors.push('Option B is required')
  if (!question.optionC) errors.push('Option C is required')
  if (!question.optionD) errors.push('Option D is required')
  if (!question.correctAnswer) errors.push('Correct answer is required')

  const validDifficulties = ['EASY', 'MEDIUM', 'HARD']
  if (question.difficulty && !validDifficulties.includes(question.difficulty.toUpperCase())) {
    errors.push('Invalid difficulty. Must be EASY, MEDIUM, or HARD')
  }

  const validExams = ['JEE_MAIN', 'JEE_ADVANCED', 'MHT_CET', 'BITSAT', 'VITEEE', 'COMEDK', 'KCET', 'WBJEE', 'GUJCET']
  if (question.exam && !validExams.includes(question.exam.toUpperCase())) {
    errors.push('Invalid exam type')
  }

  const validAnswers = ['A', 'B', 'C', 'D', '0', '1', '2', '3']
  if (question.correctAnswer && !validAnswers.includes(question.correctAnswer.toUpperCase())) {
    errors.push('Invalid correct answer. Must be A, B, C, or D')
  }

  return { valid: errors.length === 0, errors }
}

export function convertCorrectAnswerToIndex(correctAnswer: string): number {
  const answer = correctAnswer.toUpperCase()
  const mapping: { [key: string]: number } = {
    'A': 0,
    'B': 1,
    'C': 2,
    'D': 3,
    '0': 0,
    '1': 1,
    '2': 2,
    '3': 3
  }
  return mapping[answer] ?? 0
}
