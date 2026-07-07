"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Mail, Calendar } from "lucide-react"

export default function AdminUsersPage() {
  const [data, setData] = useState<{ users: any[]; total: number }>({ users: [], total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/users").then(r => r.json()).then(d => setData(d)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">User Management</h2>
        <p className="text-muted-foreground">{data.total} registered users</p>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users
          </CardTitle>
          <CardDescription>View and manage registered users</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Role</th>
                <th className="p-3 font-medium">Target Exam</th>
                <th className="p-3 font-medium">Tests</th>
                <th className="p-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map(user => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{user.name || "—"}</td>
                  <td className="p-3"><Mail className="h-3 w-3 inline mr-1" />{user.email}</td>
                  <td className="p-3"><Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge></td>
                  <td className="p-3">{user.targetExam?.replace(/_/g, " ") || "—"}</td>
                  <td className="p-3">{user._count?.attempts || 0}</td>
                  <td className="p-3"><Calendar className="h-3 w-3 inline mr-1" />{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.users.length === 0 && <p className="p-4 text-muted-foreground text-center">No users found.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
