"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Eye } from "lucide-react"

export default function AdminTestsPage() {
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/tests")
      .then((r) => r.json())
      .then((d) => setTests(d.tests || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="container mx-auto px-4 py-8"><div className="text-center">Loading...</div></div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Mock Tests</h2>
          <p className="text-muted-foreground">Manage tests and their question sets</p>
        </div>
        <Link href="/admin/test-builder">
          <Button><Plus className="h-4 w-4 mr-2" />Create Test</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {tests.length === 0 && <p className="text-muted-foreground">No tests found.</p>}
        {tests.map((test: any) => (
          <Card key={test.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  <CardDescription className="mt-1">{test.description}</CardDescription>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant={test.isPublished ? "default" : "secondary"}>{test.isPublished ? "Published" : "Draft"}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{test.examType?.replace(/_/g, " ")}</span>
                <span>{test.duration} min</span>
                <span>{test._count?.questions ?? 0} questions</span>
                <span className="capitalize">{test.difficulty?.toLowerCase()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
