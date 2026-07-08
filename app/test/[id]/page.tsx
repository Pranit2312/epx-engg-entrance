"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Clock3, ChevronLeft, ChevronRight, Flag, CheckCircle2, AlertTriangle, Maximize2, Minimize2, Trash2, Loader2, AlertCircle } from "lucide-react"

interface TestItem {
  id: string
  name: string
  examType: string
  subject: string
  duration: number
  totalQuestions: number
  difficulty: string
  description?: string | null
}

interface QuestionItem {
  id: string
  questionText: string
  options: string[]
  correctOption: number
  explanation?: string
  subject?: string
  chapter?: string
  topic?: string
  difficulty?: string
  imagePath?: string
  marks?: number
  negativeMarks?: number
}

const STORAGE_KEY_PREFIX = "epx_test_"
const AUTO_SAVE_INTERVAL = 30000

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
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [test, setTest] = useState<TestItem | null>(null)
  const [testStarted, setTestStarted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [questionTimers, setQuestionTimers] = useState<Record<string, number>>({})
  const [questionEntryTime, setQuestionEntryTime] = useState(0)
  const [currentSection, setCurrentSection] = useState<string | null>(null)
  const [sections, setSections] = useState<{ name: string; start: number; end: number }[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const storageKey = `${STORAGE_KEY_PREFIX}${testId}`
  const intervalRef = useRef<number | null>(null)
  const submitInProgress = useRef(false)

  const saveToLocalStorage = useCallback(() => {
    try {
      const data = {
        selectedAnswers,
        markedForReview: Array.from(markedForReview),
        timeRemaining,
        currentQuestion,
        questionTimers,
        testStarted,
      }
      localStorage.setItem(storageKey, JSON.stringify(data))
    } catch (e) {
      console.warn("localStorage save failed:", e)
    }
  }, [selectedAnswers, markedForReview, timeRemaining, currentQuestion, questionTimers, testStarted, storageKey])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    const loadTest = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const [testsRes, questionsRes] = await Promise.all([
          fetch("/api/tests").catch(() => null),
          fetch(`/api/tests/${testId}/questions`).catch(() => null),
        ])

        const testsData = testsRes?.ok ? await testsRes.json().catch(() => []) : []
        const questionsData = questionsRes?.ok ? await questionsRes.json().catch(() => ({ questions: [], fallback: true })) : { questions: [], fallback: true }

        const foundTest = Array.isArray(testsData) ? testsData.find((item: TestItem) => item.id === testId) : null
        if (!foundTest) {
          setLoadError("Test not found. It may have been removed.")
          setIsLoading(false)
          return
        }

        setTest(foundTest)

        let qs = questionsData.questions
        if (!qs || qs.length === 0) {
          setLoadError("No questions available for this test. Please contact admin.")
          setIsLoading(false)
          return
        }
        setQuestions(qs || [])

        if (foundTest.examType === "JEE_MAIN" && foundTest.subject === "All Subjects" && qs && qs.length >= 75) {
          setSections([
            { name: "Physics", start: 0, end: 24 },
            { name: "Chemistry", start: 25, end: 49 },
            { name: "Mathematics", start: 50, end: 74 },
          ])
          setCurrentSection("Physics")
        }

        const saved = localStorage.getItem(storageKey)
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            setSelectedAnswers(parsed.selectedAnswers || {})
            setMarkedForReview(new Set(parsed.markedForReview || []))
            setTimeRemaining(parsed.timeRemaining ?? foundTest.duration * 60)
            setCurrentQuestion(typeof parsed.currentQuestion === "number" ? parsed.currentQuestion : 0)
            setQuestionTimers(parsed.questionTimers || {})
            setTestStarted(parsed.testStarted ?? false)
            if (parsed.testStarted) {
              setQuestionEntryTime(Date.now())
            }
            setIsLoading(false)
            return
          } catch (e) {
            console.warn("Corrupt localStorage data, starting fresh:", e)
          }
        }

        const durationSeconds = (foundTest.duration || 60) * 60
        setTimeRemaining(durationSeconds)
        setQuestionEntryTime(Date.now())
      } catch (e) {
        console.error("Failed to load test:", e)
        setLoadError("Failed to load test. Please check your connection and try again.")
      }
      setIsLoading(false)
    }
    loadTest()
  }, [testId, storageKey])

  const doAutoSubmit = useCallback(async () => {
    if (submitInProgress.current || !test || !session?.user?.id) return
    submitInProgress.current = true
    setIsSubmitting(true)
    await submitAttempt(true)
  }, [test, session])

  const autoSubmitRef = useRef(doAutoSubmit)
  autoSubmitRef.current = doAutoSubmit

  useEffect(() => {
    if (!testStarted || questions.length === 0) return

    const timer = window.setInterval(() => {
      setTimeRemaining((prev) => prev > 0 ? prev - 1 : prev)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [testStarted, questions.length])

  useEffect(() => {
    if (!testStarted || timeRemaining > 0 || questions.length === 0) return
    const id = setTimeout(() => { autoSubmitRef.current() }, 100)
    return () => clearTimeout(id)
  }, [testStarted, timeRemaining, questions.length])

  useEffect(() => {
    if (!testStarted || questions.length === 0) return
    const autoSave = setInterval(saveToLocalStorage, AUTO_SAVE_INTERVAL)
    return () => clearInterval(autoSave)
  }, [testStarted, saveToLocalStorage, questions.length])

  useEffect(() => {
    if (questions.length > 0) saveToLocalStorage()
  }, [selectedAnswers, markedForReview, questions.length])

  const formatTime = (seconds: number) => {
    if (typeof seconds !== "number" || seconds < 0) return "00:00"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const calcResults = () => {
    if (questions.length === 0) return { correct: 0, incorrect: 0, unanswered: 0, score: 0, accuracy: 0, timeTaken: 0 }
    let correct = 0
    let incorrect = 0
    let unanswered = 0
    for (const q of questions) {
      if (!q || !q.id) continue
      const selected = selectedAnswers[q.id]
      if (selected === undefined) unanswered++
      else if (typeof q.correctOption === "number" && selected === q.correctOption) correct++
      else incorrect++
    }
    const totalAttempted = correct + incorrect
    return {
      correct,
      incorrect,
      unanswered,
      score: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
      accuracy: totalAttempted > 0 ? Math.round((correct / totalAttempted) * 100) : 0,
      timeTaken: test ? Math.max(0, (test.duration || 60) * 60 - timeRemaining) : 0,
    }
  }

  const submitAttempt = async (autoSubmit = false) => {
    if (!test || !session?.user?.id || questions.length === 0) return
    const results = calcResults()

    const questionAnswers = questions
      .filter((q) => q && q.id)
      .map((q) => {
        const selectedOption = selectedAnswers[q.id] ?? null
        const isCorrect = selectedOption === null ? null : typeof q.correctOption === "number" && selectedOption === q.correctOption
        return {
          questionId: q.id,
          selectedOption,
          timeSpent: questionTimers[q.id] ?? 0,
          markedForReview: markedForReview.has(q.id),
          isCorrect,
        }
      })

    let attemptId: string | null = null
    try {
      const response = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mockTestId: test.id,
          score: results.score,
          correct: results.correct,
          incorrect: results.incorrect,
          totalQuestions: questions.length,
          accuracy: results.accuracy,
          timeTaken: results.timeTaken,
          answers: selectedAnswers,
          markedForReview: Array.from(markedForReview),
          startedAt: new Date(Date.now() - results.timeTaken * 1000).toISOString(),
          submittedAt: new Date().toISOString(),
          questionAnswers,
        }),
      })

      const payload = await response.json()
      attemptId = payload?.attempt?.id ?? null
      localStorage.removeItem(storageKey)
    } catch {
      attemptId = null
    }

    sessionStorage.setItem(
      "testResults",
      JSON.stringify({
        ...results,
        totalQuestions: questions.length,
        testName: test.name,
        attemptId,
      })
    )

    if (!autoSubmit) setShowSubmitDialog(false)
    router.push("/results")
  }

  const handleAnswerSelect = (optionIndex: number) => {
    if (!questions[currentQuestion]?.id) return
    const qid = questions[currentQuestion].id
    setSelectedAnswers((prev) => ({ ...prev, [qid]: optionIndex }))
    trackTimeOnQuestion()
  }

  const trackTimeOnQuestion = () => {
    if (questionEntryTime === 0 || !questions[currentQuestion]?.id) return
    const qid = questions[currentQuestion].id
    const elapsed = Math.floor((Date.now() - questionEntryTime) / 1000)
    if (elapsed > 0) {
      setQuestionTimers((prev) => ({ ...prev, [qid]: (prev[qid] ?? 0) + elapsed }))
    }
    setQuestionEntryTime(Date.now())
  }

  const handlePrevious = () => {
    if (questions.length === 0) return
    trackTimeOnQuestion()
    setCurrentQuestion((prev) => Math.max(prev - 1, 0))
  }

  const handleNext = () => {
    if (questions.length === 0) return
    trackTimeOnQuestion()
    setCurrentQuestion((prev) => Math.min(prev + 1, questions.length - 1))
  }

  const handleMarkForReview = () => {
    if (!questions[currentQuestion]?.id) return
    trackTimeOnQuestion()
    const qid = questions[currentQuestion].id
    setMarkedForReview((prev) => {
      const next = new Set(prev)
      if (next.has(qid)) next.delete(qid)
      else next.add(qid)
      return next
    })
  }

  const handleClearResponse = () => {
    if (!questions[currentQuestion]?.id) return
    const qid = questions[currentQuestion].id
    setSelectedAnswers((prev) => {
      const next = { ...prev }
      delete next[qid]
      return next
    })
  }

  const toggleFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullScreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullScreen(false)
      }
    } catch (e) {
      console.warn("Fullscreen not supported:", e)
    }
  }

  useEffect(() => {
    const handler = () => setIsFullScreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  const handleQuestionClick = (index: number) => {
    if (index < 0 || index >= questions.length) return
    trackTimeOnQuestion()
    setCurrentQuestion(index)
  }

  const handleSubmit = () => {
    if (questions.length === 0) return
    setShowSubmitDialog(true)
  }

  const getQuestionStatus = (index: number) => {
    const questionId = questions[index]?.id
    if (!questionId) return "unanswered"
    const hasAnswer = selectedAnswers[questionId] !== undefined
    const isMarked = markedForReview.has(questionId)
    if (isMarked && hasAnswer) return "answered-review"
    if (isMarked) return "review"
    if (hasAnswer) return "answered"
    return "unanswered"
  }

  const currentQ = questions.length > 0 && currentQuestion < questions.length ? questions[currentQuestion] : null
  const selectedAnswer = currentQ?.id ? selectedAnswers[currentQ.id] : undefined
  const answeredCount = Object.keys(selectedAnswers).length

  // AUTH LOADING
  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!session) return null

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading questions...</p>
          </div>
        </div>
      </div>
    )
  }

  // ERROR STATE
  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-md text-center space-y-4">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="text-xl font-bold">Failed to Load Test</h2>
            <p className="text-sm text-muted-foreground">{loadError}</p>
            <div className="flex gap-3 justify-center">
              <Link href="/tests">
                <Button variant="outline" className="rounded-xl">Back to Tests</Button>
              </Link>
              <Button onClick={() => window.location.reload()} className="rounded-xl">Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // TEST NOT FOUND
  if (!test) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-md text-center space-y-4">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="text-xl font-bold">Test Not Found</h2>
            <p className="text-sm text-muted-foreground">This test does not exist or has been removed.</p>
            <Link href="/tests">
              <Button className="rounded-xl">Back to Tests</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // NO QUESTIONS
  if (questions.length === 0 && !isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-md text-center space-y-4">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-bold">No Questions Available</h2>
            <p className="text-sm text-muted-foreground">This test has no questions. Please try another test.</p>
            <Link href="/tests">
              <Button className="rounded-xl">Back to Tests</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // INSTRUCTIONS SCREEN
  if (!testStarted) {
    return (
      <div className="min-h-screen">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-[35%] h-[35%] bg-blue-500/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-purple-500/8 rounded-full blur-[100px]" />
        </div>
        <div className="relative flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-2xl">
            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400 mb-4">
                  Exam Instructions
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{test.name}</h1>
                <p className="text-muted-foreground">{test.description}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><Clock3 className="h-4 w-4" />Duration</div>
                  <div className="text-2xl font-bold">{test.duration || 60} mins</div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><CheckCircle2 className="h-4 w-4" />Questions</div>
                  <div className="text-2xl font-bold">{questions.length}</div>
                </div>
              </div>
              <ul className="space-y-2 mb-8 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Each question has 4 options</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> You can mark questions for review</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> The test auto-submits when time runs out</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Your progress is auto-saved</li>
              </ul>
              <button
                onClick={() => { setTestStarted(true); setQuestionEntryTime(Date.now()) }}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-3 text-base font-semibold text-white transition-all hover:shadow-lg hover:shadow-indigo-600/30 active:scale-[0.98]"
              >
                Start Test
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // === MAIN TEST INTERFACE ===
  return (
    <div ref={containerRef} className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-2 sm:px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExitDialog(true)}
              className="rounded-xl px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors border border-border"
            >
              Exit
            </button>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold">{test.name}</p>
              <p className="text-xs text-muted-foreground">
                {test.examType === "JEE_MAIN" && test.subject === "All Subjects"
                  ? "Physics • Chemistry • Mathematics"
                  : test.subject || "General"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullScreen}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted"
              title={isFullScreen ? "Exit full screen" : "Full screen"}
            >
              {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <div className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-sm font-bold ${
              timeRemaining < 300 ? "bg-red-500/15 text-red-400 border border-red-500/20" : "bg-muted text-foreground border border-border"
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

      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex-1 p-2 lg:p-4">
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
            {sections.length > 0 && (
              <div className="flex gap-1 mb-4 overflow-x-auto">
                {sections.map((sec) => {
                  const secQuestions = questions.slice(sec.start, sec.end + 1).filter(Boolean)
                  const secAnswered = secQuestions.filter((q) => q?.id && selectedAnswers[q.id] !== undefined).length
                  return (
                    <button
                      key={sec.name}
                      onClick={() => { trackTimeOnQuestion(); setCurrentSection(sec.name); setCurrentQuestion(sec.start) }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                        currentSection === sec.name
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {sec.name} ({secAnswered}/{secQuestions.length})
                    </button>
                  )
                })}
              </div>
            )}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                  Question {questions.length > 0 ? currentQuestion + 1 : 0} of {questions.length}
                </div>
                {currentQ?.subject && (
                  <div className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                    {currentQ.subject}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearResponse}
                  disabled={selectedAnswer === undefined}
                  className="rounded-xl text-muted-foreground"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Clear
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkForReview}
                  className={`rounded-xl ${currentQ?.id && markedForReview.has(currentQ.id) ? "text-amber-400" : "text-muted-foreground"}`}
                >
                  <Flag className={`mr-1.5 h-3.5 w-3.5 ${currentQ?.id && markedForReview.has(currentQ.id) ? "fill-amber-400" : ""}`} />
                  {currentQ?.id && markedForReview.has(currentQ.id) ? "Marked" : "Review"}
                </Button>
              </div>
            </div>

            {currentQ ? (
              <>
                <h2 className="text-lg sm:text-xl font-semibold leading-relaxed mb-6">{currentQ.questionText}</h2>
                {currentQ.imagePath && (
                  <div className="mb-6 rounded-xl overflow-hidden border border-border">
                    <img 
                      src={currentQ.imagePath} 
                      alt="Question image" 
                      className="w-full h-auto max-h-64 object-contain"
                    />
                  </div>
                )}
                <div className="space-y-3">
                  {Array.isArray(currentQ.options) && currentQ.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full rounded-xl border p-3 sm:p-4 text-left transition-all ${
                        selectedAnswer === index
                          ? "border-primary/50 bg-primary/10 ring-1 ring-primary/20"
                          : "border-border bg-card hover:border-border hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                          selectedAnswer === index
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground"
                        }`}>
                          {selectedAnswer === index ? <CheckCircle2 className="h-4 w-4" /> : String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-sm sm:text-base">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <p>Question not available.</p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <Button onClick={handlePrevious} disabled={currentQuestion === 0 || questions.length === 0} variant="outline" className="rounded-xl">
                <ChevronLeft className="mr-1.5 h-4 w-4" /> Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                {answeredCount} answered · {Math.max(0, questions.length - answeredCount)} remaining
              </span>
              <Button onClick={handleNext} disabled={currentQuestion >= questions.length - 1 || questions.length === 0} className="rounded-xl">
                Next <ChevronRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <aside className="border-t border-border bg-card p-4 lg:w-80 lg:border-l lg:border-t-0 lg:p-6">
          <h3 className="font-semibold text-sm mb-4">Question Navigator</h3>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-5">
            {questions.map((_, index) => {
              if (index < 0 || index >= questions.length) return null
              const status = getQuestionStatus(index)
              const isActive = index === currentQuestion
              return (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(index)}
                  className={`h-9 w-9 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-2 ring-primary/30"
                      : status === "answered"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      : status === "answered-review"
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/20 ring-1 ring-emerald-500/30"
                      : status === "review"
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                      : "border border-border text-muted-foreground hover:border-border"
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
            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full border border-border" /> Unanswered</div>
          </div>
          <div className="mt-6 rounded-xl border border-border bg-card p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-400">{answeredCount}</div>
                <div className="text-xs text-muted-foreground">Answered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-muted-foreground">{Math.max(0, questions.length - answeredCount)}</div>
                <div className="text-xs text-muted-foreground">Remaining</div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Submit this test?
            </DialogTitle>
            <DialogDescription>
              You have answered {answeredCount} of {questions.length} questions.
              {markedForReview.size > 0 && ` ${markedForReview.size} question${markedForReview.size > 1 ? "s are" : " is"} marked for review.`}
              {questions.length - answeredCount > 0 && ` ${questions.length - answeredCount} question${questions.length - answeredCount > 1 ? "s" : ""} unanswered.`}
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

      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Exit this test?
            </DialogTitle>
            <DialogDescription>
              Your progress is auto-saved. You can resume this test later from where you left off.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowExitDialog(false)} className="rounded-xl">Continue Test</Button>
            <Link href="/tests">
              <Button variant="destructive" className="rounded-xl">Exit</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
