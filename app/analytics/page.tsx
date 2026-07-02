"use client"

import { AppShell } from "@/components/layout/app-shell"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import { TrendingUp, Target, BookOpen, Award, Calendar, ArrowUp, ArrowDown, BarChart3, Brain, ChevronRight } from "lucide-react"

const overallStats = [
  { label: "Overall Accuracy", value: "85%", icon: Target, gradient: "from-blue-500 to-cyan-500", change: "+5% from last week" },
  { label: "Tests Attempted", value: "37", icon: BookOpen, gradient: "from-purple-500 to-pink-500", change: "+8 this month" },
  { label: "Average Score", value: "82", icon: Award, gradient: "from-amber-500 to-orange-500", change: "+3 points avg" },
  { label: "Study Streak", value: "14 days", icon: Calendar, gradient: "from-emerald-500 to-green-500", change: "Personal best!" },
]

const subjectPerformance = [
  { subject: "Physics", accuracy: 85, attempts: 12, trend: 5, gradient: "from-blue-500 to-cyan-500" },
  { subject: "Chemistry", accuracy: 78, attempts: 10, trend: 2, gradient: "from-purple-500 to-pink-500" },
  { subject: "Mathematics", accuracy: 92, attempts: 15, trend: 8, gradient: "from-amber-500 to-orange-500" },
]

const weeklyTrend = [
  { week: "Week 1", score: 65 },
  { week: "Week 2", score: 72 },
  { week: "Week 3", score: 78 },
  { week: "Week 4", score: 85 },
]

const recentTests = [
  { name: "JEE Main Physics Mock 1", score: 85, accuracy: 88, date: "2 days ago", subject: "Physics" },
  { name: "JEE Main Chemistry Mock 2", score: 72, accuracy: 75, date: "4 days ago", subject: "Chemistry" },
  { name: "Mathematics Full Length", score: 95, accuracy: 98, date: "1 week ago", subject: "Mathematics" },
]

export default function AnalyticsPage() {
  return (
    <AppShell showRightPanel={false}>
      <div className="space-y-6">
        <WelcomeBanner />

        {/* Overall Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overallStats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.gradient} opacity-60`} />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="mt-2 flex items-center gap-1 text-xs text-emerald-400">
                  <ArrowUp className="h-3 w-3" />{stat.change}
                </p>
              </div>
            )
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {/* Subject Analysis */}
          <div>
            <h2 className="mb-4 text-lg font-bold">Subject-wise Analysis</h2>
            <div className="space-y-3">
              {subjectPerformance.map((subject) => (
                <div key={subject.subject} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${subject.gradient}`}>
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{subject.subject}</h3>
                        <span className="font-bold">{subject.accuracy}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                        <div className={`h-full rounded-full bg-gradient-to-r ${subject.gradient}`} style={{ width: `${subject.accuracy}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <span className="text-muted-foreground">Attempts: <span className="font-semibold text-foreground">{subject.attempts}</span></span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      Trend: <ArrowUp className="h-3 w-3" />{subject.trend}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Trend */}
          <div>
            <h2 className="mb-4 text-lg font-bold">Weekly Performance Trend</h2>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="mb-4 flex h-[180px] items-end justify-between gap-3">
                {weeklyTrend.map((item, idx) => (
                  <div key={idx} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-bold">{item.score}</span>
                    <div
                      className="w-full rounded-lg bg-gradient-to-t from-blue-500/80 via-purple-500/60 to-pink-500/40 transition-all hover:from-blue-400"
                      style={{ height: `${(item.score / 100) * 140}px` }}
                    />
                    <span className="text-[10px] text-muted-foreground">{item.week}</span>
                  </div>
                ))}
              </div>
              <p className="flex items-center gap-2 border-t border-white/[0.06] pt-3 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Your performance shows a steady upward trend!
              </p>
            </div>
          </div>
        </div>

        {/* Recent Tests */}
        <div>
          <h2 className="mb-4 text-lg font-bold">Recent Test Performance</h2>
          <div className="space-y-2">
            {recentTests.map((test, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    test.subject === "Physics" ? "bg-blue-500/15" :
                    test.subject === "Chemistry" ? "bg-purple-500/15" : "bg-amber-500/15"
                  }`}>
                    <Brain className={`h-4 w-4 ${
                      test.subject === "Physics" ? "text-blue-400" :
                      test.subject === "Chemistry" ? "text-purple-400" : "text-amber-400"
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{test.name}</h3>
                    <p className="text-xs text-muted-foreground">{test.date} · {test.subject}</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Score</p>
                    <p className="text-lg font-bold">{test.score}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                    <p className="text-lg font-bold text-emerald-400">{test.accuracy}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
