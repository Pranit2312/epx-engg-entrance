import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TicketPriority } from "@prisma/client"
import { success, error, unauthorized, serverError, parseBody } from "@/lib/api-response"

export async function GET() {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return unauthorized()
  }
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })
    return success(tickets)
  } catch {
    return success([])
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return unauthorized()
  }
  try {
    const { data, error: bodyError } = await parseBody<{ subject: string; description: string; priority?: string }>(request)
    if (bodyError) return bodyError
    const { subject, description, priority } = data!
    if (!subject || !description) {
      return error("VALIDATION_ERROR", "subject and description are required")
    }
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        subject,
        description,
        priority: (priority ?? "MEDIUM") as TicketPriority,
      },
    })
    return success(ticket, 201)
  } catch {
    return serverError()
  }
}
