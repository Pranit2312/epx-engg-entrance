"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, HelpCircle, Ticket, Clock, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Ticket {
  id: string
  subject: string
  description: string
  status: string
  priority: string
  createdAt: string
}

const faqs = [
  { q: "What is EPX?", a: "EPX is an AI-powered exam preparation platform for engineering entrance exams (JEE Main, JEE Advanced, MHT-CET, BITSAT, COMEDK, and more)." },
  { q: "How do I start a mock test?", a: "Navigate to 'Mock Tests' from the dashboard or sidebar, select a test, and click 'Start Test'. You can filter by exam, subject, and difficulty." },
  { q: "Are the tests timed?", a: "Yes, each test has a set duration based on the exam format. A timer will be visible during the test, and it will auto-submit when time runs out." },
  { q: "How is my score calculated?", a: "Your score is calculated as the percentage of correct answers. Accuracy is calculated as (correct / (correct + incorrect)) x 100." },
  { q: "How do I change my password?", a: "Go to 'Settings' from the sidebar, click 'Change Password', enter your current and new password, then save." },
  { q: "Is my progress saved?", a: "Yes, all your test attempts, scores, and bookmarks are saved to your account and accessible from any device." },
]

export default function HelpPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("MEDIUM")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (!session?.user?.id) return
    fetch("/api/tickets")
      .then((r) => r.json())
      .then((data) => { if (data.success && Array.isArray(data.data)) setTickets(data.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [session?.user?.id])

  const handleSubmit = async () => {
    if (!subject || !description) {
      setError("Please fill in all required fields")
      return
    }
    setSubmitting(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, description, priority }),
      })
      if (!res.ok) throw new Error("Failed to create ticket")
      const result = await res.json()
      if (result.success) setTickets((prev) => [result.data, ...prev])
      setShowForm(false)
      setSubject("")
      setDescription("")
      setPriority("MEDIUM")
      setSuccess("Ticket created successfully")
      setTimeout(() => setSuccess(""), 4000)
    } catch {
      setError("Failed to create ticket. Please try again.")
    }
    setSubmitting(false)
  }

  const statusLabel = (s: string) => {
    const map: Record<string, string> = { OPEN: "Open", IN_PROGRESS: "In Progress", RESOLVED: "Resolved", CLOSED: "Closed" }
    return map[s] || s
  }

  const statusColor = (s: string) => {
    if (s === "RESOLVED" || s === "CLOSED") return "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
    if (s === "IN_PROGRESS") return "text-blue-400 border-blue-500/20 bg-blue-500/10"
    return "text-amber-400 border-amber-500/20 bg-amber-500/10"
  }

  return (
    <AppShell showRightPanel={false}>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Help & Support</h1>
          <p className="text-sm text-muted-foreground">Find answers and get help from the team</p>
        </div>

        {error && (
          <Alert variant="destructive" className="rounded-xl border-red-500/20 bg-red-500/10">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="rounded-xl border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* FAQ */}
        <div>
          <h2 className="text-lg font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-2xl border border-border bg-card transition-all hover:border-border/80"
              >
                <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-semibold">
                  <span className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-violet-400" />
                    {faq.q}
                  </span>
                  <span className="text-muted-foreground transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="border-t border-border px-6 py-4 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Support Tickets */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">Support Tickets</h2>
              <p className="text-sm text-muted-foreground">Track your requests to the support team</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="btn-gradient rounded-xl">
              {showForm ? "Cancel" : "New Ticket"}
            </Button>
          </div>

          {showForm && (
            <div className="rounded-2xl border border-border bg-card p-6 mb-4 space-y-4">
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary of your issue" />
              </div>
              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe your issue in detail..." />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v ?? "MEDIUM")}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSubmit} disabled={submitting} className="btn-gradient rounded-xl">
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit Ticket
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <Ticket className="mx-auto mb-3 h-10 w-10 text-violet-400/50" />
              <h3 className="font-semibold">No support tickets</h3>
              <p className="mt-1 text-sm text-muted-foreground">Create a ticket and our team will get back to you.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ticket.description}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-2">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", statusColor(ticket.status))}>
                        {statusLabel(ticket.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
