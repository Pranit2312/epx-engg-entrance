"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Loader2, Send, Bot, User, Sparkles, ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"

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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated") loadHistory()
  }, [status, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/ai/mentor/history")
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages ?? [])
      }
    } catch {
      // silent
    }
    setLoading(false)
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
        const data = await res.json()
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempId),
          { id: tempId, role: "user", content: text, createdAt: new Date() },
          { id: `resp-${Date.now()}`, role: "assistant", content: data.reply, createdAt: new Date() },
        ])
      } else {
        const errData = await res.json().catch(() => ({}))
        const errMsg = errData.message || errData.error || `Server error (${res.status})`
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

  const suggestedQuestions = [
    "Why am I weak in Electrostatics?",
    "How can I improve my Physics score?",
    "What should I study today?",
    "Create a 7-day study plan for me",
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
                <p className="text-xs text-muted-foreground">Powered by Gemini</p>
              </div>
            </div>
          </div>
          <Sparkles className="h-5 w-5 text-amber-400" />
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pb-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Bot className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Ask me anything about your studies</h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                I have access to your test history and performance data. I can help you identify weak areas, create study plans, and improve your exam strategy.
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
              placeholder="Ask your AI mentor..."
              className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-violet-500/50"
              disabled={sending}
            />
            <Button onClick={handleSend} disabled={!input.trim() || sending} className="rounded-xl">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Your mentor has access to your test history and performance analytics
          </p>
        </div>
      </div>
    </div>
  )
}
