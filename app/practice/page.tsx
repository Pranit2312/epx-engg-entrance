"use client"

import { useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import { BookOpen, Zap, Target, Clock, TrendingUp, Award, Atom, Beaker, Sigma, ChevronRight, ArrowRight, BarChart3, Brain, Flame } from "lucide-react"

const subjects = [
  { id: "physics", name: "Physics", icon: Atom, gradient: "from-blue-500 to-cyan-500", lightBg: "from-blue-500/10 to-cyan-500/5", description: "Mechanics, Thermodynamics, Optics, Waves & Modern Physics", topics: ["Mechanics", "Thermodynamics", "Optics", "Waves & Sound", "Electromagnetism", "Modern Physics"], completed: 8, total: 12 },
  { id: "chemistry", name: "Chemistry", icon: Beaker, gradient: "from-purple-500 to-pink-500", lightBg: "from-purple-500/10 to-pink-500/5", description: "Organic, Inorganic, Physical Chemistry & More", topics: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Biochemistry", "Environmental Chem"], completed: 6, total: 12 },
  { id: "mathematics", name: "Mathematics", icon: Sigma, gradient: "from-amber-500 to-orange-500", lightBg: "from-amber-500/10 to-orange-500/5", description: "Algebra, Calculus, Geometry, Trigonometry & Statistics", topics: ["Calculus", "Algebra", "Geometry", "Trigonometry", "Statistics", "Probability"], completed: 10, total: 12 },
]

const quickSets = [
  { id: 1, name: "Daily Revision", description: "Quick 15-min refresher on key concepts", duration: 15, questions: 10, difficulty: "EASY", icon: Flame, gradient: "from-emerald-500 to-green-500" },
  { id: 2, name: "Weak Areas Focus", description: "Target your weak spots with precision", duration: 30, questions: 20, difficulty: "MEDIUM", icon: Brain, gradient: "from-amber-500 to-orange-500" },
  { id: 3, name: "Challenge Mode", description: "Push your limits with advanced problems", duration: 45, questions: 30, difficulty: "HARD", icon: Zap, gradient: "from-red-500 to-pink-500" },
]

const stats = [
  { label: "Practice Sessions", value: "24", icon: Zap, change: "+3 this week" },
  { label: "Topics Mastered", value: "12", icon: Award, change: "2 in progress" },
  { label: "Current Streak", value: "7 days", icon: Flame, change: "Keep going!" },
  { label: "Avg Accuracy", value: "84%", icon: TrendingUp, change: "+5% improvement" },
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
              <button className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-white/[0.08] hover:text-foreground">
                View All <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {quickSets.map((set) => {
              const Icon = set.icon
              return (
                <div key={set.id} className="group cursor-pointer rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]">
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
            {subjects.map((subject) => {
              const Icon = subject.icon
              const isSelected = selectedSubject === subject.id
              const progress = Math.round((subject.completed / subject.total) * 100)
              return (
                <div key={subject.id}>
                  <button
                    onClick={() => setSelectedSubject(isSelected ? null : subject.id)}
                    className={`group relative w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-left transition-all hover:border-white/[0.12] ${isSelected ? "ring-1 ring-violet-500/30" : ""}`}
                  >
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${subject.lightBg} opacity-0 transition-opacity ${isSelected ? "opacity-100" : "group-hover:opacity-100"}`} />
                    <div className="relative">
                      <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${subject.gradient}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-bold">{subject.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{subject.description}</p>
                      <div className="mt-3">
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">{subject.completed}/{subject.total} topics</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                          <div className={`h-full rounded-full bg-gradient-to-r ${subject.gradient}`} style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                  </button>
                  {isSelected && (
                    <div className="mt-2 space-y-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                      {subject.topics.map((topic) => (
                        <button key={topic} className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground hover:bg-white/[0.06] hover:text-foreground">
                          {topic}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold">Your Practice Stats</h2>
            <p className="text-sm text-muted-foreground">Track your practice journey and improvements</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="mb-2 flex items-start justify-between">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <Icon className="h-4 w-4 text-violet-400" />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
                    <TrendingUp className="h-3 w-3" />{stat.change}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
