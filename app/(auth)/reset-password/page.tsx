"use client"

import { useState, Suspense } from "react"
import { resetPassword } from "./actions"
import { useSearchParams } from "next/navigation"
import { Check, X, Eye, EyeOff } from "lucide-react"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const rules = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "One lowercase letter", valid: /[a-z]/.test(password) },
    { label: "One number", valid: /[0-9]/.test(password) },
    { label: "One special character", valid: /[^a-zA-Z0-9]/.test(password) },
  ]
  
  const passwordsMatch = password && confirmPassword && password === confirmPassword
  const allRulesValid = rules.every(r => r.valid) && passwordsMatch

  if (!token) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-sm mx-auto items-center text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-2">
          <X className="w-8 h-8 text-destructive" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight">Invalid Link</h2>
          <p className="text-sm text-muted-foreground">
            This password reset link is invalid or missing the token.
          </p>
        </div>
        <a href="/forgot-password" className="w-full mt-4 px-4 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
          Request new link
        </a>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!allRulesValid) return

    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    // Manually append the token since it's in the URL, not the form
    formData.append("token", token)
    
    const result = await resetPassword(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-sm mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Set new password</h2>
        <p className="text-sm text-muted-foreground">
          Your new password must be different from previously used passwords.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">New Password</label>
          <div className="relative">
            <input 
              name="password"
              type={showPassword ? "text" : "password"} 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-3 pr-10 rounded-lg border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 hover:border-indigo-500/50 transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Password Strength UI */}
        {password.length > 0 && (
          <div className="grid grid-cols-1 gap-1.5 py-1">
            {rules.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                {rule.valid ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <X size={14} className="text-muted-foreground/50" />
                )}
                <span className={rule.valid ? "text-foreground font-medium" : "text-muted-foreground"}>
                  {rule.label}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Confirm New Password</label>
          <div className="relative">
            <input 
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"} 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-3 pr-10 rounded-lg border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 hover:border-indigo-500/50 transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {confirmPassword.length > 0 && (
            <div className={`text-xs mt-1.5 flex items-center gap-1 font-medium ${passwordsMatch ? "text-green-500" : "text-destructive"}`}>
              {passwordsMatch ? <Check size={12} /> : <X size={12} />}
              {passwordsMatch ? "Passwords match" : "Passwords do not match"}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !allRulesValid}
          className="w-full mt-2 px-4 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 hover:scale-[1.02] transform transition-all duration-200 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
