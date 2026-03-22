"use client"

import { useState } from "react"
import { handleGoogleLogin } from "./action"
import { BookOpen } from "lucide-react"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">

      {/* Subtle grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, oklch(0.5 0 0 / 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, oklch(0.5 0 0 / 0.07) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative w-full max-w-sm flex flex-col gap-8">

        {/* Brand */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl border border-border bg-card flex items-center justify-center">
            <BookOpen size={18} className="text-muted-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold tracking-tight">
              dev<span className="text-muted-foreground">track</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              your learning journal
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="border border-border rounded-2xl bg-card p-8 flex flex-col gap-6 shadow-xl">
          <div className="text-center">
            <h2 className="font-semibold text-base">Welcome back</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Sign in to continue tracking
            </p>
          </div>

          <form
            action={async () => {
              setLoading(true)
              await handleGoogleLogin()
            }}
          >
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border bg-background hover:bg-accent transition-colors text-sm font-medium disabled:opacity-50"
            >
              {loading ? (
                <span className="font-mono text-xs text-muted-foreground">
                  redirecting...
                </span>
              ) : (
                <>
                  <GoogleIcon />
                  Continue with Google
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree to our{" "}
            <span className="underline underline-offset-2 cursor-pointer">
              terms
            </span>
          </p>
        </div>

        {/* Back */}
        <p className="text-center text-xs text-muted-foreground font-mono">
          <a href="/" className="hover:text-foreground transition-colors">
            ← back to home
          </a>
        </p>

      </div>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
    </svg>
  )
}