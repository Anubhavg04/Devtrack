"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"

interface ShareButtonProps {
  platform: "copy" | "twitter" | "linkedin"
  path: string
  className?: string
  children: React.ReactNode
}

export function ShareButton({ platform, path, className, children }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [fullUrl, setFullUrl] = useState("")

  useEffect(() => {
    // Safely get the origin on the client side
    setFullUrl(`${window.location.origin}${path}`)
  }, [path])

  const handleShare = async () => {
    if (!fullUrl) return

    if (platform === "copy") {
      try {
        await navigator.clipboard.writeText(fullUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error("Failed to copy text: ", err)
      }
      return
    }

    const text = encodeURIComponent("Check out my developer learning progress and stats on DevTrack! 🚀")
    const url = encodeURIComponent(fullUrl)
    
    let shareUrl = ""
    if (platform === "twitter") {
      shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
    } else if (platform === "linkedin") {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400")
    }
  }

  return (
    <button onClick={handleShare} className={className}>
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-green-500">Copied!</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

export function ShareLinkDisplay({ path }: { path: string }) {
  const [fullUrl, setFullUrl] = useState("")

  useEffect(() => {
    setFullUrl(`${window.location.origin}${path}`)
  }, [path])

  return (
    <div className="flex-1 bg-muted px-4 py-3 rounded-lg border border-border font-mono text-sm overflow-x-auto whitespace-nowrap">
      {fullUrl || `...${path}`}
    </div>
  )
}
