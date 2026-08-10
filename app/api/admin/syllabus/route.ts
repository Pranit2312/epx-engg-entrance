import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { ExamType } from "@/lib/profile-types"
import { success, error, unauthorized, serverError, parseBody } from "@/lib/api-response"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "ADMIN") {
      return unauthorized()
    }
    const { searchParams } = new URL(request.url)
    const examType = searchParams.get("examType")
    const subject = searchParams.get("subject")
    const where: any = {}
    if (examType) where.examType = examType
    if (subject) where.subject = subject
    const chapters = await prisma.syllabusChapter.findMany({ where, orderBy: [{ subject: "asc" }, { chapter: "asc" }] })
    return success({ chapters })
  } catch (error) {
    return serverError(error)
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "ADMIN") {
      return unauthorized()
    }

    const { data: body, error: bodyError } = await parseBody<{
      examType: ExamType
      subject: string
      chapter: string
      topics?: string[]
    }>(request)

    if (bodyError) return bodyError

    const { examType, subject, chapter, topics } = body!

    const existing = await prisma.syllabusChapter.findUnique({
      where: { examType_subject_chapter: { examType, subject, chapter } },
    })

    if (existing) {
      return error(
        "CONFLICT",
        "Chapter already exists for this exam and subject",
        409
      )
    }

    const record = await prisma.syllabusChapter.create({ data: { examType, subject, chapter, topics: topics || [] } })

    return success({ chapter: record })
  } catch (error) {
    return serverError(error)
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "ADMIN") {
      return unauthorized()
    }
    const { data: body, error: bodyError } = await parseBody<any>(request)
    if (bodyError) return bodyError
    const { id, ...data } = body!
    const record = await prisma.syllabusChapter.update({ where: { id }, data })
    return success({ chapter: record })
  } catch (error) {
    return serverError(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "ADMIN") {
      return unauthorized()
    }
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return error("VALIDATION_ERROR", "id required")
    await prisma.syllabusChapter.delete({ where: { id } })
    return success({ success: true })
  } catch (error) {
    return serverError(error)
  }
}
