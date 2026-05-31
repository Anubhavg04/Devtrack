import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { signOut } from "@/auth"
import { ThemeToggle } from "@/components/theme-toggle"
import { BookOpen, LogOut } from "lucide-react"
import { ActiveLink } from "@/components/active-link"
import { MobileNav } from "@/components/mobile-nav"
import { getCurrentUser } from "@/lib/getUser"
import { UserAvatar } from "@/components/user-avatar"

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

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return (
    <div className="min-h-screen bg-background">

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-60 border-r border-border flex-col bg-sidebar z-40">

        <div className="px-5 py-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-muted-foreground" />
            <span className="font-mono font-semibold text-sm tracking-tight">
              dev<span className="text-muted-foreground">track</span>
            </span>
          </div>
          <ThemeToggle />
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-0.5">
          {navItems.map((item) => (
            <ActiveLink
              key={item.href}
              href={item.href}
              label={item.label}
            />
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <UserAvatar 
              avatar={user.avatar} 
              name={user.username || user.name} 
              image={user.image} 
              size={28} 
            />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">
                {user.displayName ?? user.name ?? "Profile"}
              </span>
              {user.username ? (
                <span className="text-xs text-muted-foreground truncate">
                  @{user.username}
                </span>
              ) : null}
            </div>
          </div>
          <form action={async () => {
            "use server"
            await signOut({ redirectTo: "/" })
          }}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground font-mono text-xs gap-2"
              type="submit"
            >
              <LogOut size={12} />
              sign out
            </Button>
          </form>
        </div>

      </aside>

      <MobileNav user={user} />

      {/* Main content */}
      <main className="md:ml-60 pb-20 md:pb-0">
        <div className="pt-16 md:pt-0 p-4 md:p-8">
          {children}
        </div>
      </main>

    </div>
  )
} 