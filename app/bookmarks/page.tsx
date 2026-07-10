"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Bookmark, BookOpen, Clock3, Target, Trash2, Loader2, ChevronRight } from "lucide-react"
import { getExamLabel } from "@/config/exams"
import { DIFFICULTY_COLORS } from "@/config/scoring"

type BookmarkItem = {
  id: string
  testId: string
  createdAt: string
  test: {
    id: string
    name: string
    examType: string
    subject: string
    duration: number
    totalQuestions: number
    difficulty: string
    description?: string | null
  }
}

export default function BookmarksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (!session?.user?.id) return
    const load = async () => {
      try {
        const res = await fetch("/api/bookmarks")
        const data = await res.json()
        if (data.success && Array.isArray(data.data)) setBookmarks(data.data)
      } catch {
        setBookmarks([])
      }
      setLoading(false)
    }
    load()
  }, [session?.user?.id])

  const removeBookmark = async (testId: string) => {
    setBookmarks((prev) => prev.filter((b) => b.testId !== testId))
    try {
      await fetch(`/api/bookmarks/${testId}`, { method: "DELETE" })
    } catch {
      // reload on error
      const res = await fetch("/api/bookmarks")
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) setBookmarks(data.data)
    }
  }

  if (status === "loading" || loading) {
    return (
      <AppShell showRightPanel={false}>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
        </div>
      </AppShell>
    )
  }

  if (!session) return null

  return (
    <AppShell showRightPanel={false}>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Bookmarks</h1>
            <p className="text-sm text-muted-foreground">
              {bookmarks.length} bookmarked {bookmarks.length === 1 ? "test" : "tests"}
            </p>
          </div>
          {bookmarks.length > 0 && (
            <Link href="/tests">
              <Button className="btn-gradient rounded-xl">
                <BookOpen className="mr-2 h-4 w-4" />
                Explore Tests
              </Button>
            </Link>
          )}
        </div>

        {bookmarks.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-16 text-center">
            <Bookmark className="mx-auto mb-4 h-12 w-12 text-violet-400/50" />
            <h3 className="text-lg font-semibold">No bookmarks yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Bookmark tests to quickly access them here.
            </p>
            <Link href="/tests">
              <Button className="btn-gradient mt-4 rounded-xl">
                Browse Tests
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {bookmarks.map((b) => (
              <div
                key={b.id}
                className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-border/80 hover:bg-muted"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-violet-300">
                    {getExamLabel(b.test.examType)}
                  </span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${DIFFICULTY_COLORS[b.test.difficulty] || ""}`}>
                    {b.test.difficulty}
                  </span>
                </div>

                <h3 className="font-semibold leading-snug">{b.test.name}</h3>
                {b.test.description && (
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{b.test.description}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-[10px] text-muted-foreground">
                    <BookOpen className="h-3 w-3" /> {b.test.subject}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-[10px] text-muted-foreground">
                    <Clock3 className="h-3 w-3" /> {b.test.duration}m
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-[10px] text-muted-foreground">
                    <Target className="h-3 w-3" /> {b.test.totalQuestions}Q
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link href={`/test/${b.test.id}`} className="flex-1">
                    <button className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-indigo-600/30 active:scale-[0.98]">
                      Start Test
                    </button>
                  </Link>
                  <button
                    onClick={() => removeBookmark(b.testId)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground transition-all hover:border-red-500/30 hover:bg-red-500/15 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
