"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Loader2, Send, Bot, User, Sparkles, ArrowLeft, Target, BarChart3, Brain } from "lucide-react"
import Link from "next/link"

const EXAM_TYPES = [
  { value: "JEE_MAIN", label: "JEE Main" },
  { value: "JEE_ADVANCED", label: "JEE Advanced" },
  { value: "MHT_CET", label: "MHT-CET" },
  { value: "BITSAT", label: "BITSAT" },
  { value: "VITEEE", label: "VITEEE" },
  { value: "COMEDK", label: "COMEDK" },
  { value: "KCET", label: "KCET" },
  { value: "WBJEE", label: "WBJEE" },
  { value: "GUJCET", label: "GUJCET" },
  { value: "OTHER", label: "Other" },
]

const SUBJECTS = ["Physics", "Chemistry", "Mathematics"]

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: Date
}

export default function MentorPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isNewUser, setIsNewUser] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [isDemo, setIsDemo] = useState(false)
  const [setupData, setSetupData] = useState({
    targetExam: "",
    weakSubjects: [] as string[],
    strongSubjects: [] as string[],
    currentScore: "",
  })
  const [saving, setSaving] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated") checkSetup()
  }, [status, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const checkSetup = async () => {
    try {
      const [setupRes, historyRes] = await Promise.all([
        fetch("/api/user/setup"),
        fetch("/api/ai/mentor/history"),
      ])
      if (setupRes.ok) {
        const setup = await setupRes.json()
        const setupData = setup.success ? setup.data : setup
        setIsNewUser(setupData.isNewUser !== false)
        if (setupData.isNewUser && !setupData.hasCompletedSetup) {
          setShowSetup(true)
        }
      }
      if (historyRes.ok) {
        const result = await historyRes.json()
        setMessages((result.success ? result.data.messages : []) ?? [])
      }
    } catch {
      // silent
    }
    setLoading(false)
  }

  const handleSetupSave = async () => {
    if (!setupData.targetExam) return
    setSaving(true)
    try {
      const res = await fetch("/api/user/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetExam: setupData.targetExam,
          preferredSubjects: setupData.strongSubjects,
          weakSubjects: setupData.weakSubjects,
          currentScore: setupData.currentScore ? parseInt(setupData.currentScore) : undefined,
        }),
      })
      if (res.ok) {
        setShowSetup(false)
        setIsNewUser(false)
      }
    } catch {
      // silent
    }
    setSaving(false)
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || sending) return
    setInput("")
    setSending(true)

    const tempId = `temp-${Date.now()}`
    setMessages((prev) => [...prev, { id: tempId, role: "user", content: text, createdAt: new Date() }])

    try {
      const res = await fetch("/api/ai/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })

      if (res.ok) {
        const result = await res.json()
        const mentorData = result.success ? result.data : result
        setIsDemo(mentorData.isDemo === true)
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempId),
          { id: tempId, role: "user", content: text, createdAt: new Date() },
          { id: `resp-${Date.now()}`, role: "assistant", content: mentorData.reply, createdAt: new Date() },
        ])
      } else {
        const errData = await res.json().catch(() => ({}))
        const errMsg = errData.error?.message || errData.error || `Server error (${res.status})`
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempId),
          { id: tempId, role: "user", content: text, createdAt: new Date() },
          { id: `err-${Date.now()}`, role: "assistant", content: `Error: ${errMsg}`, createdAt: new Date() },
        ])
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Network error"
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        { id: tempId, role: "user", content: text, createdAt: new Date() },
        { id: `err-${Date.now()}`, role: "assistant", content: `Error: ${errMsg}`, createdAt: new Date() },
      ])
    }
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleSubject = (field: "weakSubjects" | "strongSubjects", subject: string) => {
    setSetupData((prev) => ({
      ...prev,
      [field]: prev[field].includes(subject)
        ? prev[field].filter((s) => s !== subject)
        : [...prev[field], subject],
    }))
  }

  const suggestedQuestions = [
    "What are my weak topics?",
    "How can I improve my Physics score?",
    "Create a 7-day study plan for me",
    "Which chapters should I focus on today?",
    "Analyze my test performance",
    "What will my rank be?",
  ]

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

  if (showSetup) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500">
                  <Brain className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-2">Welcome to AI Mentor</h1>
              <p className="text-muted-foreground">
                Let me personalize your experience. Tell me about your exam goals.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Target Exam</label>
                <select
                  value={setupData.targetExam}
                  onChange={(e) => setSetupData((prev) => ({ ...prev, targetExam: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-violet-500/50"
                >
                  <option value="">Select your exam</option>
                  {EXAM_TYPES.map((ex) => (
                    <option key={ex.value} value={ex.value}>{ex.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Current Score (optional)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={setupData.currentScore}
                  onChange={(e) => setSetupData((prev) => ({ ...prev, currentScore: e.target.value }))}
                  placeholder="e.g., 55"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-violet-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Strong Subjects</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleSubject("strongSubjects", s)}
                      className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
                        setupData.strongSubjects.includes(s)
                          ? "bg-green-500/20 border-green-500 text-green-400"
                          : "border-border bg-card hover:bg-muted"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Weak Subjects</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleSubject("weakSubjects", s)}
                      className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
                        setupData.weakSubjects.includes(s)
                          ? "bg-red-500/20 border-red-500 text-red-400"
                          : "border-border bg-card hover:bg-muted"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleSetupSave}
                disabled={!setupData.targetExam || saving}
                className="w-full rounded-xl"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Target className="h-4 w-4 mr-2" />}
                Start Mentorship
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">AI Mentor</h1>
                <p className="text-xs text-muted-foreground">Powered by Groq AI</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isDemo && (
              <span className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <BarChart3 className="h-3 w-3" /> Estimated Data
              </span>
            )}
            <Sparkles className="h-5 w-5 text-amber-400" />
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pb-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Bot className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Performance Intelligence Mentor</h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                I analyze your test data, track weak topics, and generate personalized study plans.
                Ask me anything about your performance.
              </p>
              <div className="grid gap-2 w-full max-w-md">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q) }}
                    className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-left hover:bg-muted transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 mt-1">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white"
                  : "border border-border bg-card"
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-white/60" : "text-muted-foreground"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted mt-1">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-border pt-4 pb-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your performance..."
              className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-violet-500/50"
              disabled={sending}
            />
            <Button onClick={handleSend} disabled={!input.trim() || sending} className="rounded-xl">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Responses are personalized using your test history, accuracy data, and performance trends
          </p>
        </div>
      </div>
    </div>
  )
}
