import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { parseCSV, validateCSVQuestion, convertCorrectAnswerToIndex, CSVQuestion } from "@/lib/utils/csv-parser"
import { success, error, unauthorized, serverError } from "@/lib/api-response"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "ADMIN") {
      return unauthorized()
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const fileType = formData.get("type") as string

    if (!file) {
      return error("VALIDATION_ERROR", "No file provided")
    }

    const text = await file.text()
    let questions: CSVQuestion[] = []
    const errors: string[] = []

    if (fileType === "json") {
      const jsonData = JSON.parse(text)
      questions = Array.isArray(jsonData) ? jsonData : [jsonData]
    } else if (fileType === "csv") {
      questions = parseCSV(text)
    } else {
      return error("VALIDATION_ERROR", "Unsupported file type. Use CSV or JSON")
    }

    // Validate and create questions
    const createdQuestions = []
    const skippedQuestions = []

    for (const q of questions) {
      const validation = validateCSVQuestion(q)
      
      if (!validation.valid) {
        skippedQuestions.push({ question: q.question, errors: validation.errors })
        errors.push(`Question skipped: ${q.question.substring(0, 50)}... - ${validation.errors.join(', ')}`)
        continue
      }

      try {
        const question = await prisma.question.create({
          data: {
            questionText: q.question,
            options: [q.optionA, q.optionB, q.optionC, q.optionD],
            correctOption: convertCorrectAnswerToIndex(q.correctAnswer),
            explanation: q.explanation || null,
            subject: q.subject,
            chapter: q.chapter || null,
            topic: q.topic || null,
            difficulty: q.difficulty.toUpperCase() as any,
            examType: q.exam.toUpperCase() as any,
            order: 0,
            embedding: "",
            imagePath: q.imagePath || null,
            marks: 4,
            negativeMarks: 1,
          },
        })
        createdQuestions.push(question)
      } catch (error) {
        errors.push(`Failed to create question: ${q.question.substring(0, 50)}...`)
        console.error("Question creation error:", error)
      }
    }

    return success({ 
      uploaded: createdQuestions.length,
      skipped: skippedQuestions.length,
      errors: errors.slice(0, 10), // Return first 10 errors
      questions: createdQuestions 
    })
  } catch (error) {
    console.error("Bulk upload error:", error)
    return serverError(error)
  }
}
