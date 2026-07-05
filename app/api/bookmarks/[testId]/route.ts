import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { bookmarkService } from "@/services/bookmark-service"

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ testId: string }> }) {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { testId } = await params
    await bookmarkService.removeBookmark(session.user.id, testId)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to remove bookmark" }, { status: 500 })
  }
}
