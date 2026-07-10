"use client"

import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EXAM_OPTIONS, SUBJECT_OPTIONS, type UserProfile } from "@/lib/profile-types"
import {
  Camera,
  Loader2,
  Pencil,
  Target,
  TrendingUp,
  Award,
  Flame,
  Calendar,
  Mail,
  AtSign,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" })
  const [hasFetched, setHasFetched] = useState(false)

  const [form, setForm] = useState({
    name: "",
    username: "",
    bio: "",
    targetExam: "",
    preferredSubjects: [] as string[],
    image: null as string | null,
  })

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (!session?.user?.id || hasFetched) return
    const load = async () => {
      setHasFetched(true)
      try {
        const res = await fetch("/api/profile")
        if (!res.ok) throw new Error("Failed to load profile")
        const result = await res.json()
        if (!result.success) throw new Error(result.error?.message || "Failed to load profile")
        const data: UserProfile = result.data
        setProfile(data)
        setForm({
          name: data.name || "",
          username: data.username || "",
          bio: data.bio || "",
          targetExam: data.targetExam || "",
          preferredSubjects: data.preferredSubjects || [],
          image: data.image,
        })
      } catch {
        setError("Could not load your profile.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [session?.user?.id, hasFetched])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500_000) {
      setError("Image must be under 500KB")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setForm((prev) => ({ ...prev, image: reader.result as string }))
      setEditing(true)
      setError("")
    }
    reader.readAsDataURL(file)
  }

  const toggleSubject = (subject: string) => {
    setForm((prev) => ({
      ...prev,
      preferredSubjects: prev.preferredSubjects.includes(subject)
        ? prev.preferredSubjects.filter((s) => s !== subject)
        : [...prev.preferredSubjects, subject],
    }))
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          username: form.username,
          bio: form.bio,
          image: form.image,
          targetExam: form.targetExam || null,
          preferredSubjects: form.preferredSubjects,
        }),
      })
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.error?.message || "Failed to save")

      const { profile } = result.data
      setProfile(profile)
      setEditing(false)
      setSuccess("Profile updated successfully")
      await update({ name: profile.name, image: profile.image })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    setPasswordError("")
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError("New passwords do not match")
      return
    }
    if (passwordForm.next.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return
    }

    setPasswordLoading(true)
    try {
      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.next,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to change password")

      setPasswordOpen(false)
      setPasswordForm({ current: "", next: "", confirm: "" })
      setSuccess("Password changed successfully")
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password")
    } finally {
      setPasswordLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <AppShell showRightPanel={false}>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
        </div>
      </AppShell>
    )
  }

  if (!session) return null

  const safeProfile = profile || {
    id: session.user.id,
    email: session.user.email || "",
    name: null,
    username: null,
    image: null,
    bio: null,
    targetExam: null,
    preferredSubjects: [],
    emailNotifications: true,
    testReminders: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { testsAttempted: 0, averageScore: 0, averageAccuracy: 0, bestScore: 0, currentStreak: 0 },
  }
  const displayName = safeProfile.name || session.user.name || "Student"
  const initial = displayName.charAt(0).toUpperCase()
  const joinDate = new Date(safeProfile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const stats = safeProfile.stats
  const statCards = [
    { label: "Total Tests", value: stats.testsAttempted, icon: BookOpen },
    { label: "Accuracy", value: `${stats.averageAccuracy}%`, icon: Target },
    { label: "Current Streak", value: `${stats.currentStreak} days`, icon: Flame },
    { label: "Best Score", value: stats.bestScore > 0 ? `${stats.bestScore}%` : "—", icon: Award },
  ]

  return (
    <AppShell showRightPanel={false}>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your EPX account and academic preferences</p>
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

        {/* Profile Header */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative">
              <Avatar size="lg" className="size-20">
                {(editing ? form.image : safeProfile.image) ? (
                  <AvatarImage src={(editing ? form.image : safeProfile.image) || undefined} alt={displayName} />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-blue-600 text-2xl font-bold text-white">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-violet-600 text-white shadow-lg transition hover:bg-violet-500"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{displayName}</h2>
              <p className="text-sm text-muted-foreground">@{safeProfile.username || "username"}</p>
              {safeProfile.bio && !editing && <p className="mt-2 text-sm text-muted-foreground">{safeProfile.bio}</p>}
            </div>
            <div className="flex gap-2">
              {!editing ? (
                <Button
                  variant="outline"
                  className="rounded-xl border-border bg-muted"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="rounded-xl" onClick={() => {
                    setEditing(false)
                    setForm({
                      name: safeProfile.name || "",
                      username: safeProfile.username || "",
                      bio: safeProfile.bio || "",
                      targetExam: safeProfile.targetExam || "",
                      preferredSubjects: safeProfile.preferredSubjects || [],
                      image: safeProfile.image,
                    })
                  }}>
                    Cancel
                  </Button>
                  <Button className="btn-gradient rounded-xl" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="rounded-2xl border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <Icon className="h-4 w-4 text-violet-400" />
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            )
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* User Information */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold">User Information</h3>
            <div className="space-y-4">
              {editing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} />
                  </div>
                </>
              ) : (
                <>
                  <InfoRow icon={Mail} label="Email" value={safeProfile.email} />
                  <InfoRow icon={AtSign} label="Username" value={`@${safeProfile.username || "—"}`} />
                  <InfoRow icon={Calendar} label="Join Date" value={joinDate} />
                </>
              )}
            </div>
          </div>

          {/* Academic Information */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold">Academic Information</h3>
            <div className="space-y-4">
              {editing ? (
                <>
                  <div className="space-y-2">
                    <Label>Target Exam</Label>
                    <Select value={form.targetExam} onValueChange={(v) => setForm({ ...form, targetExam: v ?? "" })}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Select exam" /></SelectTrigger>
                      <SelectContent>
                        {EXAM_OPTIONS.map((exam) => (
                          <SelectItem key={exam.value} value={exam.value}>{exam.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Subjects</Label>
                    <div className="flex flex-wrap gap-2">
                      {SUBJECT_OPTIONS.map((subject) => (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => toggleSubject(subject)}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                            form.preferredSubjects.includes(subject)
                              ? "border-violet-500/30 bg-violet-500/15 text-violet-300"
                              : "border-border bg-muted text-muted-foreground hover:bg-muted/50"
                          )}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <InfoRow
                    icon={Target}
                    label="Target Exam"
                    value={EXAM_OPTIONS.find((e) => e.value === safeProfile.targetExam)?.label || "Not set"}
                  />
                  <InfoRow
                    icon={BookOpen}
                    label="Preferred Subjects"
                    value={safeProfile.preferredSubjects?.length > 0 ? safeProfile.preferredSubjects.join(", ") : "Not set"}
                  />
                  <InfoRow icon={TrendingUp} label="Tests Attempted" value={String(stats.testsAttempted)} />
                  <InfoRow icon={Award} label="Average Score" value={`${stats.averageScore}%`} />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold">Account Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-xl border-border" onClick={() => setPasswordOpen(true)}>
              Change Password
            </Button>
            {editing && (
              <Button className="btn-gradient rounded-xl" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="rounded-2xl border-border bg-popover sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
          </DialogHeader>
          {passwordError && (
            <Alert variant="destructive" className="rounded-xl border-red-500/20 bg-red-500/10">
              <AlertDescription>{passwordError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={passwordForm.next} onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setPasswordOpen(false)}>Cancel</Button>
            <Button className="btn-gradient rounded-xl" onClick={handlePasswordChange} disabled={passwordLoading}>
              {passwordLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-card px-3 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-violet-400" />
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
