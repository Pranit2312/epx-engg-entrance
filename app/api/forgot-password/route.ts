import { resetUserPasswordByEmail } from "@/lib/data-service"
import { error, parseBody, serverError, success } from "@/lib/api-response"

export async function POST(request: Request) {
  try {
    const { data: body, error: bodyError } = await parseBody<{
      email: string
      password: string
    }>(request)
    if (bodyError) return bodyError

    const email = body?.email.trim().toLowerCase()
    const password = body?.password

    if (!email || !password) {
      return error("VALIDATION_ERROR", "Email and new password are required")
    }

    if (password.length < 6) {
      return error("VALIDATION_ERROR", "Password must be at least 6 characters")
    }

    const user = await resetUserPasswordByEmail(email, password)
    if (!user) {
      return error("NOT_FOUND", "No account was found with this email address", 404)
    }

    return success({ message: "Password reset successfully" })
  } catch (caughtError) {
    console.error("Password reset error:", caughtError)
    return serverError(caughtError)
  }
}