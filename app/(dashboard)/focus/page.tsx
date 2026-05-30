import { format, subDays } from "date-fns"
import { prisma } from "@/lib/prisma"
import { getUserId } from "@/lib/getUser"
import { Timer } from "lucide-react"
import { FocusTimer } from "./timer-client"

export default async function FocusPage() {
  const userId = await getUserId()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const topicsRaw = await prisma.topic.findMany({
    where: { userId },
    select: { 
      id: true, 
      title: true,
      sessions: {
        where: { date: { gte: todayStart } },
        select: { minutes: true }
      }
    },
    orderBy: { createdAt: "desc" },
  })

  const topics = topicsRaw.map(t => ({
    id: t.id,
    title: t.title,
    todayMinutes: t.sessions.reduce((acc, s) => acc + s.minutes, 0)
  }))

  const sessions = await prisma.session.findMany({
    where: {
      userId,
      date: { gte: subDays(new Date(), 364) },
    },
    select: { date: true, minutes: true },
    orderBy: { date: "asc" },
  })

  const todayStr = format(new Date(), "yyyy-MM-dd")
  let todaySessionsCount = 0
  let todayMinutesCount = 0
  const sessionMap: Record<string, number> = {}
  
  sessions.forEach((s) => {
    const key = format(new Date(s.date), "yyyy-MM-dd")
    sessionMap[key] = (sessionMap[key] || 0) + s.minutes
    if (key === todayStr) {
      todaySessionsCount++
      todayMinutesCount += s.minutes
    }
  })

  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const key = format(subDays(today, i), "yyyy-MM-dd")
    if (sessionMap[key]) streak++
    else if (i > 0) break
  }

  return (
    <div className="flex flex-col gap-3 max-w-3xl mx-auto py-2 px-4 w-full h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          Focus Session
        </h1>
        <p className="text-muted-foreground text-sm">
          Stay on track with structured productivity
        </p>
      </div>

      <div className="flex-1 w-full flex flex-col items-center">
        <FocusTimer 
          topics={topics} 
          stats={{
            sessionsDone: todaySessionsCount,
            focusedMinutes: todayMinutesCount,
            streak: streak
          }}
        />
      </div>
    </div>
  )
}
