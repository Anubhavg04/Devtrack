"use client"

import { useState } from "react"
import { BookOpen, Target, CheckCircle2, BarChart2, LayoutDashboard } from "lucide-react"
import { format, subDays, startOfDay } from "date-fns"

// Sample data — hardcoded, no database needed
const sampleTopics = [
  { id: "1", title: "Next.js", sessions: 12, minutes: 340 },
  { id: "2", title: "TypeScript", sessions: 8, minutes: 210 },
  { id: "3", title: "System Design", sessions: 5, minutes: 180 },
  { id: "4", title: "DSA", sessions: 15, minutes: 420 },
]

const sampleGoals = [
  { id: "1", title: "Build a full-stack SaaS", completed: true },
  { id: "2", title: "Learn TypeScript deeply", completed: true },
  { id: "3", title: "Solve 500 DSA problems", completed: false },
  { id: "4", title: "Deploy 3 projects", completed: false },
]

// Generate fake heatmap data
function generateHeatmapData() {
  const data: Record<string, number> = {}
  const today = startOfDay(new Date())

  // Create realistic-looking activity pattern
  const activeDays = [0, 1, 2, 4, 5, 7, 8, 9, 11, 14, 15, 16,
    18, 19, 21, 22, 25, 26, 27, 28, 30, 31, 33, 35, 36, 38,
    40, 41, 42, 45, 47, 48, 50, 52, 53, 55, 56, 58, 60, 61]

  activeDays.forEach((daysAgo) => {
    const date = format(subDays(today, daysAgo), "yyyy-MM-dd")
    const activityValues = [45,90,30,110,75,55,120,40,85,60,95,25,70,100,35,80,50,115,65,88,42,78,55,92,38,68,105,48,82,72,58,95,44,76,62,98,52,84,66,110]
    const index = activeDays.indexOf(daysAgo)
    data[date] = activityValues[index] || 60
  })

  return data
}

const heatmapData = generateHeatmapData()

type Tab = "dashboard" | "topics" | "goals" | "analytics"

