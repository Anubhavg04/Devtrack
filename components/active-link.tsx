"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, Target, BarChart2, Settings } from "lucide-react"

const icons = {
  "/dashboard": LayoutDashboard,
  "/topics": BookOpen,
  "/goals": Target,
  "/analytics": BarChart2,
  "/settings": Settings,
} as const

type Props = {
  href: string
  label: string
}

export function ActiveLink({ href, label }: Props) {
  const pathname = usePathname()
  const isActive = pathname === href
  const Icon = icons[href as keyof typeof icons]

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors
        ${isActive
          ? "bg-sidebar-accent text-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
        }
      `}
    >
      {Icon && <Icon size={15} />}
      {label}
    </Link>
  )
}

export function MobileNavLink({ href, label }: Props) {
  const pathname = usePathname()
  const isActive = pathname === href
  const Icon = icons[href as keyof typeof icons]

  return (
    <Link
      href={href}
      className={`
        flex-1 flex flex-col items-center gap-1 py-3 transition-colors
        ${isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
        }
      `}
    >
      {Icon && <Icon size={18} />}
      <span className={`text-xs font-mono ${isActive ? "font-medium" : ""}`}>
        {label}
      </span>
    </Link>
  )
}