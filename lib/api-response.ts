import { NextResponse } from "next/server"

interface SuccessResponse<T = unknown> {
  success: true
  data: T
}

interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
  }
}

export function success<T>(data: T, status = 200): NextResponse<SuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status })
}

export function error(code: string, message: string, status = 400): NextResponse<ErrorResponse> {
  return NextResponse.json({ success: false, error: { code, message } }, { status })
}

export function unauthorized(message = "Unauthorized"): NextResponse<ErrorResponse> {
  return error("UNAUTHORIZED", message, 401)
}

export function forbidden(message = "Forbidden"): NextResponse<ErrorResponse> {
  return error("FORBIDDEN", message, 403)
}

export function notFound(message = "Not found"): NextResponse<ErrorResponse> {
  return error("NOT_FOUND", message, 404)
}

export function serverError(err?: unknown): NextResponse<ErrorResponse> {
  const message = err instanceof Error && process.env.NODE_ENV === "development" ? err.message : "Internal server error"
  return error("INTERNAL_ERROR", message, 500)
}

export async function parseBody<T>(request: Request): Promise<{ data: T | null; error: NextResponse | null }> {
  try {
    const data = (await request.json()) as T
    return { data, error: null }
  } catch {
    return { data: null, error: error("INVALID_JSON", "Invalid JSON in request body") }
  }
}