export function DemoPreview() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")

  const tabs = [
    { id: "dashboard" as Tab, label: "Dashboard", icon: LayoutDashboard },
    { id: "topics" as Tab, label: "Topics", icon: BookOpen },
    { id: "goals" as Tab, label: "Goals", icon: Target },
    { id: "analytics" as Tab, label: "Analytics", icon: BarChart2 },
  ]

  return (
    <div className="w-full max-w-5xl mx-auto">

      {/* Browser chrome */}
      <div className="border border-border rounded-2xl overflow-hidden shadow-2xl bg-card">

        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
            <div className="w-3 h-3 rounded-full bg-green-400/70" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-background border border-border rounded-md px-3 py-1 text-xs text-muted-foreground font-mono text-center max-w-xs mx-auto">
              devtrackapp-orcin.vercel.app/dashboard
            </div>
          </div>
          <div className="text-xs text-muted-foreground font-mono bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">
            live demo
          </div>
        </div>

        {/* App layout */}
        <div className="flex h-[520px]">

          {/* Sidebar */}
          <div className="w-48 border-r border-border bg-sidebar flex flex-col">
            <div className="px-4 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-muted-foreground" />
                <span className="font-mono font-semibold text-sm">
                  dev<span className="text-muted-foreground">track</span>
                </span>
              </div>
            </div>

            <nav className="flex-1 p-2 flex flex-col gap-0.5 pt-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2.5 px-3 py-2 rounded-md text-sm
                    transition-colors w-full text-left
                    ${activeTab === tab.id
                      ? "bg-sidebar-accent text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                    }
                  `}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Fake user */}
            <div className="p-3 border-t border-border">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  A
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium truncate">Anubhav</span>
                  <span className="text-xs text-muted-foreground truncate">demo user</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-auto bg-background">
            {activeTab === "dashboard" && <DemoDashboard />}
            {activeTab === "topics" && <DemoTopics />}
            {activeTab === "goals" && <DemoGoals />}
            {activeTab === "analytics" && <DemoAnalytics />}
          </div>
        </div>
      </div>

      {/* CTA below demo */}
      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground mb-3">
          This is a live preview — your real dashboard will show your actual data
        </p>
      </div>
    </div>
  )
}

// Dashboard tab
function DemoDashboard() {
  const today = startOfDay(new Date())
  const weeks: Array<Array<{ date: string; minutes: number }>> = []
  let currentWeek: Array<{ date: string; minutes: number }> = []

  for (let i = 63; i >= 0; i--) {
    const date = format(subDays(today, i), "yyyy-MM-dd")
    const minutes = heatmapData[date] || 0
    currentWeek.push({ date, minutes })
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }
  if (currentWeek.length > 0) weeks.push(currentWeek)

  const maxMinutes = Math.max(...Object.values(heatmapData), 1)

  function getDotStyle(minutes: number) {
    if (!minutes) return { bg: "var(--dot-empty)", shadow: "none" }
    const ratio = minutes / maxMinutes
    if (ratio < 0.25) return { bg: "var(--dot-l1)", shadow: "0 0 4px var(--dot-l1-glow)" }
    if (ratio < 0.5) return { bg: "var(--dot-l2)", shadow: "0 0 6px var(--dot-l2-glow)" }
    if (ratio < 0.75) return { bg: "var(--dot-l3)", shadow: "0 0 8px var(--dot-l3-glow)" }
    return { bg: "var(--dot-l4)", shadow: "0 0 12px var(--dot-l4-glow)" }
  }

  return (
    <>
      <style>{`
        :root {
          --dot-empty: oklch(0.85 0 0);
          --dot-l1: oklch(0.65 0.12 145);
          --dot-l1-glow: oklch(0.65 0.12 145 / 0.3);
          --dot-l2: oklch(0.55 0.16 145);
          --dot-l2-glow: oklch(0.55 0.16 145 / 0.4);
          --dot-l3: oklch(0.45 0.18 145);
          --dot-l3-glow: oklch(0.45 0.18 145 / 0.5);
          --dot-l4: oklch(0.38 0.2 145);
          --dot-l4-glow: oklch(0.38 0.2 145 / 0.6);
        }
        .dark {
          --dot-empty: oklch(0.25 0 0);
          --dot-l1: oklch(0.45 0.14 145);
          --dot-l1-glow: oklch(0.55 0.14 145 / 0.4);
          --dot-l2: oklch(0.55 0.18 145);
          --dot-l2-glow: oklch(0.6 0.18 145 / 0.5);
          --dot-l3: oklch(0.65 0.2 145);
          --dot-l3-glow: oklch(0.65 0.2 145 / 0.6);
          --dot-l4: oklch(0.75 0.22 145);
          --dot-l4-glow: oklch(0.75 0.22 145 / 0.8);
        }
      `}</style>
      <div className="p-5 flex flex-col gap-5">

        <div>
          <h1 className="text-lg font-semibold tracking-tight">Welcome back, Anubhav 👋</h1>
          <p className="text-muted-foreground text-xs mt-0.5">Here is your learning overview</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: BookOpen, label: "Topics", value: "4", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
            { icon: Target, label: "Goals", value: "4", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
            { icon: CheckCircle2, label: "Completed", value: "2", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
          ].map((stat) => (
            <div key={stat.label} className="border border-border rounded-xl p-3 bg-card flex flex-col gap-2">
              <div className={`w-7 h-7 rounded-lg ${stat.bg} border ${stat.border} flex items-center justify-center`}>
                <stat.icon size={13} className={stat.color} />
              </div>
              <div>
                <div className="text-2xl font-semibold font-mono">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Mini heatmap */}
        <div className="border border-border rounded-xl p-4 bg-card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-medium">Learning activity</h2>
              <p className="text-xs text-muted-foreground">Last 9 weeks</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
              <span>40 active days</span>
              <span>19h total</span>
              <span>3 🔥</span>
            </div>
          </div>
          <div className="flex gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day) => {
                  const style = getDotStyle(day.minutes)
                  return (
                    <div
                      key={day.date}
                      className="w-2.5 h-2.5 rounded-full transition-all hover:scale-125 cursor-pointer"
                      style={{ backgroundColor: style.bg, boxShadow: style.shadow }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Recent topics preview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-border rounded-xl p-3 bg-card">
            <h3 className="text-xs font-medium mb-2">Recent topics</h3>
            <div className="flex flex-col gap-1.5">
              {sampleTopics.slice(0, 3).map((t) => (
                <div key={t.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-xs">{t.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {Math.floor(t.minutes / 60)}h {t.minutes % 60}m
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-border rounded-xl p-3 bg-card">
            <h3 className="text-xs font-medium mb-2">Active goals</h3>
            <div className="flex flex-col gap-1.5">
              {sampleGoals.filter(g => !g.completed).map((g) => (
                <div key={g.id} className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded border-2 border-border flex-shrink-0" />
                  <span className="text-xs truncate">{g.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

// Topics tab
function DemoTopics() {
  return (
    <div className="p-5 flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Topics</h1>
        <p className="text-muted-foreground text-xs mt-0.5">Track everything you are learning</p>
      </div>

      <div className="border border-border rounded-xl p-4 bg-card">
        <h2 className="text-xs font-medium mb-3">Add a new topic</h2>
        <div className="flex gap-2">
          <div className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-xs text-muted-foreground">
            Topic name e.g. Next.js, TypeScript...
          </div>
          <div className="px-3 py-2 rounded-lg bg-foreground text-background text-xs font-medium">
            Add topic
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {sampleTopics.map((topic) => {
          const hours = Math.floor(topic.minutes / 60)
          const mins = topic.minutes % 60
          return (
            <div key={topic.id} className="border border-border rounded-xl p-4 bg-card flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">{topic.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                    {hours}h {mins}m total · {topic.sessions} sessions
                  </p>
                </div>
                <span className="text-xs text-muted-foreground border border-border rounded-md px-2 py-1">
                  Delete
                </span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <div className="w-24 px-2 py-1.5 rounded-lg border border-border bg-background text-xs text-muted-foreground">
                  Minutes...
                </div>
                <div className="flex-1 px-2 py-1.5 rounded-lg border border-border bg-background text-xs text-muted-foreground">
                  What did you study?
                </div>
                <div className="px-2 py-1.5 rounded-lg border border-border text-xs">
                  Log session
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Goals tab
function DemoGoals() {
  const [goals, setGoals] = useState(sampleGoals)

  const completed = goals.filter(g => g.completed).length

  return (
    <div className="p-5 flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Goals</h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          {completed} of {goals.length} completed
        </p>
      </div>

      {/* Overall progress */}
      <div className="border border-border rounded-xl p-4 bg-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium">Overall progress</span>
          <span className="text-sm font-mono font-semibold">
            {Math.round((completed / goals.length) * 100)}%
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.round((completed / goals.length) * 100)}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className={`border border-border rounded-xl px-4 py-3 bg-card flex flex-col gap-2 ${goal.completed ? "opacity-60" : ""}`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setGoals(goals.map(g =>
                  g.id === goal.id ? { ...g, completed: !g.completed } : g
                ))}
                className={`
                  w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${goal.completed ? "bg-green-500 border-green-500 text-white" : "border-border hover:border-green-500"}
                `}
              >
                {goal.completed && (
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span className={`text-xs flex-1 ${goal.completed ? "line-through text-muted-foreground" : ""}`}>
                {goal.title}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                {goal.completed ? "100%" : "0%"}
              </span>
            </div>
            <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${goal.completed ? "bg-green-500" : "bg-muted"}`}
                style={{ width: goal.completed ? "100%" : "0%" }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground font-mono">
        ↑ try clicking the checkboxes
      </p>
    </div>
  )
}

