import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { bookmarkService } from "@/services/bookmark-service"
import { success, unauthorized, serverError } from "@/lib/api-response"

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ testId: string }> }) {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return unauthorized()
  }
  try {
    const { testId } = await params
    await bookmarkService.removeBookmark(session.user.id, testId)
    return success({ success: true })
  } catch {
    return serverError()
  }
}
