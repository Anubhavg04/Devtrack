// "use client"

// import { useTheme } from "next-themes"
// import { useEffect, useState } from "react"
// import { Sun, Moon } from "lucide-react"

// export function ThemeToggle() {
//   const { theme, setTheme } = useTheme()
//   const [mounted, setMounted] = useState(false)

//   useEffect(() => setMounted(true), [])
//   if (!mounted) return (
//     <div className="w-8 h-8 rounded-lg border border-border bg-muted animate-pulse" />
//   )

//   const isDark = theme === "dark"

//   return (
//     <button
//       onClick={() => setTheme(isDark ? "light" : "dark")}
//       className="w-8 h-8 rounded-lg border border-border bg-muted hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground"
//       style={{ transition: "all 0.4s ease" }}
//       aria-label="Toggle theme"
//     >
//       <span style={{ transition: "transform 0.4s ease, opacity 0.3s ease" }}>
//         {isDark
//           ? <Sun size={14} />
//           : <Moon size={14} />
//         }
//       </span>
//     </button>
//   )
// }

"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return (
    <div className="w-8 h-8 rounded-lg border border-border bg-muted animate-pulse" />
  )

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-8 h-8 rounded-lg border border-border bg-muted hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  )
}