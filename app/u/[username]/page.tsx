import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { subDays, format, differenceInDays } from "date-fns"
import { ShareButton } from "@/components/share-button"

function UserAvatar({ avatar, name }: { avatar: string | null, name: string | null }) {
    if (avatar) {
      const [emoji, color] = avatar.split("::")
      
      // Emoji + color dono hain
      if (emoji && color && emoji.length <= 2) {
        return (
          <div 
            className="w-14 h-14 rounded-full border-2 border-green-800 flex items-center justify-center text-2xl"
            style={{ backgroundColor: color + "33" }}
          >
            {emoji}
          </div>
        )
      }
      
      // Sirf color hai
      if (avatar.startsWith("#")) {
        return (
          <div
            className="w-14 h-14 rounded-full border-2 border-green-800 flex items-center justify-center text-xl font-bold text-white"
            style={{ backgroundColor: avatar }}
          >
            {name?.[0]?.toUpperCase()}
          </div>
        )
      }
    }
  
    // Default — Google image ya initials
    return (
      <div className="w-14 h-14 rounded-full border-2 border-green-800 flex items-center justify-center text-xl font-bold text-green-400 bg-green-950">
        {name?.[0]?.toUpperCase()}
      </div>
    )
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      name: true,
      image: true,
      username: true,
      avatar: true,
      displayName: true,
      createdAt: true,
      topics: {
        select: {
          title: true,
          createdAt: true,
          sessions: {
            select: { minutes: true, date: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      goals: {
        select: { completed: true },
      },
      sessions: {
        where: {
          date: { gte: subDays(new Date(), 364) },
        },
        select: { date: true, minutes: true },
        orderBy: { date: "asc" },
      },
    },
  })

  if (!user) notFound()

  const totalMinutes = user.topics.reduce(
    (sum, t) => sum + t.sessions.reduce((s, se) => s + se.minutes, 0),
    0
  )
  const completedGoals = user.goals.filter((g) => g.completed).length
  const totalSessions = user.sessions.length
  const memberDays = differenceInDays(new Date(), new Date(user.createdAt))

  // Heatmap data
  const today = new Date()
  const sessionMap: Record<string, number> = {}
  user.sessions.forEach((s) => {
    const key = format(new Date(s.date), "yyyy-MM-dd")
    sessionMap[key] = (sessionMap[key] || 0) + s.minutes
  })

  // Streak calculation
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const key = format(subDays(today, i), "yyyy-MM-dd")
    if (sessionMap[key]) streak++
    else if (i > 0) break
  }

  // Heatmap weeks
  const weeks: Array<Array<{ date: string; minutes: number }>> = []
  let currentWeek: Array<{ date: string; minutes: number }> = []
  for (let i = 364; i >= 0; i--) {
    const date = format(subDays(today, i), "yyyy-MM-dd")
    currentWeek.push({ date, minutes: sessionMap[date] || 0 })
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }
  if (currentWeek.length > 0) weeks.push(currentWeek)

  const maxMinutes = Math.max(...Object.values(sessionMap), 1)

  // Topic stats
  const topicStats = user.topics.map((t) => ({
    title: t.title,
    minutes: t.sessions.reduce((s, se) => s + se.minutes, 0),
    sessions: t.sessions.length,
  })).sort((a, b) => b.minutes - a.minutes)

  const topTopic = topicStats[0]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-green-400 font-mono p-6 md:p-12">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">

        {/* Terminal header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-3 text-xs text-green-600">devtrack ~ profile</span>
        </div>

        {/* whoami */}
        <div className="flex flex-col gap-3">
          <p className="text-green-600 text-sm">$ whoami</p>
          <div className="flex items-center gap-4">
            <UserAvatar avatar={user.avatar} name={user.name ?? user.name} />
            <div>
              <h1 className="text-2xl font-bold text-green-300">{user.displayName ?? user.name}</h1>
              <p className="text-green-600 text-sm">@{user.username} · Devtrack user for {memberDays} days</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div>
          <p className="text-green-600 text-sm mb-3">$ stats --summary</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: "total_hours", value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` },
              { key: "topics", value: `${user.topics.length}` },
              { key: "sessions", value: `${totalSessions}` },
              { key: "streak", value: `${streak} 🔥` },
            ].map((s) => (
              <div key={s.key} className="border border-green-900 rounded-lg p-3 bg-green-950/20">
                <div className="text-xs text-green-700">{s.key}</div>
                <div className="text-xl font-bold text-green-300 mt-1">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap */}
        <div>
          <p className="text-green-600 text-sm mb-3">$ git log --activity</p>
          <div className="border border-green-900 rounded-lg p-4 bg-green-950/10 overflow-x-auto">
            <div className="flex gap-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((day) => {
                    const ratio = day.minutes / maxMinutes
                    const bg = day.minutes === 0
                      ? "bg-green-950"
                      : ratio < 0.25 ? "bg-green-800"
                      : ratio < 0.5 ? "bg-green-600"
                      : ratio < 0.75 ? "bg-green-500"
                      : "bg-green-400"
                    return (
                      <div
                        key={day.date}
                        title={`${day.date}: ${day.minutes}m`}
                        className={`w-2.5 h-2.5 rounded-sm ${bg}`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
            <p className="text-xs text-green-700 mt-3">last 365 days of learning activity</p>
          </div>
        </div>

        {/* Topics */}
        <div>
          <p className="text-green-600 text-sm mb-3">$ ls topics/ --sort=time</p>
          <div className="border border-green-900 rounded-lg p-4 bg-green-950/10 flex flex-col gap-3">
            {topicStats.length === 0 ? (
              <p className="text-green-700 text-sm">no topics yet</p>
            ) : (
              topicStats.map((topic, i) => {
                const pct = totalMinutes === 0 ? 0 : Math.round((topic.minutes / totalMinutes) * 100)
                const hrs = Math.floor(topic.minutes / 60)
                const mins = topic.minutes % 60
                return (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-green-700">[{String(i + 1).padStart(2, "0")}]</span>
                        <span className="text-green-300">{topic.title}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-green-600">
                        <span>{topic.sessions} sessions</span>
                        <span>{hrs}h {mins}m</span>
                        <span className="text-green-400 font-bold w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1 bg-green-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Share Button */}
        <ShareButton username={user.username!}/>
        {/* Footer */}
        <div className="border-t border-green-900 pt-4 flex items-center justify-between">
          <p className="text-xs text-green-700">
            powered by <span className="text-green-500">devtrack</span>
          </p>
          <a
            href="/"
            className="text-xs text-green-600 hover:text-green-400 transition-colors"
          >
            devtrackapp-orcin.vercel.app →
          </a>
        </div>

      </div>
    </div>
  )
}