"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navbar } from "@/components/navbar"
import { EpxLogo } from "@/components/epx-logo"
import { ArrowLeft, ArrowRight, Loader2, Lock, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((previous) => ({ ...previous, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setMessage("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      })
      const result = await response.json()

      if (!response.ok || !result.success) {
        setError(result.error?.message || "Unable to reset password")
        return
      }

      setMessage("Your password has been reset. You can now sign in with your new password.")
      setFormData({ email: "", password: "", confirmPassword: "" })
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-blue-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[20%] w-[30%] h-[30%] bg-purple-500/8 rounded-full blur-[100px]" />
      </div>
      <Navbar />
      <div className="relative flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center"><EpxLogo size="lg" /></div>
            <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
            <p className="mt-2 text-sm text-muted-foreground">Enter your account email and choose a new password</p>
          </div>

          <div className="card-premium p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <Alert variant="destructive" className="rounded-xl border-red-500/20 bg-red-500/10"><AlertDescription className="text-sm">{error}</AlertDescription></Alert>}
              {message && <Alert className="rounded-xl border-green-500/20 bg-green-500/10"><AlertDescription className="text-sm">{message}</AlertDescription></Alert>}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="email" name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required disabled={isLoading} className="pl-10 h-11" /></div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required disabled={isLoading} className="pl-10 h-11" /></div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required disabled={isLoading} className="pl-10 h-11" /></div>
              </div>

              <Button type="submit" className="w-full btn-gradient h-11 text-base" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resetting...</> : <>Reset password<ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <Link href="/login" className="text-primary hover:underline font-medium"><ArrowLeft className="mr-1 inline h-4 w-4" />Back to sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}