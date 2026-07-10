import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { bookmarkService } from "@/services/bookmark-service"
import { success, error, unauthorized, serverError, parseBody } from "@/lib/api-response"

export async function GET() {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return unauthorized()
  }
  try {
    const bookmarks = await bookmarkService.getBookmarks(session.user.id)
    return success(bookmarks)
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
    const { data, error: bodyError } = await parseBody<{ testId: string }>(request)
    if (bodyError) return bodyError
    const { testId } = data!
    if (!testId) {
      return error("VALIDATION_ERROR", "testId is required")
    }
    const bookmark = await bookmarkService.addBookmark(session.user.id, testId)
    if (!bookmark) return serverError()
    return success(bookmark, 201)
  } catch {
    return serverError()
  }
}
