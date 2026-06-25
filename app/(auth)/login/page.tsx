"use client"

import { signIn } from "next-auth/react"
import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

function LoginForm() {
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [loadingCreds, setLoadingCreds] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const searchParams = useSearchParams()
  
  const registered = searchParams.get("registered")
  const reset = searchParams.get("reset")

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true)
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  const handleCredentialsLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoadingCreds(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })

    if (res?.error) {
      setError("Invalid email or password")
      setLoadingCreds(false)
    } else if (res?.ok) {
      window.location.href = "/dashboard"
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-sm mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
        <p className="text-sm text-muted-foreground">
          Sign in to continue tracking your developer journey
        </p>
      </div>

      {registered && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
          Account created successfully! Please sign in.
        </div>
      )}

      {reset && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
          Password reset successfully! Please sign in with your new password.
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleCredentialsLogin} className="flex flex-col gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Email</label>
          <input 
            name="email"
            type="email" 
            required
            className="w-full px-3 py-3 rounded-lg border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 hover:border-indigo-500/50 transition-all"
            placeholder="you@example.com"
          />
        </div>
        
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Password</label>
            <a href="/forgot-password" className="text-xs text-indigo-500 hover:text-indigo-400 hover:underline transition-colors">Forgot password?</a>
          </div>
          <div className="relative">
            <input 
              name="password"
              type={showPassword ? "text" : "password"} 
              required
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

        <div className="flex items-center gap-2 mt-1">
          <input 
            type="checkbox" 
            id="remember" 
            name="remember" 
            className="w-4 h-4 rounded border-border text-indigo-600 focus:ring-indigo-500/50 bg-background/50 cursor-pointer"
          />
          <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer select-none">
            Remember me for 30 days
          </label>
        </div>

        <button
          type="submit"
          disabled={loadingCreds || loadingGoogle}
          className="w-full mt-2 px-4 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 hover:scale-[1.02] transform transition-all duration-200 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
        >
          {loadingCreds ? "Signing in..." : "Sign in with Email"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground/70 font-medium">Or continue with</span>
        </div>
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loadingCreds || loadingGoogle}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border-2 border-border/40 bg-card hover:bg-accent hover:border-border transition-all text-sm font-semibold disabled:opacity-50 shadow-sm"
      >
        {loadingGoogle ? (
          <span className="font-mono text-xs text-muted-foreground">
            redirecting...
          </span>
        ) : (
          <>
            <GoogleIcon />
            <span className="text-foreground/90">Google</span>
          </>
        )}
      </button>

      <p className="text-center text-sm text-muted-foreground mt-2">
        Don't have an account?{" "}
        <a href="/register" className="font-semibold text-indigo-500 hover:text-indigo-400 hover:underline transition-colors">
          Sign up
        </a>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
    </svg>
  )
}