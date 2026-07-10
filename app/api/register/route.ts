import { NextResponse } from "next/server"
import { createUser, findUserByEmail } from "@/lib/data-service"
import { seedDefaultWeakTopics } from "@/lib/services/analytics"
import { success, error, serverError, parseBody } from "@/lib/api-response"

export async function POST(request: Request) {
  try {
    const { data: body, error: bodyError } = await parseBody<{ name?: string; email: string; password: string }>(request)
    if (bodyError) return bodyError
    const { name, email, password } = body!

    if (!email || !password) {
      return error("VALIDATION_ERROR", "Missing required fields")
    }

    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return error("CONFLICT", "User with this email already exists", 409)
    }

    const user = await createUser({
      name: name ?? null,
      email,
      password,
    })

    if (!user) {
      return error("SERVICE_UNAVAILABLE", "Failed to create user. Database may be unavailable.", 503)
    }

    // Seed demo weak topics for immediate AI Mentor functionality
    await seedDefaultWeakTopics(user.id, "JEE_MAIN").catch(() => {})

    return success({ user: { id: user.id, email: user.email, name: user.name } }, 201)
  } catch (error) {
    console.error("Registration error:", error)
    return serverError(error)
  }
}
