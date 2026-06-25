"use client"

import { useState } from "react"
import { requestPasswordReset } from "./actions"
import { CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await requestPasswordReset(formData)
    
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-sm mx-auto items-center text-center">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-2">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight">Check your email</h2>
          <p className="text-sm text-muted-foreground">
            If an account exists for that email, we have sent a secure password reset link.
          </p>
        </div>
        <a href="/login" className="w-full mt-4 px-4 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
          Return to login
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-sm mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Reset password</h2>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Email</label>
          <input 
            name="email"
            type="email" 
            required
            className="w-full px-3 py-3 rounded-lg border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 hover:border-indigo-500/50 transition-all"
            placeholder="your@email.com"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 px-4 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-2">
        Remember your password?{" "}
        <a href="/login" className="font-semibold text-indigo-500 hover:text-indigo-400 hover:underline transition-colors">
          Sign in
        </a>
      </p>
    </div>
  )
}
