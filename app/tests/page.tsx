"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Clock3, Search, Target, RotateCcw, Bookmark, FileText, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { getExamLabel } from "@/config/exams"
import { DIFFICULTY_COLORS } from "@/config/scoring"

type TestItem = {
  id: string
  name: string
  examType: string
  subject: string
  duration: number
  totalQuestions: number
  difficulty: string
  description?: string | null
}

export default function TestsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tests, setTests] = useState<TestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedExam, setSelectedExam] = useState("all")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [sortBy, setSortBy] = useState("latest")
  const { isBookmarked, toggleBookmark } = useBookmarks()

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    const loadTests = async () => {
      try {
        const response = await fetch("/api/tests")
        const data = await response.json()
        setTests(data)
      } catch {
        setTests([])
      }
      setLoading(false)
    }
    loadTests()
  }, [])

  const subjects = useMemo(() => {
    const unique = [...new Set(tests.map((t) => t.subject))]
    return ["all", ...unique]
  }, [tests])

  const filteredTests = useMemo(() => {
    let result = tests.filter((test) => {
      const matchesSearch = `${test.name} ${test.subject} ${getExamLabel(test.examType)}`.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesExam = selectedExam === "all" || test.examType === selectedExam
      const matchesSubject = selectedSubject === "all" || test.subject === selectedSubject
      const matchesDifficulty = selectedDifficulty === "all" || test.difficulty === selectedDifficulty
      return matchesSearch && matchesExam && matchesSubject && matchesDifficulty
    })
    if (sortBy === "latest") result = [...result].reverse()
    return result
  }, [tests, searchQuery, selectedExam, selectedSubject, selectedDifficulty, sortBy])

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedExam("all")
    setSelectedSubject("all")
    setSelectedDifficulty("all")
  }

  if (status === "loading" || loading) {
    return (
      <AppShell>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading mock tests...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (!session) return null

  return (
    <AppShell>
      <div className="space-y-5">
        <WelcomeBanner />

        {/* Search & Filters */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tests by name or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 border-border bg-muted pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={selectedExam} onValueChange={(v) => setSelectedExam(v ?? "all")}>
                <SelectTrigger className="h-10 w-[130px] border-border bg-muted">
                  <SelectValue placeholder="All Exams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exams</SelectItem>
                  <SelectItem value="JEE_MAIN">JEE Main</SelectItem>
                  <SelectItem value="JEE_ADVANCED">JEE Advanced</SelectItem>
                  <SelectItem value="MHT_CET">MHT-CET</SelectItem>
                  <SelectItem value="NEET">NEET</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedSubject} onValueChange={(v) => setSelectedSubject(v ?? "all")}>
                <SelectTrigger className="h-10 w-[130px] border-border bg-muted">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s} value={s}>{s === "all" ? "All Subjects" : s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDifficulty} onValueChange={(v) => setSelectedDifficulty(v ?? "all")}>
                <SelectTrigger className="h-10 w-[130px] border-border bg-muted">
                  <SelectValue placeholder="All Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulty</SelectItem>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={resetFilters}
                className="flex h-10 items-center gap-1.5 rounded-xl border border-border bg-muted px-3 text-sm text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">All Mock Tests</h2>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v ?? "latest")}>
            <SelectTrigger className="h-8 w-[120px] border-border bg-muted text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Test Grid */}
        {filteredTests.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-16 text-center">
            <Search className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold">No tests match your filters</h3>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or reset the filters.</p>
            <button onClick={resetFilters} className="mt-4 rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className="group rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-border/80 hover:bg-muted hover:shadow-lg hover:shadow-violet-600/5"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-violet-300">
                    {getExamLabel(test.examType)}
                  </span>
                  <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", DIFFICULTY_COLORS[test.difficulty] || "")}>
                    {test.difficulty}
                  </span>
                </div>

                <h3 className="font-semibold leading-snug">{test.name}</h3>
                {test.description && (
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{test.description}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-[10px] text-muted-foreground">
                    <BookOpen className="h-3 w-3" />
                    {test.subject}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-[10px] text-muted-foreground">
                    <Clock3 className="h-3 w-3" />
                    {test.duration} mins
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-[10px] text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    {test.totalQuestions} Questions
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link href={`/test/${test.id}`} className="flex-1">
                    <button className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-indigo-600/30 active:scale-[0.98]">
                      Start Test
                    </button>
                  </Link>
                  <button
                    onClick={() => toggleBookmark(test.id)}
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all",
                      isBookmarked(test.id)
                        ? "border-violet-500/30 bg-violet-500/15 text-violet-400"
                        : "border-border bg-muted text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Bookmark className={cn("h-4 w-4", isBookmarked(test.id) && "fill-current")} />
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
