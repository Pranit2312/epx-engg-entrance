import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { success, unauthorized, serverError, parseBody } from "@/lib/api-response"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "ADMIN") {
      return unauthorized()
    }

    const { data: body, error: bodyError } = await parseBody<any>(request)
    if (bodyError) return bodyError
    const { questionText, options, correctOption, explanation, subject, chapter, topic, difficulty, examType } = body!
    const { id } = await params

    const question = await prisma.question.update({
      where: { id },
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
      },
    })

    return success({ question })
  } catch (error) {
    console.error("Failed to update question:", error)
    return serverError(error)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "ADMIN") {
      return unauthorized()
    }

    await prisma.question.delete({
      where: { id },
    })

    return success({ success: true })
  } catch (error) {
    console.error("Failed to delete question:", error)
    return serverError(error)
  }
}
