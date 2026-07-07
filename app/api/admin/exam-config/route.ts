import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const configs = await prisma.examConfig.findMany({ orderBy: { examType: "asc" } })
    return NextResponse.json({ configs })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch exam configs" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    const config = await prisma.examConfig.update({ where: { id }, data })
    return NextResponse.json({ config })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update exam config" }, { status: 500 })
  }
}
