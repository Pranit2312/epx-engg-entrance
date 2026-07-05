"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash2, Save, Search, Filter } from "lucide-react"

interface TestSection {
  subject: string
  questionCount: number
  marks: number
}

export default function TestBuilder() {
  const [testName, setTestName] = useState("")
  const [examType, setExamType] = useState("JEE_MAIN")
  const [duration, setDuration] = useState(180)
  const [difficulty, setDifficulty] = useState("MEDIUM")
  const [description, setDescription] = useState("")
  const [sections, setSections] = useState<TestSection[]>([])
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set())
  const [isQuestionSelectorOpen, setIsQuestionSelectorOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSubject, setFilterSubject] = useState("all")
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/admin/questions")
      const data = await response.json()
      setAvailableQuestions(data.questions || [])
    } catch (error) {
      console.error("Failed to fetch questions:", error)
    }
  }

  const addSection = () => {
    setSections([...sections, { subject: "", questionCount: 10, marks: 40 }])
  }

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index))
  }

  const updateSection = (index: number, field: keyof TestSection, value: string | number) => {
    const newSections = [...sections]
    newSections[index] = { ...newSections[index], [field]: value }
    setSections(newSections)
  }

  const openQuestionSelector = (sectionIndex: number) => {
    setCurrentSectionIndex(sectionIndex)
    setIsQuestionSelectorOpen(true)
  }

  const toggleQuestionSelection = (questionId: string) => {
    const newSelected = new Set(selectedQuestions)
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId)
    } else {
      newSelected.add(questionId)
    }
    setSelectedQuestions(newSelected)
  }

  const saveTest = async () => {
    try {
      const response = await fetch("/api/admin/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: testName,
          examType,
          duration,
          difficulty,
          description,
          sections,
          questionIds: Array.from(selectedQuestions),
        }),
      })
      if (response.ok) {
        alert("Test created successfully!")
        setTestName("")
        setSections([])
        setSelectedQuestions(new Set())
      }
    } catch (error) {
      console.error("Failed to create test:", error)
      alert("Failed to create test")
    }
  }

  const totalQuestions = sections.reduce((sum, s) => sum + s.questionCount, 0)
  const totalMarks = sections.reduce((sum, s) => sum + s.marks, 0)

  const subjects = [...new Set(availableQuestions.map((q) => q.subject))]
  const filteredQuestions = availableQuestions.filter((q) => {
    const matchesSearch = q.questionText.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = filterSubject === "all" || q.subject === filterSubject
    return matchesSearch && matchesSubject
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Test Builder</h2>
        <p className="text-muted-foreground">Create custom tests from your question bank</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Details</CardTitle>
              <CardDescription>Configure basic test information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="testName">Test Name</Label>
                <Input
                  id="testName"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="e.g., JEE Main Physics Mock Test 1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="examType">Exam Type</Label>
                  <Select value={examType} onValueChange={(value) => value && setExamType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JEE_MAIN">JEE Main</SelectItem>
                      <SelectItem value="JEE_ADVANCED">JEE Advanced</SelectItem>
                      <SelectItem value="MHT_CET">MHT-CET</SelectItem>
                      <SelectItem value="NEET">NEET</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={(value) => value && setDifficulty(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Test description..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Test Sections</CardTitle>
                  <CardDescription>Define sections and question distribution</CardDescription>
                </div>
                <Button onClick={addSection} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No sections added. Click "Add Section" to begin.
                </div>
              ) : (
                <div className="space-y-4">
                  {sections.map((section, index) => (
                    <Card key={index} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-medium">Section {index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSection(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <Label>Subject</Label>
                            <Select
                              value={section.subject}
                              onValueChange={(value) => value && updateSection(index, "subject", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {subjects.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Questions</Label>
                            <Input
                              type="number"
                              value={section.questionCount}
                              onChange={(e) => updateSection(index, "questionCount", parseInt(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label>Marks</Label>
                            <Input
                              type="number"
                              value={section.marks}
                              onChange={(e) => updateSection(index, "marks", parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openQuestionSelector(index)}
                          className="w-full"
                        >
                          {selectedQuestions.size > 0 ? `${selectedQuestions.size} Questions Selected` : "Select Questions"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {sections.length > 0 && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Questions:</span>
                      <span className="ml-2 font-medium">{totalQuestions}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Marks:</span>
                      <span className="ml-2 font-medium">{totalMarks}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button onClick={saveTest} className="w-full" size="lg" disabled={!testName || sections.length === 0}>
            <Save className="h-4 w-4 mr-2" />
            Save Test
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Test Name</Label>
                <p className="text-sm font-medium">{testName || "Not set"}</p>
              </div>
              <div>
                <Label>Exam Type</Label>
                <p className="text-sm font-medium">{examType.replace("_", " ")}</p>
              </div>
              <div>
                <Label>Duration</Label>
                <p className="text-sm font-medium">{duration} minutes</p>
              </div>
              <div>
                <Label>Difficulty</Label>
                <p className="text-sm font-medium">{difficulty}</p>
              </div>
              <div>
                <Label>Sections</Label>
                <p className="text-sm font-medium">{sections.length}</p>
              </div>
              <div>
                <Label>Total Questions</Label>
                <p className="text-sm font-medium">{totalQuestions}</p>
              </div>
              <div>
                <Label>Total Marks</Label>
                <p className="text-sm font-medium">{totalMarks}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Question Bank Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Questions</span>
                <span className="font-medium">{availableQuestions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subjects</span>
                <span className="font-medium">{subjects.length}</span>
              </div>
              {subjects.map((subject) => (
                <div key={subject} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{subject}</span>
                  <span className="font-medium">
                    {availableQuestions.filter((q) => q.subject === subject).length}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isQuestionSelectorOpen} onOpenChange={setIsQuestionSelectorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Questions</DialogTitle>
            <DialogDescription>Choose questions from the question bank</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
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
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredQuestions.map((question) => (
                <Card
                  key={question.id}
                  className={`cursor-pointer transition-colors ${
                    selectedQuestions.has(question.id) ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => toggleQuestionSelection(question.id)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-2">{question.questionText}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">{question.subject}</Badge>
                          <Badge variant="secondary" className="text-xs">{question.difficulty}</Badge>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                            selectedQuestions.has(question.id)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border"
                          }`}
                        >
                          {selectedQuestions.has(question.id) && (
                            <div className="w-3 h-3 bg-white rounded-sm" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedQuestions.size} questions selected
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsQuestionSelectorOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
