// import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
// import { redirect } from "next/navigation"
import { unstable_cache } from "next/cache"
import { getUserId } from "@/lib/getUser"
import { subDays, format, startOfWeek, endOfWeek } from "date-fns"

const getAnalyticsData = (userId: string) =>
  unstable_cache(
    async () => {
      const [topics, topicSessions, sessions] = await Promise.all([
        prisma.topic.findMany({
          where: { userId },
          select: {
            id: true,
            title: true,
          },
        }),
        prisma.session.groupBy({
          by: ["topicId"],
          where: { userId },
          _sum: { minutes: true },
          _count: { _all: true },
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

      const topicStatsById = new Map(
        topicSessions.map((row) => [
          row.topicId,
          {
            minutes: row._sum.minutes ?? 0,
            sessions: row._count._all,
          },
        ])
      )

      const topicStats = topics.map((topic) => {
        const stats = topicStatsById.get(topic.id)
        return {
          title: topic.title,
          minutes: stats?.minutes ?? 0,
          sessions: stats?.sessions ?? 0,
        }
      })

      return { topicStats, sessions }
    },
    [`analytics-${userId}`],
    { tags: [`analytics-${userId}`, `topics-${userId}`], revalidate: 300 }
  )()

import { BarChart3, PieChart, Activity, TrendingUp } from "lucide-react"
import { Last7DaysChart, TopicsPieChart } from "./charts"

export default async function AnalyticsPage() {
  const userId = await getUserId()
  const { topicStats, sessions } = await getAnalyticsData(userId)

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

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto py-2">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold py-2 flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Analytics
        </h1>
        <p className="text-muted-foreground text-sm">
          Visualize your learning patterns and track your progress over time.
        </p>
      </div>

      {/* Summary block */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: "Total Hours", value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`, color: "border-primary/20 bg-primary/5 text-primary" },
          { key: "Topics Tracked", value: `${topicStats.length}`, color: "border-blue-500/20 bg-blue-500/5 text-blue-500" },
          { key: "This Week", value: `${Math.floor(thisWeekMinutes / 60)}h ${thisWeekMinutes % 60}m`, color: "border-orange-500/20 bg-orange-500/5 text-orange-500" },
          { key: "Vs Last Week", value: lastWeekMinutes === 0 ? "new data" : `${weekDiff >= 0 ? "+" : ""}${weekDiffPercent}%`, color: weekDiff >= 0 ? "border-green-500/20 bg-green-500/5 text-green-500" : "border-red-500/20 bg-red-500/5 text-red-500" },
        ].map((stat) => (
          <div key={stat.key} className={`border rounded-xl p-4 flex flex-col justify-center ${stat.color}`}>
            <div className="text-2xl font-semibold">{stat.value}</div>
            <div className="text-xs font-medium mt-1 opacity-80">{stat.key}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Last 7 days bar chart */}
        <div className="border border-border rounded-xl p-6 bg-card shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">Last 7 Days</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Your daily focus time over the past week.</p>
          <Last7DaysChart data={last7} />
        </div>

        {/* Per topic pie chart */}
        <div className="border border-border rounded-xl p-6 bg-card shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">Time per Topic</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">How your total study time is distributed.</p>
          <TopicsPieChart data={topicStats} />
        </div>
      </div>

      {/* Insights */}
      {mostActiveDay && (
        <div className="border border-border rounded-xl p-6 bg-card shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">Key Insights</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Most Active Day</div>
              <div className="font-semibold text-lg">{mostActiveDay[0]}</div>
              <div className="text-xs text-muted-foreground mt-1">{Math.floor(mostActiveDay[1] / 60)}h {mostActiveDay[1] % 60}m average</div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Top Topic</div>
              <div className="font-semibold text-lg">{topicStats[0]?.title ?? "none"}</div>
              <div className="text-xs text-muted-foreground mt-1">{Math.round((topicStats[0]?.minutes / totalMinutes) * 100) || 0}% of all study time</div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Weekly Trend</div>
              <div className={`font-semibold text-lg ${weekDiff >= 0 ? "text-green-500" : "text-red-400"}`}>
                {weekDiff >= 0 ? "Improving" : "Slowing Down"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{weekDiff >= 0 ? "You studied more this week" : "You studied less this week"}</div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}