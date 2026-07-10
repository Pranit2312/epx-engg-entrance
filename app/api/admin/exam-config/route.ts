import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { success, error, unauthorized, serverError, parseBody } from "@/lib/api-response"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "ADMIN") {
      return unauthorized()
    }
    const configs = await prisma.examConfig.findMany({ orderBy: { examType: "asc" } })
    return success({ configs })
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
    const config = await prisma.examConfig.update({ where: { id }, data })
    return success({ config })
  } catch (error) {
    return serverError(error)
  }
}
