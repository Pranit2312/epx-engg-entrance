"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Edit, Trash2, Filter, Calendar } from "lucide-react"

export default function PYQManagement() {
  const [pyqQuestions, setPyqQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterYear, setFilterYear] = useState("all")
  const [filterExam, setFilterExam] = useState("all")
  const [filterSubject, setFilterSubject] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPYQ, setEditingPYQ] = useState<any>(null)
  const [newPYQ, setNewPYQ] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctOption: 0,
    explanation: "",
    subject: "",
    chapter: "",
    topic: "",
    difficulty: "MEDIUM",
    examType: "JEE_MAIN",
    pyqYear: new Date().getFullYear(),
    pyqSession: "January",
  })

  useEffect(() => {
    fetchPYQs()
  }, [])

  const fetchPYQs = async () => {
    try {
      const response = await fetch("/api/admin/pyq")
      const data = await response.json()
      setPyqQuestions(data.questions || [])
    } catch (error) {
      console.error("Failed to fetch PYQs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPYQ = async () => {
    try {
      const response = await fetch("/api/admin/pyq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newPYQ, isPYQ: true }),
      })
      if (response.ok) {
        setIsAddDialogOpen(false)
        setNewPYQ({
          questionText: "",
          options: ["", "", "", ""],
          correctOption: 0,
          explanation: "",
          subject: "",
          chapter: "",
          topic: "",
          difficulty: "MEDIUM",
          examType: "JEE_MAIN",
          pyqYear: new Date().getFullYear(),
          pyqSession: "January",
        })
        fetchPYQs()
      }
    } catch (error) {
      console.error("Failed to add PYQ:", error)
    }
  }

  const handleEditPYQ = async () => {
    try {
      const response = await fetch(`/api/admin/pyq/${editingPYQ.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPYQ),
      })
      if (response.ok) {
        setIsEditDialogOpen(false)
        setEditingPYQ(null)
        fetchPYQs()
      }
    } catch (error) {
      console.error("Failed to update PYQ:", error)
    }
  }

  const handleDeletePYQ = async (id: string) => {
    if (!confirm("Are you sure you want to delete this PYQ?")) return
    try {
      const response = await fetch(`/api/admin/pyq/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        fetchPYQs()
      }
    } catch (error) {
      console.error("Failed to delete PYQ:", error)
    }
  }

  const filteredPYQs = pyqQuestions.filter((q) => {
    const matchesSearch = q.questionText.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesYear = filterYear === "all" || q.pyqYear === parseInt(filterYear)
    const matchesExam = filterExam === "all" || q.examType === filterExam
    const matchesSubject = filterSubject === "all" || q.subject === filterSubject
    return matchesSearch && matchesYear && matchesExam && matchesSubject
  })

  const years = [...new Set(pyqQuestions.map((q) => q.pyqYear))].sort((a, b) => b - a)
  const subjects = [...new Set(pyqQuestions.map((q) => q.subject))]
  const examTypes = ["JEE_MAIN", "JEE_ADVANCED", "MHT_CET", "BITSAT", "VITEEE", "COMEDK", "KCET", "WBJEE", "GUJCET"]
  const sessions = ["January", "April", "July", "October"]
  const difficulties = ["EASY", "MEDIUM", "HARD"]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading PYQs...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Previous Year Questions</h2>
          <p className="text-muted-foreground">Manage previous year exam questions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add PYQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New PYQ</DialogTitle>
              <DialogDescription>Add a previous year question to the database</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="questionText">Question</Label>
                <Textarea
                  id="questionText"
                  value={newPYQ.questionText}
                  onChange={(e) => setNewPYQ({ ...newPYQ, questionText: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newPYQ.subject}
                    onChange={(e) => setNewPYQ({ ...newPYQ, subject: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="chapter">Chapter</Label>
                  <Input
                    id="chapter"
                    value={newPYQ.chapter}
                    onChange={(e) => setNewPYQ({ ...newPYQ, chapter: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pyqYear">Year</Label>
                  <Select
                    value={newPYQ.pyqYear.toString()}
                    onValueChange={(value) => value && setNewPYQ({ ...newPYQ, pyqYear: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pyqSession">Session</Label>
                  <Select
                    value={newPYQ.pyqSession}
                    onValueChange={(value) => value && setNewPYQ({ ...newPYQ, pyqSession: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="examType">Exam Type</Label>
                  <Select
                    value={newPYQ.examType}
                    onValueChange={(value) => value && setNewPYQ({ ...newPYQ, examType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {examTypes.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={newPYQ.difficulty}
                    onValueChange={(value) => value && setNewPYQ({ ...newPYQ, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Options</Label>
                <div className="space-y-2">
                  {newPYQ.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-8 text-sm font-medium">{String.fromCharCode(65 + index)}.</span>
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...newPYQ.options]
                          newOptions[index] = e.target.value
                          setNewPYQ({ ...newPYQ, options: newOptions })
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="correctOption">Correct Option</Label>
                <Select
                  value={newPYQ.correctOption.toString()}
                  onValueChange={(value) => setNewPYQ({ ...newPYQ, correctOption: parseInt(value || "0") })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {newPYQ.options.map((_, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {String.fromCharCode(65 + index)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="explanation">Explanation</Label>
                <Textarea
                  id="explanation"
                  value={newPYQ.explanation}
                  onChange={(e) => setNewPYQ({ ...newPYQ, explanation: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddPYQ}>Add PYQ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search PYQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterYear} onValueChange={(value) => setFilterYear(value || "all")}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterExam} onValueChange={(value) => setFilterExam(value || "all")}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Exam" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exams</SelectItem>
                  {examTypes.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterSubject} onValueChange={(value) => setFilterSubject(value || "all")}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredPYQs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">No PYQs found</div>
            </CardContent>
          </Card>
        ) : (
          filteredPYQs.map((pyq) => (
            <Card key={pyq.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-2">{pyq.questionText}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{pyq.subject}</Badge>
                      <Badge
                        variant={
                          pyq.difficulty === "EASY"
                            ? "secondary"
                            : pyq.difficulty === "MEDIUM"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {pyq.difficulty}
                      </Badge>
                      <Badge>{pyq.examType.replace("_", " ")}</Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {pyq.pyqYear} - {pyq.pyqSession}
                      </Badge>
                      {pyq.chapter && <Badge variant="outline">{pyq.chapter}</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingPYQ(pyq)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePYQ(pyq.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pyq.options.map((option: string, index: number) => (
                    <div
                      key={index}
                      className={`p-2 rounded border ${
                        index === pyq.correctOption
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : "border-border"
                      }`}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </div>
                  ))}
                </div>
                {pyq.explanation && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Explanation:</p>
                    <p className="text-sm text-muted-foreground">{pyq.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit PYQ</DialogTitle>
            <DialogDescription>Update the PYQ details</DialogDescription>
          </DialogHeader>
          {editingPYQ && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="editQuestionText">Question</Label>
                <Textarea
                  id="editQuestionText"
                  value={editingPYQ.questionText}
                  onChange={(e) => setEditingPYQ({ ...editingPYQ, questionText: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editYear">Year</Label>
                  <Select
                    value={editingPYQ.pyqYear.toString()}
                    onValueChange={(value) => value && setEditingPYQ({ ...editingPYQ, pyqYear: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editSession">Session</Label>
                  <Select
                    value={editingPYQ.pyqSession}
                    onValueChange={(value) => value && setEditingPYQ({ ...editingPYQ, pyqSession: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Options</Label>
                <div className="space-y-2">
                  {editingPYQ.options.map((option: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-8 text-sm font-medium">{String.fromCharCode(65 + index)}.</span>
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...editingPYQ.options]
                          newOptions[index] = e.target.value
                          setEditingPYQ({ ...editingPYQ, options: newOptions })
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="editCorrectOption">Correct Option</Label>
                <Select
                  value={editingPYQ.correctOption.toString()}
                  onValueChange={(value) => setEditingPYQ({ ...editingPYQ, correctOption: parseInt(value || "0") })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {editingPYQ.options.map((_: string, index: number) => (
                      <SelectItem key={index} value={index.toString()}>
                        {String.fromCharCode(65 + index)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editExplanation">Explanation</Label>
                <Textarea
                  id="editExplanation"
                  value={editingPYQ.explanation || ""}
                  onChange={(e) => setEditingPYQ({ ...editingPYQ, explanation: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleEditPYQ}>Update PYQ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
