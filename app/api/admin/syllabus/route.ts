import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const examType = searchParams.get("examType")
    const subject = searchParams.get("subject")
    const where: any = {}
    if (examType) where.examType = examType
    if (subject) where.subject = subject
    const chapters = await prisma.syllabusChapter.findMany({ where, orderBy: [{ subject: "asc" }, { chapter: "asc" }] })
    return NextResponse.json({ chapters })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch syllabus" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { examType, subject, chapter, topics } = body
    const existing = await prisma.syllabusChapter.findUnique({
      where: { examType_subject_chapter: { examType, subject, chapter } },
    })
    if (existing) {
      return NextResponse.json({ error: "Chapter already exists for this exam and subject" }, { status: 409 })
    }
    const record = await prisma.syllabusChapter.create({ data: { examType, subject, chapter, topics: topics || [] } })
    return NextResponse.json({ chapter: record })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create chapter" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    const record = await prisma.syllabusChapter.update({ where: { id }, data })
    return NextResponse.json({ chapter: record })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update chapter" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    await prisma.syllabusChapter.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete chapter" }, { status: 500 })
  }
}
