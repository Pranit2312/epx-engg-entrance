"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Moon, Sun, Monitor, Bell, Mail, Trash2, KeyRound } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [testReminders, setTestReminders] = useState(true)

  const [passwordOpen, setPasswordOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" })
  const [deletePassword, setDeletePassword] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (!session?.user?.id) return
    const load = async () => {
      try {
        const res = await fetch("/api/settings")
        if (!res.ok) throw new Error("Failed to load settings")
        const result = await res.json()
        if (result.success) {
          setEmailNotifications(result.data.emailNotifications)
          setTestReminders(result.data.testReminders)
        }
      } catch {
        setError("Could not load settings.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [session])

  const saveNotifications = async (updates: { emailNotifications?: boolean; testReminders?: boolean }) => {
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error("Failed to save settings")
      setSuccess("Settings saved")
      setTimeout(() => setSuccess(""), 3000)
    } catch {
      setError("Failed to save settings")
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
    setPasswordLoading(true)
    try {
      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwordForm.current, newPassword: passwordForm.next }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error?.message || result.error || "Failed to change password")
      setPasswordOpen(false)
      setPasswordForm({ current: "", next: "", confirm: "" })
      setSuccess("Password updated successfully")
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteError("")
    setDeleteLoading(true)
    try {
      const res = await fetch("/api/profile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error?.message || result.error || "Failed to delete account")
      await signOut({ callbackUrl: "/" })
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete account")
    } finally {
      setDeleteLoading(false)
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

  const themeOptions = [
    { value: "light", label: "Light Mode", icon: Sun },
    { value: "dark", label: "Dark Mode", icon: Moon },
    { value: "system", label: "System Theme", icon: Monitor },
  ] as const

  return (
    <AppShell showRightPanel={false}>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Customize your EPX experience</p>
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

        {/* Appearance */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-1 font-semibold">Appearance</h2>
          <p className="mb-4 text-sm text-muted-foreground">Choose how EPX looks on your device</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {themeOptions.map((option) => {
              const Icon = option.icon
              const active = theme === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                    active
                      ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
                      : "border-border bg-card text-muted-foreground hover:border-border/80 hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{option.label}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Notifications */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-1 font-semibold">Notifications</h2>
          <p className="mb-4 text-sm text-muted-foreground">Manage how we keep you informed</p>
          <div className="space-y-4">
            <SettingRow
              icon={Mail}
              label="Email Notifications"
              description="Receive updates about your progress and new features"
            >
              <Switch
                checked={emailNotifications}
                onCheckedChange={(checked) => {
                  setEmailNotifications(checked)
                  saveNotifications({ emailNotifications: checked })
                }}
                disabled={saving}
              />
            </SettingRow>
            <SettingRow
              icon={Bell}
              label="Test Reminders"
              description="Get reminded to practice and complete mock tests"
            >
              <Switch
                checked={testReminders}
                onCheckedChange={(checked) => {
                  setTestReminders(checked)
                  saveNotifications({ testReminders: checked })
                }}
                disabled={saving}
              />
            </SettingRow>
          </div>
        </section>

        {/* Account */}
        <section id="account" className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-1 font-semibold">Account</h2>
          <p className="mb-4 text-sm text-muted-foreground">Manage your account security</p>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl border-border bg-muted sm:w-auto"
              onClick={() => setPasswordOpen(true)}
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Change Password
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:text-red-300 sm:w-auto"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </section>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="rounded-2xl border-border bg-popover sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Update your account password.</DialogDescription>
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

      {/* Delete Account Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="rounded-2xl border-border bg-popover sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete Account</DialogTitle>
            <DialogDescription>
              This action is permanent. All your data, test attempts, and progress will be deleted.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <Alert variant="destructive" className="rounded-xl border-red-500/20 bg-red-500/10">
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label>Enter your password to confirm</Label>
            <Input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={handleDeleteAccount}
              disabled={deleteLoading || !deletePassword}
            >
              {deleteLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}

function SettingRow({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.04] bg-card px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-violet-400" />
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}
