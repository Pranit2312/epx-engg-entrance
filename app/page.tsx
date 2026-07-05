import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { ArrowRight, BookOpen, Clock3, Sparkles, Target, TrendingUp, Users, Zap, ChevronRight } from "lucide-react"

const features = [
  { icon: BookOpen, title: "Adaptive practice", description: "Switch between full-length mocks and quick revision sets with a single tap.", gradient: "from-blue-500 to-cyan-500" },
  { icon: Clock3, title: "Real exam simulation", description: "Timed sessions, review flags, and instant result summaries keep you exam-ready.", gradient: "from-purple-500 to-pink-500" },
  { icon: TrendingUp, title: "Actionable analytics", description: "Track scores, accuracy, and preparation streaks in a premium dashboard.", gradient: "from-amber-500 to-orange-500" },
  { icon: Target, title: "Focused prep", description: "Choose by exam, subject, difficulty, and topic so every session is intentional.", gradient: "from-green-500 to-emerald-500" },
  { icon: Sparkles, title: "Modern UX", description: "A polished platform designed to feel as premium as the best coaching products.", gradient: "from-violet-500 to-purple-500" },
  { icon: Users, title: "Community-driven", description: "A clean, distraction-free interface that supports serious daily practice.", gradient: "from-rose-500 to-pink-500" },
]

const stats = [
  { value: "10K+", label: "Questions" },
  { value: "500+", label: "Mocks" },
  { value: "50K+", label: "Students" },
]

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[20%] w-[30%] h-[30%] bg-cyan-500/8 rounded-full blur-[100px]" />
      </div>
      <Navbar />

      <section className="relative flex flex-1 items-center section-spacing">
        <div className="section-container">
          <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400">
                <Sparkles className="h-3.5 w-3.5" />
                Engineering Preparation eXperience
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
                Practice smarter and{" "}
                <span className="text-gradient">score higher</span>
                <br />
                with EPX.
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
                EPX is your AI-powered engineering exam preparation platform — immersive mock tests, live progress insights, and polished study workflows.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/register">
                  <Button size="lg" className="btn-gradient px-8 h-11 text-base">
                    Create account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/tests">
                  <Button size="lg" variant="outline" className="h-11 text-base rounded-xl border-border/80 bg-muted hover:bg-muted/50">
                    Browse tests
                  </Button>
                </Link>
              </div>
              <div className="flex gap-8 pt-4">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-60" />
              <div className="relative glass rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-violet-500/10" />
                <div className="relative p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Today&apos;s focus</p>
                        <p className="font-semibold">JEE Main full mock</p>
                      </div>
                    </div>
                    <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">Ready</div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 mb-6">
                    {[
                      { label: "Duration", value: "180 mins" },
                      { label: "Questions", value: "90" },
                      { label: "Difficulty", value: "Medium" },
                    ].map((entry) => (
                      <div key={entry.label} className="rounded-xl border border-border bg-card px-4 py-3">
                        <div className="text-xs text-muted-foreground mb-1">{entry.label}</div>
                        <div className="font-semibold">{entry.value}</div>
                      </div>
                    ))}
                  </div>
                  <Link href="/tests">
                    <Button className="w-full btn-gradient h-10">Start this mock</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing border-t border-border">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="section-title">Everything you need to train like a top performer</h2>
            <p className="section-subtitle mx-auto">A polished, distraction-free experience designed for daily exam preparation.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="group card-premium p-6">
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} bg-opacity-20`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mt-5 font-semibold text-lg">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
