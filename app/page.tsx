import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { DemoPreview } from "@/components/demo-preview"
import {
  BookOpen,
  GitCommit,
  Target,
  ArrowRight,
  Flame,
  Circle,
} from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background overflow-hidden">

      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, oklch(0.5 0 0 / 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, oklch(0.5 0 0 / 0.07) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Navbar */}
      <nav className="relative z-10 max-w-6xl mx-auto flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-muted-foreground" />
            <span className="text-xl font-medium tracking-tight">
              Dev<span className="text-muted-foreground">track</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild className="text-xs font-normal">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild className="text-xs font-medium">
              <Link href="/login">Get started →</Link>
            </Button>
          </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[85vh]">

        {/* Left */}
        <div className="flex flex-col gap-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 text-xs text-muted-foreground font-mono w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Created for developers by a developer
          </div>

          <div>
          <h1 className="text-5xl sm:text-6xl font-light tracking-tight leading-[1.08] mb-5">
                Every hour
                <br />
                you study
                <br />
                <span className="text-muted-foreground font-light">counts.</span>
          </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-md">
              DevTrack is a learning journal for developers.
              Log sessions, track topics, build streaks.
              See a year of growth in one view.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button size="lg" asChild className="text-sm font-medium gap-2">
              <Link href="/login">
                Start tracking
                <ArrowRight size={14} />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-sm font-normal">
              <Link href="#features">See features</Link>
            </Button>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
            <span className="flex items-center gap-1.5">
              <Flame size={12} className="text-orange-400" />
              streak tracking
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <GitCommit size={12} />
              activity heatmap
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <Target size={12} />
              goal setting
            </span>
          </div>
        </div>

        {/* Right — browser mockup */}
        <div className="relative hidden lg:flex items-center justify-center">

          {/* Glow behind mockup */}
          <div
            className="absolute w-80 h-80 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, oklch(0.7 0 0 / 0.06) 0%, transparent 70%)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Browser window */}
          <div className="w-full max-w-lg border border-border rounded-xl overflow-hidden bg-card shadow-2xl">

            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                <div className="w-3 h-3 rounded-full bg-green-400/70" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-background border border-border rounded-md px-3 py-1 text-xs text-muted-foreground font-mono text-center">
                  devtrack.app/dashboard
                </div>
              </div>
            </div>

            {/* App UI inside browser */}
            <div className="flex h-72">

              {/* Mini sidebar */}
              <div className="w-36 border-r border-border bg-sidebar p-3 flex flex-col gap-1">
                <div className="px-2 py-1.5 rounded-md bg-sidebar-accent flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-foreground/20" />
                  <span className="text-xs font-mono text-foreground">Dashboard</span>
                </div>
                {["Topics", "Goals"].map((item) => (
                  <div key={item} className="px-2 py-1.5 rounded-md flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-foreground/10" />
                    <span className="text-xs font-mono text-muted-foreground">{item}</span>
                  </div>
                ))}
                <div className="mt-auto pt-3 border-t border-border">
                  <div className="flex items-center gap-2 px-2 py-1">
                    <div className="w-5 h-5 rounded-full bg-muted" />
                    <div className="flex flex-col gap-0.5">
                      <div className="w-12 h-1.5 rounded-full bg-foreground/20" />
                      <div className="w-16 h-1 rounded-full bg-foreground/10" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden">

                {/* Greeting */}
                <div>
                  <div className="w-40 h-3 rounded-full bg-foreground/20 mb-1.5" />
                  <div className="w-28 h-2 rounded-full bg-foreground/10" />
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "12", label: "Topics" },
                    { value: "8", label: "Goals" },
                    { value: "47h", label: "Logged" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="border border-border rounded-lg p-2 bg-background"
                    >
                      <div className="text-sm font-bold font-mono">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Heatmap preview */}
                <div className="border border-border rounded-lg p-3 bg-background flex-1">
                  <div className="text-xs font-mono text-muted-foreground mb-2">
                    Learning activity
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 26 }).map((_, wi) => (
                      <div key={wi} className="flex flex-col gap-0.5">
                        {Array.from({ length: 7 }).map((_, di) => {
                          const rand = Math.random()
                          const opacity = rand > 0.65
                            ? rand > 0.85
                              ? "opacity-90"
                              : "opacity-50"
                            : "opacity-[0.07]"
                          return (
                            <div
                              key={di}
                              className={`w-2 h-2 rounded-sm bg-foreground ${opacity}`}
                            />
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            see it in action
          </span>
          <h2 className="text-3xl font-semibold tracking-tight mt-3">
            Your learning, visualized.
          </h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
            Click through the tabs to explore. Sign up to start tracking your own progress.
          </p>
        </div>
        <DemoPreview />
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="border-t border-border" />
      </div>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="mb-12">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            features
          </span>
          <h2 className="text-3xl font-semibold tracking-tight mt-3">
            Everything a developer needs.
            <br />
            <span className="text-muted-foreground">Nothing they don't.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="border border-border rounded-xl p-6 flex flex-col gap-4 bg-card hover:bg-accent transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                <f.icon size={16} />
              </div>
              <div>
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  {f.tag}
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="border-t border-border" />
      </div>

      {/* CTA */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="border border-border rounded-xl p-12 flex flex-col items-center text-center gap-6 bg-card">
          <div className="w-10 h-10 rounded-xl border border-border flex items-center justify-center">
            <BookOpen size={18} className="text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight mb-3">
              Start your learning journal.
            </h2>
            <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
              Free forever. No credit card. Just you, your topics,
              and a year of progress waiting to be filled in.
            </p>
          </div>
          <Button size="lg" asChild className="text-sm font-medium gap-2">
            <Link href="/login">
              Create free account
              <ArrowRight size={14} />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between text-xs text-muted-foreground font-mono">
          <div className="flex items-center gap-2">
            <BookOpen size={12} />
            <span>Devtrack</span>
          </div>
          <span>Built with ❤️ by @Anubhav · {new Date().getFullYear()}</span>
        </div>
      </footer>

    </main>
  )
}

const features = [
  {
    tag: "01 / track",
    title: "Log every session",
    icon: BookOpen,
    description:
      "Add topics and log time per session. Watch hours accumulate. See exactly what you've invested in each skill.",
  },
  {
    tag: "02 / visualize",
    title: "Activity heatmap",
    icon: GitCommit,
    description:
      "A full year grid like GitHub's contribution graph. Every square is a day you showed up and put in the work.",
  },
  {
    tag: "03 / focus",
    title: "Goals and streaks",
    icon: Target,
    description:
      "Set learning goals. Track streaks. The streak counter alone will make you open the app every single day.",
  },
]