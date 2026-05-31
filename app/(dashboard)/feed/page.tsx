import { prisma } from "@/lib/prisma"
import { getUserId } from "@/lib/getUser"
import { formatDistanceToNow } from "date-fns"
import { Activity, Flame, Code2 } from "lucide-react"
import { UserAvatar } from "@/components/user-avatar"
import Link from "next/link"

export const revalidate = 0 // Opt out of static rendering

export default async function FeedPage() {
  const currentUserId = await getUserId()

  const sessions = await prisma.session.findMany({
    take: 50,
    where: {
      topic: {
        isPrivate: false,
      },
    },
    orderBy: { date: "desc" },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          username: true,
          avatar: true,
        }
      },
      topic: {
        select: {
          title: true,
        }
      }
    }
  })

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex items-center gap-3 py-6">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <Activity size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Live Feed</h1>
          <p className="text-muted-foreground text-sm mt-1">See what others are studying right now</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {sessions.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-12 flex flex-col items-center gap-3 text-center">
            <span className="text-4xl">📭</span>
            <h3 className="font-semibold">No activity yet</h3>
            <p className="text-muted-foreground text-sm">Be the first to complete a focus session!</p>
          </div>
        ) : (
          sessions.map((session) => {
            const isMe = session.user.id === currentUserId
            
            return (
              <div key={session.id} className="border border-border bg-card rounded-xl p-5 flex gap-4 transition-all hover:shadow-sm group">
                <Link href={`/u/${session.user.username}`} className="flex-shrink-0">
                  <UserAvatar 
                    avatar={session.user.avatar} 
                    name={session.user.username || "anonymous"} 
                    className="w-12 h-12"
                  />
                </Link>
                
                <div className="flex flex-col flex-1 gap-1.5">
                  <div className="flex items-center justify-between gap-4">
                    <Link href={`/u/${session.user.username}`} className="font-semibold hover:underline decoration-border underline-offset-4">
                      {session.user.displayName || session.user.username}
                      {isMe && <span className="ml-2 text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold">You</span>}
                    </Link>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(session.date, { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground flex items-center flex-wrap gap-x-2 gap-y-1">
                    <span>completed a</span>
                    <span className="font-medium text-foreground bg-accent px-2 py-0.5 rounded-md flex items-center gap-1.5">
                      <Flame size={14} className="text-orange-500" />
                      {session.minutes} min
                    </span>
                    <span>focus session on</span>
                    <span className="font-medium text-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-md flex items-center gap-1.5">
                      <Code2 size={14} />
                      {session.topic.title}
                    </span>
                  </div>
                  
                  {session.note && session.note !== "Pomodoro Focus Session" && (
                    <div className="mt-2 text-sm italic text-muted-foreground border-l-2 border-border pl-3">
                      "{session.note}"
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
