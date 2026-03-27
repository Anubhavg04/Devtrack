import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { signOut } from "@/auth"
import { ThemeToggle } from "@/components/theme-toggle"
import { BookOpen, LogOut } from "lucide-react"
import { ActiveLink, MobileNavLink } from "@/components/active-link"

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/topics", label: "Topics" },
  { href: "/goals", label: "Goals" },
  { href: "/analytics", label: "Analytics" },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

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
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt="avatar"
                className="w-7 h-7 rounded-full"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-mono">
                {session.user?.name?.[0]}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">
                {session.user?.name}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {session.user?.email}
              </span>
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

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 border-b border-border bg-sidebar flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <BookOpen size={15} className="text-muted-foreground" />
          <span className="font-mono font-semibold text-sm tracking-tight">
            dev<span className="text-muted-foreground">track</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt="avatar"
              className="w-7 h-7 rounded-full"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-mono">
              {session.user?.name?.[0]}
            </div>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="md:ml-60 pb-20 md:pb-0">
        <div className="pt-16 md:pt-0 p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-sidebar">
        <div className="flex items-center">
          {navItems.map((item) => (
            <MobileNavLink
              key={item.href}
              href={item.href}
              label={item.label}
            />
          ))}
          <form
            className="flex-1"
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/" })
            }}
          >
            <button
              type="submit"
              className="w-full flex flex-col items-center gap-1 py-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut size={18} />
              <span className="text-xs font-mono">out</span>
            </button>
          </form>
        </div>
      </nav>

    </div>
  )
} 