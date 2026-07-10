"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { CheckCircle2, Clock3, Home, RotateCcw, Target, TrendingUp, XCircle, Award, Brain, Loader2, BookOpen } from "lucide-react"
import { getScoreMessage } from "@/config/scoring"

interface ResultsData {
  score: number
  correct: number
  incorrect: number
  unanswered: number
  accuracy: number
  timeTaken: number
  totalQuestions: number
  testName: string
  attemptId?: string
}

interface QuestionReview {
  id: string
  questionText: string
  options: string[]
  correctOption: number
  explanation: string
  subject: string
  chapter: string
  selectedOption: number | null
  isCorrect: boolean | null
  timeSpent: number
  markedForReview: boolean
}

interface SubjectBreakdown {
  subject: string
  correct: number
  total: number
  accuracy: number
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}

function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [results, setResults] = useState<ResultsData | null>(null)
  const [questions, setQuestions] = useState<QuestionReview[]>([])
  const [subjectBreakdown, setSubjectBreakdown] = useState<SubjectBreakdown[]>([])
  const [loading, setLoading] = useState(true)
  const [animating, setAnimating] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [showAnswerKey, setShowAnswerKey] = useState(false)
  const [reviewQuestion, setReviewQuestion] = useState(0)

  useEffect(() => {
    const loadResults = async () => {
      const storedResults = sessionStorage.getItem("testResults")
      const attemptId = searchParams.get("attemptId") || (storedResults ? JSON.parse(storedResults).attemptId : null)

      if (attemptId) {
        try {
          const res = await fetch(`/api/results/${attemptId}`)
          if (res.ok) {
            const json = await res.json()
            const data = json.success ? json.data : json
            setResults({
              score: data.attempt.score,
              correct: data.attempt.correct,
              incorrect: data.attempt.incorrect,
              unanswered: data.attempt.totalQuestions - data.attempt.correct - data.attempt.incorrect,
              accuracy: data.attempt.accuracy,
              timeTaken: data.attempt.timeTaken,
              totalQuestions: data.attempt.totalQuestions,
              testName: data.attempt.testName,
              attemptId: data.attempt.id,
            })
            setQuestions(data.questions || [])
            setSubjectBreakdown(data.subjectBreakdown || [])
            setTimeout(() => setAnimating(true), 100)
            setLoading(false)
            return
          }
        } catch {
          // fall through to sessionStorage
        }
      }

      if (storedResults) {
        setResults(JSON.parse(storedResults))
        setTimeout(() => setAnimating(true), 100)
      } else {
        router.push("/tests")
      }
      setLoading(false)
    }
    loadResults()
  }, [router, searchParams])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
        </div>
      </div>
    )
  }

  if (!results) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const message = getScoreMessage(results.score)

  if (showAnswerKey) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="section-spacing">
          <div className="section-container max-w-4xl space-y-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setShowAnswerKey(false)} className="text-sm text-muted-foreground hover:text-foreground">
                ← Back to results
              </button>
              <span className="text-sm text-muted-foreground">{questions.length} questions</span>
            </div>
            {questions.map((q, idx) => {
              const selectedOpt = q.selectedOption
              const correctOpt = q.correctOption
              return (
                <div key={q.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-medium text-blue-400">
                        Q{idx + 1}
                      </span>
                      {q.subject && (
                        <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground">{q.subject}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      {q.isCorrect === true && <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" /> Correct</span>}
                      {q.isCorrect === false && <span className="flex items-center gap-1 text-red-400"><XCircle className="h-3.5 w-3.5" /> Incorrect</span>}
                      {q.isCorrect === null && <span className="text-muted-foreground">Skipped</span>}
                    </div>
                  </div>
                  <p className="text-sm sm:text-base font-medium mb-3">{q.questionText}</p>
                  <div className="space-y-1.5">
                    {q.options.map((option, oi) => {
                      let ring = "border-border"
                      let bg = ""
                      let badge = ""
                      if (oi === correctOpt) {
                        ring = "border-emerald-500/40"
                        bg = "bg-emerald-500/8"
                        badge = "✓ Correct answer"
                      }
                      if (selectedOpt === oi && oi !== correctOpt) {
                        ring = "border-red-500/40"
                        bg = "bg-red-500/8"
                        badge = "✗ Your answer"
                      }
                      return (
                        <div key={oi} className={`rounded-xl border ${ring} ${bg} px-3 py-2 text-sm flex items-center justify-between`}>
                          <span><span className="font-medium mr-2">{String.fromCharCode(65 + oi)}.</span>{option}</span>
                          {badge && <span className="text-[10px] font-medium text-muted-foreground">{badge}</span>}
                        </div>
                      )
                    })}
                  </div>
                  {q.explanation && (
                    <div className="mt-3 rounded-xl border border-blue-500/10 bg-blue-500/5 px-3 py-2">
                      <p className="text-[11px] font-semibold text-blue-400 mb-0.5">Explanation</p>
                      <p className="text-xs text-muted-foreground">{q.explanation}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (showReview) {
    const q = questions[reviewQuestion]
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="section-spacing">
          <div className="section-container max-w-3xl space-y-4">
            <button onClick={() => setShowReview(false)} className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to results
            </button>
            {q && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                      Question {reviewQuestion + 1} of {questions.length}
                    </span>
                    {q.subject && (
                      <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{q.subject}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {q.isCorrect === true && <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium"><CheckCircle2 className="h-3.5 w-3.5" /> Correct</span>}
                    {q.isCorrect === false && <span className="flex items-center gap-1 text-red-400 text-xs font-medium"><XCircle className="h-3.5 w-3.5" /> Incorrect</span>}
                    {q.isCorrect === null && <span className="text-xs text-muted-foreground">Skipped</span>}
                    <span className="text-xs text-muted-foreground">{q.timeSpent}s</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-4">{q.questionText}</h3>
                <div className="space-y-2">
                  {q.options.map((option, idx) => {
                    let className = "border-border bg-card"
                    if (idx === q.correctOption) className = "border-emerald-500/30 bg-emerald-500/10"
                    else if (idx === q.selectedOption && !q.isCorrect) className = "border-red-500/30 bg-red-500/10"
                    return (
                      <div key={idx} className={`rounded-xl border p-3 ${className}`}>
                        <div className="flex items-center gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full border text-xs font-medium">
                            {idx === q.correctOption ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> :
                             idx === q.selectedOption ? <XCircle className="h-4 w-4 text-red-400" /> :
                             String.fromCharCode(65 + idx)}
                          </div>
                          <span className="text-sm">{option}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {q.explanation && (
                  <div className="mt-4 rounded-xl border border-blue-500/10 bg-blue-500/5 p-4">
                    <p className="text-xs font-semibold text-blue-400 mb-1">Explanation</p>
                    <p className="text-sm text-muted-foreground">{q.explanation}</p>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-between">
              <Button onClick={() => setReviewQuestion((p) => Math.max(0, p - 1))} disabled={reviewQuestion === 0} variant="outline">Previous</Button>
              <Button onClick={() => setReviewQuestion((p) => Math.min(questions.length - 1, p + 1))} disabled={reviewQuestion === questions.length - 1}>Next</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[35%] h-[35%] bg-blue-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-purple-500/8 rounded-full blur-[100px]" />
      </div>
      <Navbar />
      <div className="relative section-spacing">
        <div className="section-container max-w-4xl space-y-6">
          <div className={`rounded-2xl border border-border bg-card p-8 sm:p-12 text-center transition-all duration-700 ${animating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400 mb-6">
              <Award className="h-3.5 w-3.5" />
              Performance Summary
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{results.testName}</h1>
            <p className="text-muted-foreground mb-8">{message.text}</p>
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
              <div className="relative h-36 w-36 sm:h-44 sm:w-44 rounded-full border-[6px] border-border flex items-center justify-center bg-card">
                <div className="absolute inset-0 rounded-full border-[6px] border-transparent"
                  style={{
                    borderTopColor: "rgba(99,102,241,0.6)",
                    borderRightColor: "rgba(168,85,247,0.4)",
                    borderBottomColor: "rgba(236,72,153,0.3)",
                    transform: `rotate(${45 + (results.score / 100) * 270}deg)`,
                    transition: "transform 1.5s ease-out",
                  }}
                />
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold">{results.score}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Score</div>
                </div>
              </div>
            </div>
          </div>

          <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-700 delay-200 ${animating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {[
              { label: "Correct", value: results.correct, icon: CheckCircle2, gradient: "from-emerald-500 to-green-500" },
              { label: "Incorrect", value: results.incorrect, icon: XCircle, gradient: "from-red-500 to-pink-500" },
              { label: "Unattempted", value: results.unanswered, icon: Target, gradient: "from-slate-500 to-zinc-500" },
              { label: "Accuracy", value: `${results.accuracy}%`, icon: TrendingUp, gradient: "from-blue-500 to-violet-500" },
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="rounded-2xl border border-border bg-card p-5">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} mb-3`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                </div>
              )
            })}
          </div>

          <div className={`rounded-2xl border border-border bg-card p-6 transition-all duration-700 delay-400 ${animating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <Clock3 className="h-4 w-4 text-primary" />
              Time Analysis
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Time Taken</p>
                <p className="text-xl font-bold">{formatTime(results.timeTaken)}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground mb-1">Avg per Question</p>
                <p className="text-xl font-bold">{results.totalQuestions > 0 ? Math.round(results.timeTaken / results.totalQuestions) : 0}s</p>
              </div>
            </div>
          </div>

          {subjectBreakdown.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold mb-4">Subject-wise Performance</h2>
              <div className="space-y-3">
                {subjectBreakdown.map((s) => (
                  <div key={s.subject}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{s.subject}</span>
                      <span className="font-semibold">{s.accuracy}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                        style={{ width: `${s.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {questions.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={() => setShowAnswerKey(true)} variant="outline" className="rounded-xl">
                <BookOpen className="mr-2 h-4 w-4" />
                Answer Key
              </Button>
              <Button onClick={() => setShowReview(true)} variant="outline" className="rounded-xl">
                <Brain className="mr-2 h-4 w-4" />
                Review Questions
              </Button>
            </div>
          )}

          <div className={`grid gap-3 sm:grid-cols-2 transition-all duration-700 delay-500 ${animating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <Link href="/tests">
              <button className="w-full rounded-xl border border-border px-6 py-3 text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-muted">
                <RotateCcw className="h-4 w-4" />
                Take another test
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-3 text-sm font-medium text-white inline-flex items-center justify-center gap-2">
                <Home className="h-4 w-4" />
                Go to dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
