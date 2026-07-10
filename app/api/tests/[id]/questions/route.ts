import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { success, error, unauthorized, serverError } from "@/lib/api-response"
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return unauthorized()
  }

  let id: string
  try {
    const p = await params
    id = p.id
  } catch {
    return error("VALIDATION_ERROR", "Invalid test ID")
  }

  if (!id || typeof id !== "string" || id.trim() === "") {
    return error("VALIDATION_ERROR", "Test ID is required")
  }

  try {
    const questions = await prisma.question.findMany({
      where: { mockTestId: id },
      orderBy: { order: "asc" },
      select: {
        id: true,
        questionText: true,
        options: true,
        correctOption: true,
        explanation: true,
        subject: true,
        chapter: true,
        topic: true,
        difficulty: true,
      },
    })

    return success({ questions, fallback: false, source: "database" })
  } catch (error) {
    console.error("Failed to fetch questions:", error)
    return serverError(error)
  }
}
