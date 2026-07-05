import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { bookmarkService } from "@/services/bookmark-service"

export async function GET() {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const bookmarks = await bookmarkService.getBookmarks(session.user.id)
    return NextResponse.json(bookmarks)
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
    const { testId } = await request.json()
    if (!testId) {
      return NextResponse.json({ error: "testId is required" }, { status: 400 })
    }
    const bookmark = await bookmarkService.addBookmark(session.user.id, testId)
    return NextResponse.json(bookmark ?? { error: "Failed to bookmark" }, { status: bookmark ? 201 : 500 })
  } catch {
    return NextResponse.json({ error: "Failed to bookmark" }, { status: 500 })
  }
}
