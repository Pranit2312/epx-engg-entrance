import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const fileType = formData.get("type") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const text = await file.text()
    let questions: any[] = []

    if (fileType === "json") {
      questions = JSON.parse(text)
    } else if (fileType === "csv") {
      const lines = text.split("\n")
      const headers = lines[0].split(",")
      questions = lines.slice(1).map((line) => {
        const values = line.split(",")
        const question: any = {}
        headers.forEach((header, index) => {
          question[header.trim()] = values[index]?.trim()
        })
        return question
      })
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    // Validate and create questions
    const createdQuestions = []
    for (const q of questions) {
      if (!q.questionText || !q.options || !q.correctOption) {
        continue
      }

      const question = await prisma.question.create({
        data: {
          questionText: q.questionText,
          options: Array.isArray(q.options) ? q.options : JSON.parse(q.options),
          correctOption: parseInt(q.correctOption),
          explanation: q.explanation || null,
          subject: q.subject || "General",
          chapter: q.chapter || null,
          topic: q.topic || null,
          difficulty: q.difficulty || "MEDIUM",
          examType: q.examType || "JEE_MAIN",
          order: 0,
          embedding: "",
        },
      })
      createdQuestions.push(question)
    }

    return NextResponse.json({ 
      success: true, 
      uploaded: createdQuestions.length,
      questions: createdQuestions 
    })
  } catch (error) {
    console.error("Bulk upload error:", error)
    return NextResponse.json({ error: "Bulk upload failed" }, { status: 500 })
  }
}
