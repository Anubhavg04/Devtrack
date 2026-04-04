// import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
// import { redirect } from "next/navigation"
import { unstable_cache } from "next/cache"
import { getUserId } from "@/lib/getUser"
import { subDays, format, startOfWeek, endOfWeek } from "date-fns"

const getAnalyticsData = (userId: string) =>
  unstable_cache(
    async () => {
      const [topics, sessions] = await Promise.all([
        prisma.topic.findMany({
          where: { userId },
          select: {
            title: true,
            _count: {
              select: { sessions: true },
            },
            sessions: {
              select: { minutes: true }, // only minutes needed
            },
          },
        }),
        prisma.session.groupBy({
          by: ["date"],
          where: {
            userId,
            date: { gte: subDays(new Date(), 364) },
          },
          _sum: { 
            minutes: true 
          },
          orderBy: { date: "asc" },
        }),
      ])
      return { topics, sessions }
    },
    [`analytics-${userId}`],
    { tags: [`analytics-${userId}`, `topics-${userId}`], revalidate: 300 }
  )()

export default async function AnalyticsPage() {
  const userId = await getUserId()
  const { topics, sessions } = await getAnalyticsData(userId)

  // All computation stays in JS exactly as before — only the DB query changed
  const topicStats = topics.map((topic) => {
    const totalMinutes = topic.sessions.reduce((sum, s) => sum + s.minutes, 0)
  
    return {
      title: topic.title,
      minutes: totalMinutes,
      sessions: topic._count.sessions,
    }
  })

  const totalMinutes = topicStats.reduce((sum, t) => sum + t.minutes, 0)

  const now = new Date()
  const thisWeekStart = startOfWeek(now)
  const lastWeekStart = startOfWeek(subDays(now, 7))
  const lastWeekEnd = endOfWeek(subDays(now, 7))

  const thisWeekMinutes = sessions
    .filter((s) => new Date(s.date) >= thisWeekStart)
    .reduce((sum, s) => sum + (s._sum.minutes || 0), 0)

  const lastWeekMinutes = sessions
    .filter((s) => {
      const d = new Date(s.date)
      return d >= lastWeekStart && d <= lastWeekEnd
    })
    .reduce((sum, s) => sum + (s._sum.minutes || 0), 0)

  const weekDiff = thisWeekMinutes - lastWeekMinutes
  const weekDiffPercent = lastWeekMinutes === 0
    ? 100
    : Math.round((weekDiff / lastWeekMinutes) * 100)

  const dayCount: Record<string, number> = {}
  sessions.forEach((s) => {
    const day = format(new Date(s.date), "EEEE")
    dayCount[day] = (dayCount[day] || 0) + (s._sum.minutes || 0)
  })
  const mostActiveDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]

  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(now, 6 - i)
    const key = format(date, "yyyy-MM-dd")
    const minutes = sessions
      .filter((s) => format(new Date(s.date), "yyyy-MM-dd") === key)
      .reduce((sum, s) => sum + (s._sum.minutes || 0), 0)
    return { date: format(date, "EEE"), minutes }
  })

  const maxDay = Math.max(...last7.map((d) => d.minutes), 1)

  return (
    <div className="flex flex-col gap-8 max-w-4xl font-mono">

      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="text-xs text-muted-foreground py-6 uppercase tracking-widest mb-1">
          <h3 className="text-xl font-semibold tracking-tight">Analytics</h3>
        </div>
        <h1 className="text-xl py-1 font-semibold tracking-tight">
          $ learning --report --user={userId}
        </h1>
      </div>

      {/* Summary block */}
      <div className="border border-border rounded-xl p-5 bg-card">
        <div className="text-xs text-muted-foreground mb-4 uppercase tracking-widest">
          // summary
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              key: "total_hours",
              value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
            },
            {
              key: "topics_tracked",
              value: `${topicStats.length}`,
            },
            {
              key: "this_week",
              value: `${Math.floor(thisWeekMinutes / 60)}h ${thisWeekMinutes % 60}m`,
            },
            {
              key: "vs_last_week",
              value: lastWeekMinutes === 0
                ? "new data"
                : `${weekDiff >= 0 ? "+" : ""}${weekDiffPercent}%`,
            },
          ].map((stat) => (
            <div key={stat.key} className="flex flex-col gap-1">
              <div className="text-xs text-muted-foreground">{stat.key}</div>
              <div className={`text-2xl font-bold tracking-tight ${
                stat.key === "vs_last_week"
                  ? weekDiff >= 0 ? "text-green-500" : "text-red-400"
                  : ""
              }`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Last 7 days bar chart */}
      <div className="border border-border rounded-xl p-5 bg-card">
        <div className="text-xs text-muted-foreground mb-4 uppercase tracking-widest">
          // last_7_days
        </div>
        <div className="flex flex-col gap-2">
          {last7.map((day) => {
            const barWidth = Math.round((day.minutes / maxDay) * 100)
            const hours = Math.floor(day.minutes / 60)
            const mins = day.minutes % 60
            const label = hours > 0 ? `${hours}h ${mins}m` : day.minutes > 0 ? `${mins}m` : "—"
            return (
              <div key={day.date} className="flex items-center gap-3 text-sm">
                <span className="w-8 text-muted-foreground text-xs">{day.date}</span>
                <div className="flex-1 h-5 bg-muted/30 rounded-sm overflow-hidden">
                  {day.minutes > 0 && (
                    <div
                      className="h-full bg-foreground/70 rounded-sm transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  )}
                </div>
                <span className="w-16 text-right text-xs text-muted-foreground">
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Per topic breakdown */}
      <div className="border border-border rounded-xl p-5 bg-card">
        <div className="text-xs text-muted-foreground mb-4 uppercase tracking-widest">
          // topics.breakdown
        </div>
        {topicStats.length === 0 ? (
          <div className="text-sm text-muted-foreground">no topics logged yet</div>
        ) : (
          <div className="flex flex-col gap-4">
            {topicStats.map((topic, i) => {
              const pct = totalMinutes === 0
                ? 0
                : Math.round((topic.minutes / totalMinutes) * 100)
              const hours = Math.floor(topic.minutes / 60)
              const mins = topic.minutes % 60
              const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`

              return (
                <div key={`${topic.title}-${i}`} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">
                        [{String(i + 1).padStart(2, "0")}]
                      </span>
                      <span className="font-medium">{topic.title}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{topic.sessions} sessions</span>
                      <span className="w-12 text-right">{timeLabel}</span>
                      <span className="w-10 text-right text-foreground font-bold">
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground/60 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Most active day */}
      {mostActiveDay && (
        <div className="border border-border rounded-xl p-5 bg-card">
          <div className="text-xs text-muted-foreground mb-4 uppercase tracking-widest">
            // insights
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">most_active_day</span>
              <span className="text-foreground/40 mx-1">=</span>
              <span className="text-green-500 font-bold">
                "{mostActiveDay[0]}"
              </span>
              <span className="text-muted-foreground text-xs ml-2">
                ({Math.floor(mostActiveDay[1] / 60)}h {mostActiveDay[1] % 60}m total)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">best_topic</span>
              <span className="text-foreground/40 mx-1">=</span>
              <span className="text-blue-400 font-bold">
                "{topicStats[0]?.title ?? "none"}"
              </span>
              <span className="text-muted-foreground text-xs ml-2">
                ({Math.round((topicStats[0]?.minutes / totalMinutes) * 100) || 0}% of time)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">weekly_trend</span>
              <span className="text-foreground/40 mx-1">=</span>
              <span className={`font-bold ${weekDiff >= 0 ? "text-green-500" : "text-red-400"}`}>
                {weekDiff >= 0 ? "↑ improving" : "↓ below last week"}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}