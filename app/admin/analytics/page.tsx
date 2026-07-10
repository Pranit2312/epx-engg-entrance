"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Users, FileText, HelpCircle, Activity, Award } from "lucide-react"

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch("/api/admin/analytics").then(r => { if (!r.ok) throw new Error("Failed to fetch"); return r.json() }).then(d => { if (!cancelled && d.success) setData(d.data) }).catch(() => { if (!cancelled) setData(null) }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>
  if (!data) return <div className="container mx-auto px-4 py-8 text-center text-red-400">Failed to load analytics. Check if the server is running.</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Platform Analytics</h2>
        <p className="text-muted-foreground">Overall platform statistics and trends</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Users" value={data.totalUsers} />
        <StatCard icon={<FileText className="h-5 w-5" />} label="Mock Tests" value={data.totalTests} />
        <StatCard icon={<HelpCircle className="h-5 w-5" />} label="Questions" value={data.totalQuestions} />
        <StatCard icon={<Activity className="h-5 w-5" />} label="Attempts" value={data.totalAttempts} />
        <StatCard icon={<Award className="h-5 w-5" />} label="Active (7d)" value={data.activeUsers} />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Test Overview
          </CardTitle>
          <CardDescription>Questions and attempts per test</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-3 font-medium">Test Name</th>
                <th className="p-3 font-medium">Exam</th>
                <th className="p-3 font-medium text-right">Questions</th>
                <th className="p-3 font-medium text-right">Attempts</th>
              </tr>
            </thead>
            <tbody>
              {data.testStats?.map((t: any) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="p-3">{t.name}</td>
                  <td className="p-3 text-muted-foreground">{t.examType?.replace(/_/g, " ")}</td>
                  <td className="p-3 text-right">{t._count?.questions || 0}</td>
                  <td className="p-3 text-right">{t._count?.attempts || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!data.testStats || data.testStats.length === 0) && <p className="p-4 text-muted-foreground text-center">No tests yet.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest test attempts</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-3 font-medium">User</th>
                <th className="p-3 font-medium">Test</th>
                <th className="p-3 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentAttempts?.map((a: any) => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="p-3">{a.user?.name || "Anonymous"}</td>
                  <td className="p-3">{a.mockTest?.name || "—"}</td>
                  <td className="p-3 text-right text-muted-foreground"><span suppressHydrationWarning>{new Date(a.createdAt).toLocaleDateString()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!data.recentAttempts || data.recentAttempts.length === 0) && <p className="p-4 text-muted-foreground text-center">No attempts yet.</p>}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value?.toLocaleString() || 0}</div>
      </CardContent>
    </Card>
  )
}
