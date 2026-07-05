import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(tickets)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { subject, description, priority } = await request.json()
    if (!subject || !description) {
      return NextResponse.json({ error: "subject and description are required" }, { status: 400 })
    }
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        subject,
        description,
        priority: priority ?? "MEDIUM",
        status: "OPEN",
      },
    })
    return NextResponse.json(ticket, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 })
  }
}
