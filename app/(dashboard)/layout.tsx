import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { signOut } from "@/auth"
import { ThemeToggle } from "@/components/theme-toggle"
import { LayoutDashboard, BookOpen, Target, BarChart2, LogOut } from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="min-h-screen flex bg-background">

      {/* Sidebar */}
      <aside className="w-60 border-r border-border flex flex-col bg-sidebar">

        {/* Logo + toggle */}
        <div className="px-5 py-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-muted-foreground" />
            <span className="font-mono font-semibold text-sm tracking-tight">
              dev<span className="text-muted-foreground">track</span>
            </span>
          </div>
          <ThemeToggle />
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 flex flex-col gap-0.5">
          {[
            { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/topics", label: "Topics", icon: BookOpen },
            { href: "/goals", label: "Goals", icon: Target },
            { href: "/analytics", label: "Analytics", icon: BarChart2 },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            >
              <item.icon size={15} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User */}
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
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/" })
            }}
          >
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

      {/* Content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>

    </div>
  )
}