"use client"
import { useState } from "react"

export function ShareButton({ username }: { username: string }) {
  const [copied, setCopied] = useState(false)
  const url = `https://devtrackapp-orcin.vercel.app/u/${username}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border border-green-900 rounded-lg p-4 bg-green-950/20 flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <p className="text-xs text-green-600">$ share --profile</p>
        <p className="text-sm text-green-400 font-mono">{url}</p>
      </div>
      <button
        onClick={handleCopy}
        className="px-4 py-2 rounded-lg border border-green-800 text-green-400 text-sm font-mono hover:bg-green-900/40 transition-all"
      >
        {copied ? "✓ copied!" : "copy link"}
      </button>
    </div>
  )
}