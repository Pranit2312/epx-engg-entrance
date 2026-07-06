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
import { Plus, Search, Edit, Trash2, Upload, Filter } from "lucide-react"
import { prisma } from "@/lib/prisma"

export default function QuestionsManagement() {
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSubject, setFilterSubject] = useState("all")
  const [filterDifficulty, setFilterDifficulty] = useState("all")
  const [filterExam, setFilterExam] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<any>(null)
  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctOption: 0,
    explanation: "",
    subject: "",
    chapter: "",
    topic: "",
    difficulty: "MEDIUM",
    examType: "JEE_MAIN",
  })

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/admin/questions")
      const data = await response.json()
      setQuestions(data.questions || [])
    } catch (error) {
      console.error("Failed to fetch questions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = async () => {
    try {
      const response = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuestion),
      })
      if (response.ok) {
        setIsAddDialogOpen(false)
        setNewQuestion({
          questionText: "",
          options: ["", "", "", ""],
          correctOption: 0,
          explanation: "",
          subject: "",
          chapter: "",
          topic: "",
          difficulty: "MEDIUM",
          examType: "JEE_MAIN",
        })
        fetchQuestions()
      }
    } catch (error) {
      console.error("Failed to add question:", error)
    }
  }

  const handleEditQuestion = async () => {
    try {
      const response = await fetch(`/api/admin/questions/${editingQuestion.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingQuestion),
      })
      if (response.ok) {
        setIsEditDialogOpen(false)
        setEditingQuestion(null)
        fetchQuestions()
      }
    } catch (error) {
      console.error("Failed to update question:", error)
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return
    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        fetchQuestions()
      }
    } catch (error) {
      console.error("Failed to delete question:", error)
    }
  }

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.questionText.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = filterSubject === "all" || q.subject === filterSubject
    const matchesDifficulty = filterDifficulty === "all" || q.difficulty === filterDifficulty
    const matchesExam = filterExam === "all" || q.examType === filterExam
    return matchesSearch && matchesSubject && matchesDifficulty && matchesExam
  })

  const subjects = [...new Set(questions.map((q) => q.subject))]
  const difficulties = ["EASY", "MEDIUM", "HARD"]
  const examTypes = ["JEE_MAIN", "JEE_ADVANCED", "MHT_CET", "BITSAT", "VITEEE", "COMEDK", "KCET", "WBJEE", "GUJCET"]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading questions...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Question Bank</h2>
          <p className="text-muted-foreground">Manage your question database</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Question</DialogTitle>
                <DialogDescription>Create a new question for the question bank</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="questionText">Question</Label>
                  <Textarea
                    id="questionText"
                    value={newQuestion.questionText}
                    onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={newQuestion.subject}
                      onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="chapter">Chapter</Label>
                    <Input
                      id="chapter"
                      value={newQuestion.chapter || ""}
                      onChange={(e) => setNewQuestion({ ...newQuestion, chapter: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="topic">Topic</Label>
                    <Input
                      id="topic"
                      value={newQuestion.topic}
                      onChange={(e) => setNewQuestion({ ...newQuestion, topic: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      value={newQuestion.difficulty}
                      onValueChange={(value) => setNewQuestion({ ...newQuestion, difficulty: value || "MEDIUM" })}
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
                  <Label htmlFor="examType">Exam Type</Label>
                  <Select
                    value={newQuestion.examType}
                    onValueChange={(value) => setNewQuestion({ ...newQuestion, examType: value || "JEE_MAIN" })}
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
                  <Label>Options</Label>
                  <div className="space-y-2">
                    {newQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-8 text-sm font-medium">{String.fromCharCode(65 + index)}.</span>
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...newQuestion.options]
                            newOptions[index] = e.target.value
                            setNewQuestion({ ...newQuestion, options: newOptions })
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
                    value={newQuestion.correctOption.toString()}
                    onValueChange={(value) => setNewQuestion({ ...newQuestion, correctOption: parseInt(value || "0") })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {newQuestion.options.map((_, index) => (
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
                    value={newQuestion.explanation || ""}
                    onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddQuestion}>Add Question</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
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
              <Select value={filterDifficulty} onValueChange={(value) => setFilterDifficulty(value || "all")}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {difficulties.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
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
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">No questions found</div>
            </CardContent>
          </Card>
        ) : (
          filteredQuestions.map((question) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-2">{question.questionText}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{question.subject}</Badge>
                      <Badge
                        variant={
                          question.difficulty === "EASY"
                            ? "secondary"
                            : question.difficulty === "MEDIUM"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {question.difficulty}
                      </Badge>
                      <Badge>{question.examType.replace("_", " ")}</Badge>
                      {question.chapter && <Badge variant="outline">{question.chapter}</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingQuestion(question)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {question.options.map((option: string, index: number) => (
                    <div
                      key={index}
                      className={`p-2 rounded border ${
                        index === question.correctOption
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : "border-border"
                      }`}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </div>
                  ))}
                </div>
                {question.explanation && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Explanation:</p>
                    <p className="text-sm text-muted-foreground">{question.explanation}</p>
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
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>Update the question details</DialogDescription>
          </DialogHeader>
          {editingQuestion && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="editQuestionText">Question</Label>
                <Textarea
                  id="editQuestionText"
                  value={editingQuestion.questionText}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editSubject">Subject</Label>
                  <Input
                    id="editSubject"
                    value={editingQuestion.subject}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, subject: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editChapter">Chapter</Label>
                  <Input
                    id="editChapter"
                    value={editingQuestion.chapter || ""}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, chapter: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Options</Label>
                <div className="space-y-2">
                  {editingQuestion.options.map((option: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-8 text-sm font-medium">{String.fromCharCode(65 + index)}.</span>
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...editingQuestion.options]
                          newOptions[index] = e.target.value
                          setEditingQuestion({ ...editingQuestion, options: newOptions })
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="editCorrectOption">Correct Option</Label>
                <Select
                  value={editingQuestion.correctOption.toString()}
                  onValueChange={(value) => setEditingQuestion({ ...editingQuestion, correctOption: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {editingQuestion.options.map((_: string, index: number) => (
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
                  value={editingQuestion.explanation || ""}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleEditQuestion}>Update Question</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
