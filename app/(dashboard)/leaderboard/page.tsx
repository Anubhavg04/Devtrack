import { prisma } from "@/lib/prisma"
import { getUserId } from "@/lib/getUser"
import { Trophy, Medal, Flame, Crown, Star } from "lucide-react"
import Link from "next/link"

import { UserAvatar } from "@/components/user-avatar"

export default async function LeaderboardPage() {
  const currentUserId = await getUserId()

  const sessionGroup = await prisma.session.groupBy({
    by: ['userId'],
    _sum: { minutes: true },
    orderBy: { _sum: { minutes: 'desc' } },
    take: 10
  })

  const userIds = sessionGroup.map(s => s.userId)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, username: true, displayName: true, name: true, avatar: true }
  })

  const topUsers = sessionGroup.map(s => {
    const user = users.find(u => u.id === s.userId)
    return {
      id: s.userId,
      username: user?.username,
      displayName: user?.displayName,
      name: user?.name,
      avatar: user?.avatar,
      totalMinutes: s._sum.minutes || 0,
      totalXp: (s._sum.minutes || 0) * 10
    }
  })

  const top3 = topUsers.slice(0, 3)
  const rest = topUsers.slice(3)

  const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3
  const ranks = top3.length === 3 ? [2, 1, 3] : [1, 2, 3].slice(0, top3.length)

  return (
    <div className="flex flex-col max-w-4xl mx-auto py-8 px-4 w-full relative">
      
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-16 relative z-10">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 text-primary shadow-sm">
          <Trophy className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-3 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
          Global Leaderboard
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto text-sm md:text-base">
          The most dedicated developers across the platform. Level up your XP by logging focus sessions.
        </p>
      </div>

      {topUsers.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-3xl shadow-sm">
          <Flame className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-medium text-foreground">No sessions yet</h2>
          <p className="text-muted-foreground mt-2">Be the first to claim the #1 spot!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-12 relative z-10">
          
          {/* Top 3 Podium */}
          {top3.length > 0 && (
            <div className="flex items-end justify-center gap-2 md:gap-6 pt-10 h-[280px]">
              {podiumOrder.map((user, idx) => {
                const rank = ranks[idx]
                const isFirst = rank === 1
                const isSecond = rank === 2
                const isThird = rank === 3
                
                const heightClass = isFirst ? 'h-48' : isSecond ? 'h-40' : 'h-32'
                const borderColors = isFirst ? 'border-yellow-400' : isSecond ? 'border-slate-300' : 'border-amber-700'
                const bgColors = isFirst ? 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30' 
                             : isSecond ? 'from-slate-300/20 to-slate-300/5 border-slate-300/30'
                             : 'from-amber-700/20 to-amber-700/5 border-amber-700/30'
                
                const Icon = isFirst ? Crown : Medal

                return (
                  <div key={user.id} className="flex flex-col items-center w-[30%] max-w-[160px] relative group">
                    <div className="absolute -top-16 z-20 transition-transform group-hover:-translate-y-2">
                      <UserAvatar 
                        avatar={user.avatar || null} 
                        name={user.username || user.name || null} 
                        size={isFirst ? 80 : 64} 
                        className={`border-4 bg-background shadow-md ${borderColors}`}
                      />
                      <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-4 border-background flex items-center justify-center text-background shadow-lg ${isFirst ? 'bg-yellow-400' : isSecond ? 'bg-slate-300' : 'bg-amber-700'}`}>
                        <Icon className="w-4 h-4 fill-current" />
                      </div>
                    </div>
                    
                    <div className={`w-full ${heightClass} bg-gradient-to-t ${bgColors} border-t-2 rounded-t-2xl flex flex-col items-center pt-10 px-2 transition-all hover:brightness-110 shadow-lg backdrop-blur-sm`}>
                      <span className="font-bold text-foreground text-center truncate w-full px-2 text-sm md:text-base">
                        {user.displayName || user.name || "Unknown"}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground mt-1 tracking-wider opacity-80">{user.totalXp.toLocaleString()} XP</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* List for 4-10 */}
          {rest.length > 0 && (
            <div className="bg-card/50 backdrop-blur-md border border-border rounded-3xl overflow-hidden shadow-xl">
              <div className="flex flex-col">
                {rest.map((user, idx) => {
                  const rank = idx + 4
                  const isCurrentUser = user.id === currentUserId
                  
                  const rowContent = (
                    <div className={`flex items-center justify-between p-4 sm:px-6 transition-all hover:bg-muted/50 ${isCurrentUser ? 'bg-primary/5 relative' : ''} ${idx !== rest.length - 1 ? 'border-b border-border/50' : ''}`}>
                      {isCurrentUser && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                      
                      <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                        <span className="text-muted-foreground font-bold w-6 text-center text-sm">{rank}</span>
                        <UserAvatar avatar={user.avatar || null} name={user.username || user.name || null} size={40} />
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-foreground truncate flex items-center gap-2 text-sm sm:text-base">
                            {user.displayName || user.name || "Unknown"}
                            {isCurrentUser && <span className="text-[10px] uppercase tracking-widest bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold shadow-sm">You</span>}
                          </span>
                          {user.username && (
                            <span className="text-xs text-muted-foreground truncate">@{user.username}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-4 flex-shrink-0">
                        <div className="hidden sm:flex items-center justify-center px-3 py-1 bg-muted rounded-full">
                          <Star className="w-3 h-3 text-muted-foreground mr-1.5" />
                          <span className="text-xs font-medium">{user.totalMinutes}m</span>
                        </div>
                        <div className="flex flex-col items-end sm:items-start">
                          <span className="font-bold text-foreground font-mono text-sm sm:text-lg">{user.totalXp.toLocaleString()}</span>
                          <span className="text-[10px] text-muted-foreground sm:hidden">XP</span>
                        </div>
                      </div>
                    </div>
                  )

                  if (user.username) {
                    return (
                      <Link href={`/u/${user.username}`} key={user.id} className="block group">
                        {rowContent}
                      </Link>
                    )
                  }
                  return <div key={user.id}>{rowContent}</div>
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