// Analytics tab
function DemoAnalytics() {
  const totalMinutes = sampleTopics.reduce((sum, t) => sum + t.minutes, 0)

  return (
    <div className="p-5 flex flex-col gap-4 font-mono">
      <div className="border-b border-border pb-3">
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">analytics</div>
        <h1 className="text-base font-semibold">$ learning --report --user=anubhav</h1>
      </div>

      <div className="border border-border rounded-xl p-4 bg-card">
        <div className="text-xs text-muted-foreground mb-3 uppercase tracking-widest">// summary</div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { key: "total_hours", value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` },
            { key: "topics", value: "4" },
            { key: "this_week", value: "2h 45m" },
            { key: "vs_last_week", value: "+23%", green: true },
          ].map((s) => (
            <div key={s.key}>
              <div className="text-xs text-muted-foreground">{s.key}</div>
              <div className={`text-lg font-bold ${s.green ? "text-green-500" : ""}`}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-border rounded-xl p-4 bg-card">
        <div className="text-xs text-muted-foreground mb-3 uppercase tracking-widest">// topics.breakdown</div>
        <div className="flex flex-col gap-3">
          {sampleTopics.map((topic, i) => {
            const pct = Math.round((topic.minutes / totalMinutes) * 100)
            return (
              <div key={topic.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">[0{i + 1}]</span>
                    <span>{topic.title}</span>
                  </div>
                  <div className="flex gap-4 text-muted-foreground">
                    <span>{topic.sessions} sessions</span>
                    <span className="text-foreground font-bold">{pct}%</span>
                  </div>
                </div>
                <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground/60 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="border border-border rounded-xl p-4 bg-card">
        <div className="text-xs text-muted-foreground mb-3 uppercase tracking-widest">// insights</div>
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">most_active_day</span>
            <span className="text-foreground/40">=</span>
            <span className="text-green-500 font-bold">"Sunday"</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">best_topic</span>
            <span className="text-foreground/40">=</span>
            <span className="text-blue-400 font-bold">"DSA"</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">weekly_trend</span>
            <span className="text-foreground/40">=</span>
            <span className="text-green-500 font-bold">↑ improving</span>
          </div>
        </div>
      </div>
    </div>
  )
}