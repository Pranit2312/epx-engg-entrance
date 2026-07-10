"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import { Zap, Target, Clock, TrendingUp, Award, Atom, Beaker, Sigma, ChevronRight, ArrowRight, Brain, Flame, Loader2 } from "lucide-react"
import { PRACTICE_SETS, SUBJECT_CHAPTERS } from "@/config/testCategories"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame, Brain, Zap, Atom, Beaker, Sigma,
}

const subjectConfig = [
  { id: "physics", name: "Physics", icon: Atom, gradient: "from-blue-500 to-cyan-500", lightBg: "from-blue-500/10 to-cyan-500/5", description: "Mechanics, Thermodynamics, Optics, Waves & Modern Physics" },
  { id: "chemistry", name: "Chemistry", icon: Beaker, gradient: "from-purple-500 to-pink-500", lightBg: "from-purple-500/10 to-pink-500/5", description: "Organic, Inorganic, Physical Chemistry & More" },
  { id: "mathematics", name: "Mathematics", icon: Sigma, gradient: "from-amber-500 to-orange-500", lightBg: "from-amber-500/10 to-orange-500/5", description: "Algebra, Calculus, Geometry, Trigonometry & Statistics" },
]

const difficultyColors: Record<string, string> = {
  EASY: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  MEDIUM: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  HARD: "border-red-500/20 bg-red-500/10 text-red-400",
}

export default function PracticePage() {
  const router = useRouter()
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [loadingSet, setLoadingSet] = useState<string | null>(null)

  const startPractice = useCallback(async (opts: { subject?: string; chapter?: string; topic?: string; type?: string; difficulty?: string; count?: number; loadingKey?: string }) => {
    setLoadingSet(opts.loadingKey || opts.type || opts.subject || "practice")
    try {
      const res = await fetch("/api/practice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(opts),
      })
      const json = await res.json()
      if (!json.success) {
        alert(json.error?.message || "Failed to generate practice set. Try different options.")
        return
      }
      router.push(`/test/${json.data.testId}`)
    } catch {
      alert("Something went wrong. Please try again.")
    } finally {
      setLoadingSet(null)
    }
  }, [router])

  const expandedSubject = SUBJECT_CHAPTERS.find(s => s.id === selectedSubject)

  return (
    <AppShell>
      <div className="space-y-6">
        <WelcomeBanner />

        {/* Quick Practice Sets */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Quick Practice Sets</h2>
              <p className="text-sm text-muted-foreground">Jump into focused preparation instantly</p>
            </div>
            <Link href="/tests">
              <button className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground">
                View All <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {PRACTICE_SETS.map((set) => {
              const Icon = iconMap[set.icon] || Brain
              const isLoading = loadingSet === set.id
              return (
                <button
                  key={set.id}
                  onClick={() => startPractice({ type: set.id })}
                  disabled={isLoading}
                  className="group cursor-pointer rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-border/80 hover:bg-muted disabled:opacity-60"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${set.gradient}`}>
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <Icon className="h-5 w-5 text-white" />}
                    </div>
                    <div>
                      <h3 className="font-semibold">{set.name}</h3>
                      <p className="text-xs text-muted-foreground">{set.description}</p>
                    </div>
                  </div>
                  <div className="mb-3 flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{set.duration} mins</span>
                    <span className="flex items-center gap-1"><Target className="h-3.5 w-3.5" />{set.questions} questions</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${difficultyColors[set.difficulty] || ""}`}>{set.difficulty}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground">
                      {isLoading ? "Generating..." : "Start"} <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Topics by Subject */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold">Topics by Subject</h2>
            <p className="text-sm text-muted-foreground">Select a subject, then pick a chapter to practice</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {subjectConfig.map((subject) => {
              const Icon = subject.icon
              const isSelected = selectedSubject === subject.id
              return (
                <div key={subject.id}>
                  <button
                    onClick={() => setSelectedSubject(isSelected ? null : subject.id)}
                    className={`group relative w-full rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-border/80 ${isSelected ? "ring-1 ring-violet-500/30" : ""}`}
                  >
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${subject.lightBg} opacity-0 transition-opacity ${isSelected ? "opacity-100" : "group-hover:opacity-100"}`} />
                    <div className="relative">
                      <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${subject.gradient}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-bold">{subject.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{subject.description}</p>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>

          {/* Chapter list for selected subject */}
          {expandedSubject && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground">{expandedSubject.name} — Chapters</h3>
                <button
                  onClick={() => startPractice({ subject: expandedSubject.name, loadingKey: `subject-${expandedSubject.name}` })}
                  className="flex items-center gap-1 text-xs font-medium text-violet-400 hover:text-violet-300"
                >
                  {loadingSet === `subject-${expandedSubject.name}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowRight className="h-3 w-3" />}
                  Practice All
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {expandedSubject.chapters.map((ch) => {
                  const isChapterLoading = loadingSet === `chapter-${ch.name}`
                  return (
                    <div key={ch.name} className="rounded-xl border border-border bg-card p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-medium text-sm">{ch.name}</h4>
                        <button
                          onClick={() => startPractice({ subject: expandedSubject.name, chapter: ch.name, loadingKey: `chapter-${ch.name}` })}
                          disabled={isChapterLoading}
                          className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 disabled:opacity-50"
                        >
                          {isChapterLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                          Practice
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {ch.topics.map((t) => (
                          <button
                            key={t}
                            onClick={() => startPractice({ subject: expandedSubject.name, chapter: ch.name, topic: t, count: 5, loadingKey: `topic-${t}` })}
                            disabled={loadingSet === `topic-${t}`}
                            className="rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-50"
                          >
                            {loadingSet === `topic-${t}` ? <Loader2 className="inline h-3 w-3 animate-spin" /> : t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold">Practice Overview</h2>
            <p className="text-sm text-muted-foreground">Platform capabilities at a glance</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-2 flex items-start justify-between">
                <p className="text-sm text-muted-foreground">Practice Sessions</p>
                <Zap className="h-4 w-4 text-violet-400" />
              </div>
              <p className="text-2xl font-bold">—</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-2 flex items-start justify-between">
                <p className="text-sm text-muted-foreground">Subjects</p>
                <Award className="h-4 w-4 text-violet-400" />
              </div>
              <p className="text-2xl font-bold">{SUBJECT_CHAPTERS.length}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-2 flex items-start justify-between">
                <p className="text-sm text-muted-foreground">Chapters</p>
                <Flame className="h-4 w-4 text-violet-400" />
              </div>
              <p className="text-2xl font-bold">{SUBJECT_CHAPTERS.reduce((s, c) => s + c.chapters.length, 0)}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-2 flex items-start justify-between">
                <p className="text-sm text-muted-foreground">Difficulty Levels</p>
                <TrendingUp className="h-4 w-4 text-violet-400" />
              </div>
              <p className="text-2xl font-bold">3</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function Play({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}
