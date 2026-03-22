"use client"

import { format, eachDayOfInterval, subDays, startOfDay } from "date-fns"
import { useState } from "react"

type Session = { date: Date; minutes: number }
type Props = { sessions: Session[] }

export function Heatmap({ sessions }: Props) {
  const [tooltip, setTooltip] = useState<{
    date: string
    minutes: number
    x: number
    y: number
  } | null>(null)

  const minutesByDay: Record<string, number> = {}
  sessions.forEach((s) => {
    const key = format(new Date(s.date), "yyyy-MM-dd")
    minutesByDay[key] = (minutesByDay[key] || 0) + s.minutes
  })

  const today = startOfDay(new Date())
  const start = subDays(today, 364)
  const allDays = eachDayOfInterval({ start, end: today })

  const weeks: Date[][] = []
  let currentWeek: Date[] = []
  allDays.forEach((day, i) => {
    currentWeek.push(day)
    if (currentWeek.length === 7 || i === allDays.length - 1) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  const totalMinutes = Object.values(minutesByDay).reduce((s, m) => s + m, 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const totalDays = Object.keys(minutesByDay).length
  const streak = calculateStreak(minutesByDay, today)
  const maxMinutes = Math.max(...Object.values(minutesByDay), 1)
  const months = getMonthLabels(weeks)

  function getLevel(minutes: number): 0 | 1 | 2 | 3 | 4 {
    if (!minutes) return 0
    const ratio = minutes / maxMinutes
    if (ratio < 0.25) return 1
    if (ratio < 0.5) return 2
    if (ratio < 0.75) return 3
    return 4
  }

  const levelStyles = {
    0: {
      bg: "var(--dot-empty)",
      shadow: "none",
      scale: "scale-75",
    },
    1: {
      bg: "var(--dot-l1)",
      shadow: "0 0 4px var(--dot-l1-glow)",
      scale: "scale-90",
    },
    2: {
      bg: "var(--dot-l2)",
      shadow: "0 0 6px var(--dot-l2-glow)",
      scale: "scale-100",
    },
    3: {
      bg: "var(--dot-l3)",
      shadow: "0 0 8px var(--dot-l3-glow)",
      scale: "scale-100",
    },
    4: {
      bg: "var(--dot-l4)",
      shadow: "0 0 12px var(--dot-l4-glow)",
      scale: "scale-100",
    },
  }

  return (
    <>
      {/* CSS variables for dot colors */}
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

      <div className="flex flex-col gap-6">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "active days", value: totalDays },
            { label: "hours logged", value: `${totalHours}h` },
            { label: "day streak", value: `${streak} 🔥` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border border-border rounded-xl px-4 py-3 bg-card"
            >
              <div className="text-2xl font-semibold font-mono tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 uppercase tracking-widest font-mono">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Month labels */}
        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-max pl-0">
            {months.map((m, i) => (
              <div
                key={i}
                className="text-xs text-muted-foreground font-mono"
                style={{ width: `${m.weeks * 14}px` }}
              >
                {m.label}
              </div>
            ))}
          </div>
        </div>

        {/* Dot matrix grid */}
        <div className="relative overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day) => {
                  const key = format(day, "yyyy-MM-dd")
                  const minutes = minutesByDay[key] || 0
                  const level = getLevel(minutes)
                  const style = levelStyles[level]
                  const isToday = key === format(today, "yyyy-MM-dd")

                  return (
                    <div
                      key={key}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setTooltip({
                          date: format(day, "MMM d, yyyy"),
                          minutes,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      className={`
                        w-3 h-3 rounded-full cursor-pointer
                        transition-all duration-200
                        ${style.scale}
                        ${isToday ? "ring-2 ring-offset-1 ring-offset-background ring-foreground/40" : ""}
                        hover:scale-125
                      `}
                      style={{
                        backgroundColor: style.bg,
                        boxShadow: style.shadow,
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="fixed z-50 pointer-events-none"
              style={{ left: tooltip.x, top: tooltip.y - 38 }}
            >
              <div className="bg-foreground text-background text-xs font-mono px-2.5 py-1.5 rounded-lg whitespace-nowrap -translate-x-1/2 shadow-lg">
                {tooltip.minutes > 0
                  ? `${tooltip.minutes}m — ${tooltip.date}`
                  : `no activity — ${tooltip.date}`}
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <span>less</span>
          {[0, 1, 2, 3, 4].map((level) => {
            const s = levelStyles[level as 0 | 1 | 2 | 3 | 4]
            return (
              <div
                key={level}
                className="w-3 h-3 rounded-full transition-all"
                style={{
                  backgroundColor: s.bg,
                  boxShadow: s.shadow,
                }}
              />
            )
          })}
          <span>more</span>
        </div>

      </div>
    </>
  )
}

function calculateStreak(
  minutesByDay: Record<string, number>,
  today: Date
): number {
  let streak = 0
  let current = today
  while (true) {
    const key = format(current, "yyyy-MM-dd")
    if (!minutesByDay[key]) break
    streak++
    current = subDays(current, 1)
  }
  return streak
}

function getMonthLabels(weeks: Date[][]) {
  const labels: { label: string; weeks: number }[] = []
  let currentMonth = ""
  let count = 0
  weeks.forEach((week) => {
    const month = format(week[0], "MMM")
    if (month !== currentMonth) {
      if (currentMonth) labels.push({ label: currentMonth, weeks: count })
      currentMonth = month
      count = 1
    } else {
      count++
    }
  })
  if (currentMonth) labels.push({ label: currentMonth, weeks: count })
  return labels
}