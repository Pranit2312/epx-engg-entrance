"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, PlayCircle, Bookmark, ChevronRight } from "lucide-react"
import { PerformanceChart } from "@/components/charts/performance-chart"
import { DonutChart } from "@/components/charts/donut-chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type RecentActivity = {
  id: string
  type: "completed" | "attempt" | "bookmark"
  title: string
  detail?: string
  time: string
}

const defaultActivities: RecentActivity[] = [
  { id: "1", type: "completed", title: "Completed JEE Main Mock Test 5", detail: "Score: 92/100", time: "2 hours ago" },
  { id: "2", type: "attempt", title: "Attempted Physics Mock Test 2", detail: "Score: 68/100", time: "5 hours ago" },
  { id: "3", type: "bookmark", title: "Bookmarked Chemistry Mock Test 3", time: "1 day ago" },
  { id: "4", type: "completed", title: "Completed Mathematics Mock Test 1", detail: "Score: 85/100", time: "2 days ago" },
]

const activityIcons = {
  completed: { icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/15" },
  attempt: { icon: PlayCircle, color: "text-blue-400 bg-blue-500/15" },
  bookmark: { icon: Bookmark, color: "text-amber-400 bg-amber-500/15" },
}

export function RightPanel() {
  const [activities, setActivities] = useState<RecentActivity[]>(defaultActivities)

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const response = await fetch("/api/dashboard")
        if (!response.ok) return
        const data = await response.json()
        if (data.recentTests?.length > 0) {
          setActivities(
            data.recentTests.slice(0, 4).map((test: { id: string; score: number; mockTest?: { name?: string }; createdAt: string }, idx: number) => ({
              id: test.id,
              type: idx === 0 ? "completed" as const : "attempt" as const,
              title: `Completed ${test.mockTest?.name || "Mock Test"}`,
              detail: `Score: ${test.score}%`,
              time: new Date(test.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            }))
          )
        }
      } catch {
        // keep defaults
      }
    }
    loadRecent()
  }, [])

  return (
    <aside className="fixed right-0 top-0 z-30 flex h-screen w-[300px] flex-col border-l border-white/[0.06] bg-[#0a0b1e]/95 backdrop-blur-xl pt-14">
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Performance Overview */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Performance Overview</h3>
            <Select defaultValue="week">
              <SelectTrigger className="h-7 w-[90px] border-white/[0.08] bg-white/[0.04] text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <PerformanceChart />
        </div>

        {/* Subject Wise Accuracy */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <h3 className="mb-3 text-sm font-semibold">Subject Wise Accuracy</h3>
          <DonutChart />
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent Activity</h3>
            <Link href="/analytics" className="text-[11px] font-medium text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
              View All
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
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
                    {activity.detail && (
                      <p className="text-[10px] text-muted-foreground">{activity.detail}</p>
                    )}
                    <p className="mt-0.5 text-[10px] text-muted-foreground/70">{activity.time}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </aside>
  )
}
