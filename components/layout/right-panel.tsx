"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, PlayCircle, Bookmark, ChevronRight, Loader2 } from "lucide-react"
import { PerformanceChart } from "@/components/charts/performance-chart"
import { DonutChart, type DonutData } from "@/components/charts/donut-chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { dedupFetch } from "@/lib/request-dedup"

type RecentActivity = {
  id: string
  type: "completed" | "attempt" | "bookmark"
  title: string
  detail?: string
  time: string
}

const activityIcons = {
  completed: { icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/15" },
  attempt: { icon: PlayCircle, color: "text-blue-400 bg-blue-500/15" },
  bookmark: { icon: Bookmark, color: "text-amber-400 bg-amber-500/15" },
}

const subjectColors: Record<string, string> = {
  Physics: "#8b5cf6",
  Chemistry: "#22c55e",
  Mathematics: "#f97316",
  Biology: "#06b6d4",
}

export function RightPanel() {
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [subjectData, setSubjectData] = useState<DonutData[]>([])
  const [scoreHistory, setScoreHistory] = useState<{ date: string; value: number }[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const [dashData, analyticsData] = await Promise.all([
          dedupFetch("right-panel-dashboard", async () => {
            const res = await fetch("/api/dashboard")
            if (!res.ok) throw new Error("Failed")
            return res.json()
          }),
          dedupFetch("right-panel-analytics", async () => {
            const res = await fetch("/api/analytics")
            if (!res.ok) throw new Error("Failed")
            return res.json()
          }),
        ])

        if (dashData.recentTests?.length > 0) {
          setActivities(
            dashData.recentTests.slice(0, 4).map((test: { id: string; score: number; mockTest?: { name?: string }; createdAt: string }, idx: number) => ({
              id: test.id,
              type: idx === 0 ? ("completed" as const) : ("attempt" as const),
              title: `Completed ${test.mockTest?.name || "Mock Test"}`,
              detail: `Score: ${test.score}%`,
              time: new Date(test.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            }))
          )
        }

        if (analyticsData.subjectPerformance?.length > 0) {
          setSubjectData(
            analyticsData.subjectPerformance.map((s: { subject: string; averageAccuracy: number }) => ({
              name: s.subject,
              value: s.averageAccuracy,
              color: subjectColors[s.subject] || "#8b5cf6",
            }))
          )
        }

        if (analyticsData.scoreHistory?.length > 0) {
          setScoreHistory(
            analyticsData.scoreHistory.slice(0, 7).map((s: { date: string; score: number }) => ({
              date: s.date,
              value: s.score,
            }))
          )
        }
      } catch {
        // keep empty
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <aside className="fixed right-0 top-0 z-30 flex h-screen w-[300px] flex-col border-l border-border bg-sidebar/95 backdrop-blur-xl pt-14">
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Performance Overview */}
          <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Performance Overview</h3>
            <Select defaultValue="week">
              <SelectTrigger className="h-7 w-[90px] border-border bg-muted text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <PerformanceChart
            data={
              scoreHistory.length > 0
                ? scoreHistory.map((s, i) => ({ day: s.date?.slice(5) || `#${i + 1}`, value: s.value }))
                : undefined
            }
          />
        </div>

        {/* Subject Wise Accuracy */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Subject Wise Accuracy</h3>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
            </div>
          ) : (
            <DonutChart subjects={subjectData.length > 0 ? subjectData : undefined} />
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent Activity</h3>
            <Link href="/analytics" className="text-[11px] font-medium text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
              View All
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
            </div>
          ) : activities.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            <ul className="space-y-3">
              {activities.map((activity) => {
                const { icon: Icon, color } = activityIcons[activity.type]
                return (
                  <li key={activity.id} className="flex items-start gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium leading-snug">{activity.title}</p>
                      {activity.detail && <p className="text-[10px] text-muted-foreground">{activity.detail}</p>}
                      <p className="mt-0.5 text-[10px] text-muted-foreground/70">{activity.time}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </aside>
  )
}
