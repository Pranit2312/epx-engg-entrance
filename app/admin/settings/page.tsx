"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Settings, Save } from "lucide-react"

const EXAM_LABELS: Record<string, string> = {
  JEE_MAIN: "JEE Main", JEE_ADVANCED: "JEE Advanced", MHT_CET: "MHT-CET", BITSAT: "BITSAT",
  VITEEE: "VITEEE", COMEDK: "COMEDK", KCET: "KCET", WBJEE: "WBJEE", GUJCET: "GUJCET", OTHER: "Other",
}

export default function AdminSettingsPage() {
  const [configs, setConfigs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/exam-config").then(r => r.json()).then(d => setConfigs(d.configs || [])).finally(() => setLoading(false))
  }, [])

  const updateConfig = async (config: any) => {
    setSaving(config.id)
    try {
      const res = await fetch("/api/admin/exam-config", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      if (!res.ok) throw new Error("Update failed")
      const data = await res.json()
      setConfigs(prev => prev.map(c => c.id === data.config.id ? data.config : c))
    } catch (e) { alert("Failed to update config") }
    finally { setSaving(null) }
  }

  if (loading) return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Exam Configuration</h2>
        <p className="text-muted-foreground">Configure exam structure, scoring, and subject breakdown</p>
      </div>
      <div className="grid gap-6">
        {configs.map(config => (
          <ExamConfigCard key={config.id} config={config} onSave={updateConfig} saving={saving === config.id} />
        ))}
      </div>
    </div>
  )
}

function ExamConfigCard({ config, onSave, saving }: { config: any; onSave: (c: any) => void; saving: boolean }) {
  const [form, setForm] = useState({ ...config })

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {EXAM_LABELS[config.examType] || config.examType}
          </CardTitle>
          <Button size="sm" onClick={() => onSave(form)} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save"}
          </Button>
        </div>
        <CardDescription>Total questions: {config.totalQuestions} | Duration: {config.duration} min</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Total Questions</Label>
            <Input type="number" value={form.totalQuestions} onChange={e => setForm({ ...form, totalQuestions: +e.target.value })} />
          </div>
          <div>
            <Label>Duration (min)</Label>
            <Input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: +e.target.value })} />
          </div>
          <div>
            <Label>Marks Per Question</Label>
            <Input type="number" step="0.5" value={form.marksPerQuestion} onChange={e => setForm({ ...form, marksPerQuestion: +e.target.value })} />
          </div>
          <div>
            <Label>Negative Marking</Label>
            <Input type="number" step="0.5" value={form.negativeMarking} onChange={e => setForm({ ...form, negativeMarking: +e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Subjects (comma-separated)</Label>
            <Input value={form.subjects?.join(", ") || ""} onChange={e => setForm({ ...form, subjects: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })} />
          </div>
          <div className="md:col-span-2">
            <Label>Questions Per Subject (comma-separated, same order)</Label>
            <Input value={form.questionsPerSubject?.join(", ") || ""} onChange={e => setForm({ ...form, questionsPerSubject: e.target.value.split(",").map((s: string) => +s.trim()).filter(Boolean) })} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
