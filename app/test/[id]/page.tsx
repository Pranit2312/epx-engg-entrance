"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Navbar } from "@/components/navbar"
import { Clock3, ChevronLeft, ChevronRight, Flag, CheckCircle2, AlertTriangle, Brain } from "lucide-react"
import { generateMockQuestions, type Question } from "@/lib/data/mock-questions"

type TestItem = {
  id: string
  name: string
  examType: string
  subject: string
  duration: number
  totalQuestions: number
  difficulty: string
  description?: string | null
}

export default function TestAttemptPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const testId = params.id as string

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [test, setTest] = useState<TestItem | null>(null)
  const [testStarted, setTestStarted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    const loadTest = async () => {
      const response = await fetch("/api/tests")
      const data = await response.json()
      const foundTest = data.find((item: TestItem) => item.id === testId)
      if (foundTest) {
        setTest(foundTest)
        setQuestions(generateMockQuestions(foundTest.totalQuestions))
        setTimeRemaining(foundTest.duration * 60)
      }
    }

    loadTest()
  }, [testId])

  useEffect(() => {
    if (!testStarted || timeRemaining <= 0) return

    const timer = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer)
          void handleSubmitAuto()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [testStarted, timeRemaining])

  const handleSubmitAuto = async () => {
    if (isSubmitting || !test || !session?.user?.id) return
    setIsSubmitting(true)
    await submitAttempt(true)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const calcResults = () => {
    let correct = 0
    let incorrect = 0
    let unanswered = 0

    questions.forEach((question) => {
      const selected = selectedAnswers[question.id]
      if (selected === undefined) unanswered += 1
      else if (selected === question.correctOption) correct += 1
      else incorrect += 1
    })

    return {
      correct,
      incorrect,
      unanswered,
      score: Math.round((correct / questions.length) * 100),
      accuracy: Math.round((correct / Math.max(correct + incorrect, 1)) * 100),
      timeTaken: test ? test.duration * 60 - timeRemaining : 0,
    }
  }

  const submitAttempt = async (autoSubmit = false) => {
    if (!test || !session?.user?.id) return

    const results = calcResults()

    const response = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mockTestId: test.id,
        score: results.score,
        correct: results.correct,
        incorrect: results.incorrect,
        accuracy: results.accuracy,
        timeTaken: results.timeTaken,
        answers: selectedAnswers,
        markedForReview: Array.from(markedForReview),
        startedAt: new Date(Date.now() - (test.duration * 60 - timeRemaining) * 1000).toISOString(),
        submittedAt: new Date().toISOString(),
      }),
    })

    const payload = await response.json()
    sessionStorage.setItem(
      "testResults",
      JSON.stringify({
        ...results,
        totalQuestions: questions.length,
        testName: test.name,
        attemptId: payload.attempt?.id,
      })
    )

    if (!autoSubmit) setShowSubmitDialog(false)
    router.push("/results")
  }

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questions[currentQuestion].id]: optionIndex }))
  }

  const handlePrevious = () => {
    setCurrentQuestion((prev) => Math.max(prev - 1, 0))
  }

  const handleNext = () => {
    setCurrentQuestion((prev) => Math.min(prev + 1, questions.length - 1))
  }

  const handleMarkForReview = () => {
    setMarkedForReview((prev) => {
      const next = new Set(prev)
      if (next.has(questions[currentQuestion].id)) next.delete(questions[currentQuestion].id)
      else next.add(questions[currentQuestion].id)
      return next
    })
  }

  const handleQuestionClick = (index: number) => {
    setCurrentQuestion(index)
  }

  const handleSubmit = () => {
    setShowSubmitDialog(true)
  }

  const getQuestionStatus = (index: number) => {
    const questionId = questions[index].id
    const hasAnswer = selectedAnswers[questionId] !== undefined
    const isMarked = markedForReview.has(questionId)

    if (isMarked) return "review"
    if (hasAnswer) return "answered"
    return "unanswered"
  }

  const currentQ = questions[currentQuestion]
  const selectedAnswer = currentQ ? selectedAnswers[currentQ.id] : undefined
  const answeredCount = Object.keys(selectedAnswers).length

  if (status === "loading" || !test) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Preparing your test...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) return null

  if (!testStarted) {
    return (
      <div className="min-h-screen">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-[35%] h-[35%] bg-blue-500/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-purple-500/8 rounded-full blur-[100px]" />
        </div>
        <Navbar />
        <div className="relative flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-2xl">
            <div className="card-premium p-8">
              <div className="text-center mb-8">
                <Badge variant="gradient" className="mb-4">Exam Instructions</Badge>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{test.name}</h1>
                <p className="text-muted-foreground">{test.description}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><Clock3 className="h-4 w-4" />Duration</div>
                  <div className="text-2xl font-bold">{test.duration} mins</div>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><Brain className="h-4 w-4" />Questions</div>
                  <div className="text-2xl font-bold">{test.totalQuestions}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-8">
                <Badge variant="secondary">{test.examType}</Badge>
                <Badge variant="outline">{test.subject}</Badge>
                <Badge variant={test.difficulty === "HARD" ? "danger" : test.difficulty === "MEDIUM" ? "warning" : "success"}>{test.difficulty}</Badge>
              </div>
              <button onClick={() => setTestStarted(true)} className="w-full btn-gradient h-11 text-base font-medium">
                Start Test
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 border-b border-white/[0.06] bg-background/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/tests">
              <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground">Exit</Button>
            </Link>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold">{test.name}</p>
              <p className="text-xs text-muted-foreground">{test.subject}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-sm font-bold ${
              timeRemaining < 300 ? "bg-red-500/15 text-red-400 border border-red-500/20" : "bg-white/[0.05] text-foreground border border-white/[0.06]"
            }`}>
              <Clock3 className="h-3.5 w-3.5" />
              {formatTime(timeRemaining)}
            </div>
            <Button onClick={handleSubmit} variant="destructive" size="sm" disabled={isSubmitting} className="rounded-xl">
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Test Area */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Question Area */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="card-premium p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <Badge variant="outline" className="border-blue-500/20 text-blue-400">
                Question {currentQuestion + 1} of {questions.length}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkForReview}
                className={`rounded-xl ${markedForReview.has(currentQ.id) ? "text-amber-400" : "text-muted-foreground"}`}
              >
                <Flag className={`mr-1.5 h-3.5 w-3.5 ${markedForReview.has(currentQ.id) ? "fill-amber-400" : ""}`} />
                {markedForReview.has(currentQ.id) ? "Marked" : "Mark for review"}
              </Button>
            </div>

            <h2 className="text-lg sm:text-xl font-semibold leading-relaxed mb-6">{currentQ.questionText}</h2>

            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={`${currentQ.id}-${index}`}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${
                    selectedAnswer === index
                      ? "border-primary/50 bg-primary/10 ring-1 ring-primary/20"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                      selectedAnswer === index
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-white/[0.15] text-muted-foreground"
                    }`}>
                      {selectedAnswer === index ? <CheckCircle2 className="h-4 w-4" /> : String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-sm sm:text-base">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-4">
              <Button onClick={handlePrevious} disabled={currentQuestion === 0} variant="outline" className="rounded-xl">
                <ChevronLeft className="mr-1.5 h-4 w-4" /> Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                {answeredCount} answered · {questions.length - answeredCount} remaining
              </span>
              <Button onClick={handleNext} disabled={currentQuestion === questions.length - 1} className="rounded-xl">
                Next <ChevronRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Question Navigator */}
        <aside className="border-t border-white/[0.06] bg-white/[0.02] p-4 lg:w-80 lg:border-l lg:border-t-0 lg:p-6">
          <h3 className="font-semibold text-sm mb-4">Question Navigator</h3>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-5">
            {questions.map((_, index) => {
              const status = getQuestionStatus(index)
              const isActive = index === currentQuestion
              return (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(index)}
                  className={`h-9 w-9 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : status === "answered"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      : status === "review"
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                      : "border border-white/[0.08] text-muted-foreground hover:border-white/[0.15]"
                  }`}
                >
                  {index + 1}
                </button>
              )
            })}
          </div>
          <div className="mt-6 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-primary ring-1 ring-primary/30" /> Current</div>
            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500/30 ring-1 ring-emerald-500/30" /> Answered</div>
            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-500/30 ring-1 ring-amber-500/30" /> Marked for review</div>
            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full border border-white/[0.15]" /> Unanswered</div>
          </div>
          <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-400">{answeredCount}</div>
                <div className="text-xs text-muted-foreground">Answered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-muted-foreground">{questions.length - answeredCount}</div>
                <div className="text-xs text-muted-foreground">Remaining</div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Submit this test?
            </DialogTitle>
            <DialogDescription>
              You have answered {answeredCount} of {questions.length} questions.
              {markedForReview.size > 0 && ` ${markedForReview.size} question${markedForReview.size > 1 ? 's are' : ' is'} marked for review.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)} className="rounded-xl">Continue</Button>
            <Button onClick={() => void submitAttempt(false)} variant="destructive" disabled={isSubmitting} className="rounded-xl">
              {isSubmitting ? "Submitting..." : "Submit test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
