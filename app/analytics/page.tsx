"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import { Loader2, TrendingUp, Target, BookOpen, Award, Calendar, ArrowUp, BarChart3, Brain } from "lucide-react"
import type { AnalyticsOverview } from "@/services/analytics-service"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const subjectGradients: Record<string, string> = {
  Physics: "from-blue-500 to-cyan-500",
  Chemistry: "from-purple-500 to-pink-500",
  Mathematics: "from-amber-500 to-orange-500",
}

const defaultGradient = "from-violet-500 to-blue-500"

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444']

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hrs > 0) return `${hrs}h ${mins}m`
  return `${mins}m`
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (!session?.user?.id) return
    const load = async () => {
      try {
        const res = await fetch("/api/analytics")
        const json = await res.json()
        setData(json)
      } catch {
        setData(null)
      }
      setLoading(false)
    }
    load()
  }, [session?.user?.id])

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

  const overview = data ?? {
    totalAttempts: 0,
    averageScore: 0,
    averageAccuracy: 0,
    bestScore: 0,
    bestTestName: null,
    totalTimeSpent: 0,
    subjectPerformance: [],
    scoreHistory: [],
    weakTopics: [],
    strongTopics: [],
  }

  const statCards = [
    { label: "Overall Accuracy", value: `${overview.averageAccuracy}%`, icon: Target, gradient: "from-blue-500 to-cyan-500", change: `${overview.totalAttempts} tests taken` },
    { label: "Tests Attempted", value: String(overview.totalAttempts), icon: BookOpen, gradient: "from-purple-500 to-pink-500", change: "All time" },
    { label: "Average Score", value: `${overview.averageScore}%`, icon: Award, gradient: "from-amber-500 to-orange-500", change: overview.bestScore > 0 ? `Best: ${overview.bestScore}%` : null },
    { label: "Time Spent", value: formatTime(overview.totalTimeSpent), icon: Calendar, gradient: "from-emerald-500 to-green-500", change: overview.bestTestName ? `Best: ${overview.bestTestName}` : null },
  ]

  return (
    <AppShell showRightPanel={false}>
      <div className="space-y-6">
        <WelcomeBanner />

        {/* Overall Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="relative overflow-hidden rounded-2xl border border-border bg-card p-5">
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
                {stat.change && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-emerald-400">
                    <ArrowUp className="h-3 w-3" />{stat.change}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {/* Subject Analysis */}
          <div>
            <h2 className="mb-4 text-lg font-bold">Subject-wise Analysis</h2>
            {overview.subjectPerformance.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                No test data yet. Complete a test to see subject analysis.
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-5">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={overview.subjectPerformance}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="subject" className="text-xs" />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="averageScore" fill="#8b5cf6" name="Average Score" />
                    <Bar dataKey="averageAccuracy" fill="#10b981" name="Accuracy" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Score History */}
          <div>
            <h2 className="mb-4 text-lg font-bold">Score History</h2>
            <div className="rounded-2xl border border-border bg-card p-5">
              {overview.scoreHistory.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No scores yet.
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={overview.scoreHistory.slice(0, 10).map((item, idx) => ({
                      name: item.date?.slice(5) || `Test ${idx + 1}`,
                      score: item.score
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis domain={[0, 100]} className="text-xs" />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="flex items-center gap-2 border-t border-border pt-3 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    {overview.scoreHistory.length > 1 ? "Track your progress over time." : "Complete more tests to see trends."}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="grid gap-6 xl:grid-cols-3">
          {/* Weak Topics */}
          <div>
            <h2 className="mb-4 text-lg font-bold">Weak Topics</h2>
            <div className="rounded-2xl border border-border bg-card p-5">
              {overview.weakTopics.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No weak topics identified yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={overview.weakTopics.slice(0, 5)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="accuracy"
                    >
                      {overview.weakTopics.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Strong Topics */}
          <div>
            <h2 className="mb-4 text-lg font-bold">Strong Topics</h2>
            <div className="rounded-2xl border border-border bg-card p-5">
              {overview.strongTopics.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No strong topics identified yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={overview.strongTopics.slice(0, 5)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="accuracy"
                    >
                      {overview.strongTopics.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Time Analysis */}
          <div>
            <h2 className="mb-4 text-lg font-bold">Time Analysis</h2>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Average Time per Question</p>
                  <p className="text-2xl font-bold">
                    {overview.totalAttempts > 0 ? Math.round(overview.totalTimeSpent / (overview.totalAttempts * 30)) : 0}s
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Study Time</p>
                  <p className="text-2xl font-bold">{formatTime(overview.totalTimeSpent)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tests Completed</p>
                  <p className="text-2xl font-bold">{overview.totalAttempts}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tests */}
        <div>
          <h2 className="mb-4 text-lg font-bold">Recent Test Performance</h2>
          {overview.scoreHistory.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
              No tests attempted yet.
            </div>
          ) : (
            <div className="space-y-2">
              {overview.scoreHistory.slice(0, 10).map((test, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15">
                      <Brain className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{test.testName}</h3>
                      <p className="text-xs text-muted-foreground">{test.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Score</p>
                    <p className="text-lg font-bold">{test.score}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
