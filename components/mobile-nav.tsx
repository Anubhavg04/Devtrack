"use client"

import { useState } from "react"
import { BookOpen, LogOut, Menu, X } from "lucide-react"
import { UserAvatar } from "./user-avatar"
import { ThemeToggle } from "./theme-toggle"
import { ActiveLink, MobileNavLink } from "./active-link"
import { signOut } from "next-auth/react"

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/focus", label: "Focus Timer" },
  { href: "/topics", label: "Topics" },
  { href: "/goals", label: "Goals" },
  { href: "/analytics", label: "Analytics" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/feed", label: "Live Feed" },
  { href: "/share", label: "Share Profile" },
  { href: "/settings", label: "Settings" },
]

// Primary items for the bottom tab bar (max 4-5)
const primaryNav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/focus", label: "Focus" },
  { href: "/goals", label: "Goals" },
  { href: "/feed", label: "Feed" },
]

// Secondary items for the hamburger menu
const secondaryNav = navItems.filter(item => !primaryNav.find(p => p.href === item.href))

interface MobileNavProps {
  user: any
}

export function MobileNav({ user }: MobileNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-border bg-sidebar flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <BookOpen size={15} className="text-muted-foreground" />
          <span className="font-mono font-semibold text-sm tracking-tight">
            dev<span className="text-muted-foreground">track</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <UserAvatar 
            avatar={user.avatar} 
            name={user.username || user.name} 
            image={user.image} 
            size={28} 
          />
          <ThemeToggle />
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 -mr-1.5 text-muted-foreground hover:text-foreground rounded-md bg-accent/50"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Full screen menu overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[60px] bottom-[64px] z-40 bg-background flex flex-col overflow-y-auto">
          <nav className="flex-1 p-4 flex flex-col gap-1">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 px-3">
              Menu
            </div>
            {secondaryNav.map((item) => (
              <ActiveLink
                key={item.href}
                href={item.href}
                label={item.label}
              />
            ))}
            
            <div className="mt-8 pt-4 border-t border-border">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Mobile bottom nav (Primary items only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-sidebar pb-safe">
        <div className="flex items-center justify-around px-2">
          {primaryNav.map((item) => (
            <div key={item.href} className="flex-1 max-w-[80px]">
              <MobileNavLink
                href={item.href}
                label={item.label}
              />
            </div>
          ))}
        </div>
      </nav>
    </>
  )
}
