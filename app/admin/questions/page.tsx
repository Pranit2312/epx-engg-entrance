"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Edit, Trash2, Upload, Filter } from "lucide-react"

export default function QuestionsManagement() {
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSubject, setFilterSubject] = useState("all")
  const [filterDifficulty, setFilterDifficulty] = useState("all")
  const [filterExam, setFilterExam] = useState("all")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editQ, setEditQ] = useState<any>(null)
  const [newQ, setNewQ] = useState({
    questionText: "", options: ["", "", "", ""], correctOption: 0,
    explanation: "", subject: "", chapter: "", topic: "",
    difficulty: "MEDIUM", examType: "JEE_MAIN", imagePath: "",
  })
  const [uploadResult, setUploadResult] = useState<string | null>(null)

  useEffect(() => { fetchQuestions() }, [])

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/admin/questions")
      const data = await res.json()
      setQuestions(data.questions || [])
    } catch (e) { console.error("Failed to fetch questions:", e) }
    finally { setLoading(false) }
  }

  const handleAdd = async () => {
    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQ),
      })
      if (res.ok) {
        setIsAddOpen(false)
        setNewQ({ questionText: "", options: ["", "", "", ""], correctOption: 0, explanation: "", subject: "", chapter: "", topic: "", difficulty: "MEDIUM", examType: "JEE_MAIN", imagePath: "" })
        fetchQuestions()
      }
    } catch (e) { console.error("Failed to add question:", e) }
  }

  const handleEdit = async () => {
    if (!editQ) return
    try {
      const res = await fetch(`/api/admin/questions/${editQ.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editQ),
      })
      if (res.ok) { setIsEditOpen(false); setEditQ(null); fetchQuestions() }
    } catch (e) { console.error("Failed to update question:", e) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return
    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" })
      if (res.ok) fetchQuestions()
    } catch (e) { console.error("Failed to delete question:", e) }
  }

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append("file", file); fd.append("type", "csv")
    try {
      const res = await fetch("/api/admin/questions/bulk-upload", { method: "POST", body: fd })
      const data = await res.json()
      setUploadResult(res.ok ? `Uploaded ${data.uploaded} questions` : `Error: ${data.error}`)
      if (res.ok) fetchQuestions()
    } catch { setUploadResult("Upload failed") }
  }

  const filtered = questions.filter((q) => {
    return (!searchQuery || q.questionText.toLowerCase().includes(searchQuery.toLowerCase()))
      && (filterSubject === "all" || q.subject === filterSubject)
      && (filterDifficulty === "all" || q.difficulty === filterDifficulty)
      && (filterExam === "all" || q.examType === filterExam)
  })

  const subjects = [...new Set(questions.map((q) => q.subject))]
  const difficulties = ["EASY", "MEDIUM", "HARD"]
  const examTypes = ["JEE_MAIN", "JEE_ADVANCED", "MHT_CET", "BITSAT", "VITEEE", "COMEDK", "KCET", "WBJEE", "GUJCET"]

  if (loading) return <div className="container mx-auto px-4 py-8 text-center">Loading questions...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">Question Bank</h2>
          <p className="text-muted-foreground text-sm">Manage your question database</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger>
              <Button><Plus className="h-4 w-4 mr-1" />Add Question</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Question</DialogTitle>
                <DialogDescription>Create a new question for the question bank</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div>
                  <Label>Question</Label>
                  <Textarea value={newQ.questionText} onChange={(e) => setNewQ({ ...newQ, questionText: e.target.value })} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Subject</Label>
                    <Input value={newQ.subject} onChange={(e) => setNewQ({ ...newQ, subject: e.target.value })} />
                  </div>
                  <div>
                    <Label>Chapter</Label>
                    <Input value={newQ.chapter} onChange={(e) => setNewQ({ ...newQ, chapter: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Topic</Label>
                    <Input value={newQ.topic} onChange={(e) => setNewQ({ ...newQ, topic: e.target.value })} />
                  </div>
                  <div>
                    <Label>Difficulty</Label>
                    <Select value={newQ.difficulty} onValueChange={(v) => setNewQ({ ...newQ, difficulty: v || "MEDIUM" })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {difficulties.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Exam Type</Label>
                  <Select value={newQ.examType} onValueChange={(v) => setNewQ({ ...newQ, examType: v || "JEE_MAIN" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {examTypes.map((e) => <SelectItem key={e} value={e}>{e.replace(/_/g, " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Correct Answer</Label>
                  <Select value={String(newQ.correctOption)} onValueChange={(v) => setNewQ({ ...newQ, correctOption: parseInt(v || "0") })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {newQ.options.map((_, i) => <SelectItem key={i} value={String(i)}>{String.fromCharCode(65 + i)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Explanation</Label>
                  <Textarea value={newQ.explanation} onChange={(e) => setNewQ({ ...newQ, explanation: e.target.value })} rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAdd}>Add Question</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <label className="cursor-pointer">
            <Button variant="outline" type="button">
              <Upload className="h-4 w-4 mr-1" />CSV Upload
            </Button>
            <input type="file" accept=".csv,.json" className="hidden" onChange={handleCSV} />
          </label>

          <Link href="/admin/import">
            <Button variant="outline"><Upload className="h-4 w-4 mr-1" />Import</Button>
          </Link>
        </div>
      </div>

      {uploadResult && (
        <div className="mb-4 p-3 rounded-xl bg-muted text-sm">{uploadResult}</div>
      )}

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search questions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterSubject} onValueChange={(v) => setFilterSubject(v || "all")}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Subject" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterDifficulty} onValueChange={(v) => setFilterDifficulty(v || "all")}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {difficulties.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterExam} onValueChange={(v) => setFilterExam(v || "all")}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Exam" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                {examTypes.map((e) => <SelectItem key={e} value={e}>{e.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-muted-foreground text-center py-8">No questions found.</p>}
        {filtered.map((q) => (
          <Card key={q.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 mr-4">
                  <CardTitle className="text-base font-medium line-clamp-2">{q.questionText}</CardTitle>
                  <CardDescription className="mt-1">
                    <span className="mr-3">{q.subject}</span>
                    {q.chapter && <span className="mr-3">{q.chapter}</span>}
                    {q.topic && <span className="mr-3">{q.topic}</span>}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={q.difficulty === "HARD" ? "destructive" : q.difficulty === "MEDIUM" ? "default" : "secondary"}>{q.difficulty}</Badge>
                  <Badge variant="outline">{q.examType?.replace(/_/g, " ")}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => { setEditQ({ ...q }); setIsEditOpen(true) }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(q.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>Modify the question details</DialogDescription>
          </DialogHeader>
          {editQ && (
            <div className="space-y-3 py-2">
              <div>
                <Label>Question</Label>
                <Textarea value={editQ.questionText} onChange={(e) => setEditQ({ ...editQ, questionText: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {editQ.options?.map((opt: string, i: number) => (
                  <div key={i}>
                    <Label>Option {String.fromCharCode(65 + i)}</Label>
                    <Input value={opt} onChange={(e) => {
                      const opts = [...editQ.options]; opts[i] = e.target.value; setEditQ({ ...editQ, options: opts })
                    }} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Subject</Label>
                  <Input value={editQ.subject || ""} onChange={(e) => setEditQ({ ...editQ, subject: e.target.value })} />
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <Select value={editQ.difficulty} onValueChange={(v) => setEditQ({ ...editQ, difficulty: v || "MEDIUM" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {difficulties.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Explanation</Label>
                <Textarea value={editQ.explanation || ""} onChange={(e) => setEditQ({ ...editQ, explanation: e.target.value })} rows={3} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
