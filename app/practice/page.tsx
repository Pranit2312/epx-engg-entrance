"use client"

import { useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import { BookOpen, Zap, Target, Clock, TrendingUp, Award, Atom, Beaker, Sigma, ChevronRight, ArrowRight, BarChart3, Brain, Flame } from "lucide-react"
import { PRACTICE_SETS } from "@/config/testCategories"
import { SUBJECTS } from "@/config/subjects"
import { SCORING } from "@/config/scoring"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame, Brain, Zap, Atom, Beaker, Sigma,
}

const subjectConfig = [
  { id: "physics", name: "Physics", icon: Atom, gradient: "from-blue-500 to-cyan-500", lightBg: "from-blue-500/10 to-cyan-500/5", description: "Mechanics, Thermodynamics, Optics, Waves & Modern Physics" },
  { id: "chemistry", name: "Chemistry", icon: Beaker, gradient: "from-purple-500 to-pink-500", lightBg: "from-purple-500/10 to-pink-500/5", description: "Organic, Inorganic, Physical Chemistry & More" },
  { id: "mathematics", name: "Mathematics", icon: Sigma, gradient: "from-amber-500 to-orange-500", lightBg: "from-amber-500/10 to-orange-500/5", description: "Algebra, Calculus, Geometry, Trigonometry & Statistics" },
]

const stats = [
  { label: "Practice Sessions", value: "—", icon: Zap, change: null },
  { label: "Topics Available", value: String(SUBJECTS.length), icon: Award, change: null },
  { label: "Difficulty Levels", value: "3", icon: Flame, change: null },
  { label: "Avg Duration", value: "—", icon: TrendingUp, change: null },
]

export default function PracticePage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)

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
              const Icon = iconMap[set.icon] || BookOpen
              return (
                <div key={set.id} className="group cursor-pointer rounded-2xl border border-border bg-card p-5 transition-all hover:border-border/80 hover:bg-muted">
                  <div className="mb-3 flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${set.gradient}`}>
                      <Icon className="h-5 w-5 text-white" />
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
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                      set.difficulty === "EASY" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" :
                      set.difficulty === "MEDIUM" ? "border-blue-500/20 bg-blue-500/10 text-blue-400" :
                      "border-red-500/20 bg-red-500/10 text-red-400"
                    }`}>{set.difficulty}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground">
                      Start <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Subject Selection */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold">Topics by Subject</h2>
            <p className="text-sm text-muted-foreground">Select a subject to view topic-wise practice options</p>
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
        </div>

        {/* Stats */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold">Practice Overview</h2>
            <p className="text-sm text-muted-foreground">Platform capabilities at a glance</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className="rounded-2xl border border-border bg-card p-5">
                  <div className="mb-2 flex items-start justify-between">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <Icon className="h-4 w-4 text-violet-400" />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {stat.change && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      {stat.change}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
