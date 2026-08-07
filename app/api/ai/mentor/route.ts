import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateMentorResponse } from "@/lib/services/ai-service"
import { requireAIAccess } from "@/lib/ai/access"
import { buildMentorContext } from "@/lib/ai/context-builder"
import { createRequestLogger } from "@/lib/logger"
import { success, error, unauthorized, forbidden, serverError, parseBody } from "@/lib/api-response"

export async function POST(request: Request) {
  const requestId = crypto.randomUUID().slice(0, 8)
  const logger = createRequestLogger("AI")
  logger.info(`[AI:Mentor:${requestId}] POST /api/ai/mentor`)

  try {
    const session = await getServerSession(authOptions)
    logger.info(`[AI:Mentor:${requestId}] Session: ${session ? `found (user=${session.user?.id}, role=${session.user?.role})` : "NOT FOUND"}`)

    if (!session?.user?.id) {
      logger.info(`[AI:Mentor:${requestId}] Auth FAILED — no session`)
      return unauthorized()
    }

    const hasAccess = await requireAIAccess(session.user.id)
    logger.info(`[AI:Mentor:${requestId}] Access check: ${hasAccess}`)
    if (!hasAccess) {
      return forbidden("AI Mentor requires a premium subscription")
    }

    const { data: body, error: bodyError } = await parseBody<{ message: string }>(request)
    if (bodyError) return bodyError
    const { message } = body!
    logger.info(`[AI:Mentor:${requestId}] Message received: "${message?.substring(0, 50)}..."`)

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      logger.info(`[AI:Mentor:${requestId}] Validation FAILED — empty message`)
      return error("VALIDATION_ERROR", "Message is required")
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { targetExam: true, preferredSubjects: true, name: true },
    })

    const { intent, shouldUseAnalytics, context, isDemo } = await buildMentorContext({
      userId: session.user.id,
      message,
      targetExam: user?.targetExam ?? "JEE_MAIN",
      userName: user?.name ?? undefined,
      preferredSubjects: user?.preferredSubjects ?? undefined,
    })

    logger.info(`[AI:Mentor:${requestId}] Context built: intent=${intent}, analytics=${shouldUseAnalytics}, demo=${isDemo}`)

    const reply = await generateMentorResponse(message, context)
    logger.info(`[AI:Mentor:${requestId}] AI response: ${reply.substring(0, 80)}...`)

    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    })

    if (userExists) {
      try {
        await prisma.$transaction([
          prisma.chatHistory.create({
            data: { userId: session.user.id, role: "user", content: message, context: { ...context, isDemo, intent } as any },
          }),
          prisma.chatHistory.create({
            data: { userId: session.user.id, role: "assistant", content: reply, context: { ...context, isDemo, intent } as any },
          }),
        ])
      } catch (saveError: any) {
        logger.error(`[AI:Mentor:${requestId}] Failed to save chat history`, saveError as Error)
      }
    } else {
      logger.info(`[AI:Mentor:${requestId}] User ${session.user.id} not found in DB, skipping chat history save`)
    }

    return success({ reply, isDemo, intent })
  } catch (error: any) {
    logger.error(`[AI:Mentor:${requestId}] ERROR`, error as Error)
    return serverError(error)
  }
}
