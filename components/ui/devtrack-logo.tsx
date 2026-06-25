import React from "react"

export function DevTrackLogo({ className = "", text = "DevTrack" }: { className?: string, text?: string }) {
  return (
    <span 
      className={`font-extrabold tracking-tight bg-gradient-to-r from-foreground via-indigo-400 to-foreground bg-clip-text text-transparent ${className}`}
      style={{ fontFamily: "'Clash Grotesk', sans-serif" }}
    >
      {text}
    </span>
  )
}
