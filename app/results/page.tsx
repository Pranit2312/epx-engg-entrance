"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { CheckCircle2, Clock3, Home, RotateCcw, Target, TrendingUp, XCircle, Award, Brain, Zap } from "lucide-react"

type ResultsModel = {
  score: number
  correct: number
  incorrect: number
  unanswered: number
  accuracy: number
  timeTaken: number
  totalQuestions: number
  testName: string
}

export default function ResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<ResultsModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const storedResults = sessionStorage.getItem("testResults")
    if (storedResults) {
      setResults(JSON.parse(storedResults))
      setTimeout(() => setAnimating(true), 100)
    } else {
      router.push("/tests")
    }
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading your results...</p>
          </div>
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

  const getScoreMessage = (score: number) => {
    if (score >= 90) return { text: "Outstanding performance!", emoji: "🏆" }
    if (score >= 80) return { text: "Excellent pace and accuracy.", emoji: "🎯" }
    if (score >= 70) return { text: "Strong effort with room to sharpen your speed.", emoji: "💪" }
    if (score >= 60) return { text: "Steady progress. More revision will lift your score.", emoji: "📈" }
    return { text: "Every attempt builds mastery. Keep practicing.", emoji: "🚀" }
  }

  const message = getScoreMessage(results.score)

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[35%] h-[35%] bg-blue-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-purple-500/8 rounded-full blur-[100px]" />
      </div>
      <Navbar />

      <div className="relative section-spacing">
        <div className="section-container max-w-4xl space-y-6">
          {/* Score Card */}
          <div className={`card-premium p-8 sm:p-12 text-center transition-all duration-700 ${animating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400 mb-6">
              <Award className="h-3.5 w-3.5" />
              Performance Summary
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{results.testName}</h1>
            <p className="text-muted-foreground mb-8">{message.text}</p>

            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
              <div className="relative h-36 w-36 sm:h-44 sm:w-44 rounded-full border-[6px] border-white/[0.08] flex items-center justify-center bg-white/[0.03]">
                <div
                  className="absolute inset-0 rounded-full border-[6px] border-transparent"
                  style={{
                    borderTopColor: 'rgba(99,102,241,0.6)',
                    borderRightColor: 'rgba(168,85,247,0.4)',
                    borderBottomColor: 'rgba(236,72,153,0.3)',
                    transform: `rotate(${45 + (results.score / 100) * 270}deg)`,
                    transition: 'transform 1.5s ease-out',
                  }}
                />
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold">{results.score}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Score</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-700 delay-200 ${animating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {[
              { label: "Correct", value: results.correct, icon: CheckCircle2, gradient: "from-emerald-500 to-green-500", color: "text-emerald-400" },
              { label: "Incorrect", value: results.incorrect, icon: XCircle, gradient: "from-red-500 to-pink-500", color: "text-red-400" },
              { label: "Unattempted", value: results.unanswered, icon: Target, gradient: "from-slate-500 to-zinc-500", color: "text-muted-foreground" },
              { label: "Accuracy", value: `${results.accuracy}%`, icon: TrendingUp, gradient: "from-blue-500 to-violet-500", color: "text-blue-400" },
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="card-premium p-5" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} mb-3`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                </div>
              )
            })}
          </div>

          {/* Time Analysis */}
          <div className={`card-premium p-6 transition-all duration-700 delay-400 ${animating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <Clock3 className="h-4 w-4 text-primary" />
              Time Analysis
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Time Taken</p>
                <p className="text-xl font-bold">{formatTime(results.timeTaken)}</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <p className="text-xs text-muted-foreground mb-1">Avg per Question</p>
                <p className="text-xl font-bold">{Math.round(results.timeTaken / results.totalQuestions)}s</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={`grid gap-3 sm:grid-cols-2 transition-all duration-700 delay-500 ${animating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <Link href="/tests">
              <button className="w-full btn-gradient-secondary px-6 py-3 text-sm font-medium inline-flex items-center justify-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Take another test
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="w-full btn-gradient px-6 py-3 text-sm font-medium inline-flex items-center justify-center gap-2">
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
