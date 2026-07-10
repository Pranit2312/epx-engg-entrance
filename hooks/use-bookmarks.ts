"use client"

import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"

type Bookmark = {
  id: string
  userId: string
  testId: string
  createdAt: string
  test: { id: string; name: string; subject: string; difficulty: string; duration: number; totalQuestions: number }
}

export function useBookmarks() {
  const { data: session } = useSession()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [hasFetched, setHasFetched] = useState(false)

  useEffect(() => {
    if (!session?.user?.id || hasFetched) return
    setHasFetched(true)
    const load = async () => {
      try {
        const res = await fetch("/api/bookmarks")
        const data = await res.json()
        if (data.success && Array.isArray(data.data)) {
          setBookmarks(data.data)
          setBookmarkedIds(new Set(data.data.map((b: Bookmark) => b.testId)))
        }
      } catch {
        // keep empty
      }
      setLoading(false)
    }
    load()
  }, [session?.user?.id, hasFetched])

  const toggleBookmark = useCallback(
    async (testId: string) => {
      const wasBookmarked = bookmarkedIds.has(testId)
      setBookmarkedIds((prev) => {
        const next = new Set(prev)
        if (next.has(testId)) next.delete(testId)
        else next.add(testId)
        return next
      })
      try {
        if (wasBookmarked) {
          await fetch(`/api/bookmarks/${testId}`, { method: "DELETE" })
        } else {
          await fetch("/api/bookmarks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ testId }),
          })
        }
      } catch {
        setBookmarkedIds((prev) => {
          const next = new Set(prev)
          if (wasBookmarked) next.add(testId)
          else next.delete(testId)
          return next
        })
      }
    },
    [bookmarkedIds]
  )

  const isBookmarked = useCallback((testId: string) => bookmarkedIds.has(testId), [bookmarkedIds])

  return { bookmarks, bookmarkedIds, loading, toggleBookmark, isBookmarked }
}
