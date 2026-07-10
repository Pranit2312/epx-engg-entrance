import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { success, unauthorized, serverError, parseBody } from "@/lib/api-response"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "ADMIN") {
      return unauthorized()
    }

    const questions = await prisma.question.findMany({
      orderBy: { createdAt: "desc" },
    })

    return success({ questions })
  } catch (error) {
    console.error("Failed to fetch questions:", error)
    return serverError(error)
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "ADMIN") {
      return unauthorized()
    }

    const { data: body, error: bodyError } = await parseBody<any>(request)
    if (bodyError) return bodyError
    const { questionText, options, correctOption, explanation, subject, chapter, topic, difficulty, examType } = body!

    const question = await prisma.question.create({
      data: {
        questionText,
        options,
        correctOption,
        explanation,
        subject,
        chapter,
        topic,
        difficulty,
        examType,
        order: 0,
        embedding: "",
      },
    })

    return success({ question }, 201)
  } catch (error) {
    console.error("Failed to create question:", error)
    return serverError(error)
  }
}
