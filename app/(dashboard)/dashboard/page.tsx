// import { auth } from "@/auth"
// import { prisma } from "@/lib/prisma"
// import { redirect } from "next/navigation"
// import { unstable_cache } from "next/cache"
// import { Heatmap } from "@/components/heatmaps"
// import { subDays } from "date-fns"
// import { BookOpen, Target, CheckCircle2, ArrowRight } from "lucide-react"
// import Link from "next/link"

// //Cached dashboard data — invalidated when topics or goals change
// const getDashboardData = (userId: string) =>
//   unstable_cache(
//     async () => {
//       const [
//         topicsCount,
//         goalsCount,
//         completedGoals,
//         sessions,
//         recentTopics,
//         activeGoals,
//       ] = await Promise.all([
//         prisma.topic.count({ where: { userId } }),
//         prisma.goal.count({ where: { userId } }),
//         prisma.goal.count({ where: { userId, completed: true } }),
//         prisma.session.findMany({
//           where: {
//             userId,
//             date: { gte: subDays(new Date(), 364) },
//           },
//           select: { date: true, minutes: true }, //  lean select
//         }),
//         prisma.topic.findMany({
//           where: { userId },
//           orderBy: { createdAt: "desc" },
//           take: 3,
//           select: {
//             id: true,
//             title: true,
//             sessions: {
//               select: { minutes: true }, // only minutes, not full session rows
//             },
//           },
//         }),
//         prisma.goal.findMany({
//           where: { userId, completed: false },
//           orderBy: { createdAt: "desc" },
//           take: 3,
//           select: { id: true, title: true }, // lean select
//         }),
//       ])

//       return {
//         topicsCount,
//         goalsCount,
//         completedGoals,
//         sessions,
//         recentTopics,
//         activeGoals,
//       }
//     },
//     [`dashboard-${userId}`],
//     { tags: [`dashboard-${userId}`, `topics-${userId}`, `goals-${userId}`] }
//   )()

// export default async function DashboardPage() {
//   const session = await auth()
//   if (!session?.user?.email) redirect("/login")

//   const user = await prisma.user.findUnique({
//     where: { email: session.user.email },
//     select: { id: true },
//   })
//   if (!user) redirect("/login")

//   const {
//     topicsCount,
//     goalsCount,
//     completedGoals,
//     sessions,
//     recentTopics,
//     activeGoals,
//   } = await getDashboardData(user.id)

//   return (
//     <div className="flex flex-col gap-8 max-w-5xl">

//       {/* Header */}
//       <div>
//         <h1 className="text-2xl py-6 font-semibold tracking-tight">
//           Welcome back, {session.user.name?.split(" ")[0]} 👋
//         </h1>
//         <p className="text-muted-foreground text-sm mt-1">
//           Here is your learning overview
//         </p>
//       </div>

//       {/* Stat cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <StatCard icon={BookOpen} label="Topics tracking" value={topicsCount} color="blue" />
//         <StatCard icon={Target} label="Total goals" value={goalsCount} color="purple" />
//         <StatCard icon={CheckCircle2} label="Goals completed" value={completedGoals} color="green" />
//       </div>

//       {/* Recent topics + active goals side by side */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//         {/* Recent topics */}
//         <div className="border border-border rounded-xl p-5 bg-card flex flex-col gap-4">
//           <div className="flex items-center justify-between">
//             <h2 className="font-medium text-sm">Recent topics</h2>
//             <Link
//               href="/topics"
//               className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
//             >
//               View all <ArrowRight size={12} />
//             </Link>
//           </div>
//           {recentTopics.length === 0 ? (
//             <p className="text-sm text-muted-foreground">No topics yet.</p>
//           ) : (
//             <div className="flex flex-col gap-3">
//               {recentTopics.map((topic) => {
//                 const totalMinutes = topic.sessions.reduce(
//                   (sum, s) => sum + s.minutes, 0
//                 )
//                 const hours = Math.floor(totalMinutes / 60)
//                 const mins = totalMinutes % 60
//                 const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
//                 return (
//                   <div
//                     key={topic.id}
//                     className="flex items-center justify-between py-2 border-b border-border last:border-0"
//                   >
//                     <div className="flex items-center gap-2">
//                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
//                       <span className="text-sm font-medium">{topic.title}</span>
//                     </div>
//                     <span className="text-xs text-muted-foreground font-mono">
//                       {totalMinutes === 0 ? "no sessions" : timeLabel}
//                     </span>
//                   </div>
//                 )
//               })}
//             </div>
//           )}
//         </div>

//         {/* Active goals */}
//         <div className="border border-border rounded-xl p-5 bg-card flex flex-col gap-4">
//           <div className="flex items-center justify-between">
//             <h2 className="font-medium text-sm">Active goals</h2>
//             <Link
//               href="/goals"
//               className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
//             >
//               View all <ArrowRight size={12} />
//             </Link>
//           </div>
//           {activeGoals.length === 0 ? (
//             <p className="text-sm text-muted-foreground">
//               {goalsCount === 0 ? "No goals yet." : "All goals completed! 🎉"}
//             </p>
//           ) : (
//             <div className="flex flex-col gap-3">
//               {activeGoals.map((goal) => (
//                 <div
//                   key={goal.id}
//                   className="flex items-center gap-3 py-2 border-b border-border last:border-0"
//                 >
//                   <div className="w-4 h-4 rounded border-2 border-border flex-shrink-0" />
//                   <span className="text-sm">{goal.title}</span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//       </div>

//       {/* Heatmap */}
//       <div className="border border-border rounded-xl p-6 bg-card">
//         <div className="mb-5">
//           <h2 className="font-semibold tracking-tight">Learning activity</h2>
//           <p className="text-muted-foreground text-sm mt-0.5">
//             Your study sessions over the last year
//           </p>
//         </div>
//         <Heatmap sessions={sessions} />
//       </div>

//     </div>
//   )
// }

// function StatCard({
//   icon: Icon,
//   label,
//   value,
//   color,
// }: {
//   icon: React.ElementType
//   label: string
//   value: number
//   color: "blue" | "purple" | "green"
// }) {
//   const colors = {
//     blue: { bg: "bg-blue-500/10", icon: "text-blue-500", border: "border-blue-500/20" },
//     purple: { bg: "bg-purple-500/10", icon: "text-purple-500", border: "border-purple-500/20" },
//     green: { bg: "bg-green-500/10", icon: "text-green-500", border: "border-green-500/20" },
//   }
//   const c = colors[color]
//   return (
//     <div className="border border-border rounded-xl p-5 bg-card flex flex-col gap-4 hover:bg-accent/30 transition-colors">
//       <div className={`w-9 h-9 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center`}>
//         <Icon size={16} className={c.icon} />
//       </div>
//       <div>
//         <div className="text-3xl font-semibold tracking-tight font-mono">{value}</div>
//         <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
//       </div>
//     </div>
//   )
// }


// import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache" 
import { getUserId } from "@/lib/getUser"
// import { redirect } from "next/navigation"
import { Heatmap } from "@/components/heatmaps"
import { subDays } from "date-fns"
import { BookOpen, Target, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"

const getDashboardData = (userId: string) =>
  unstable_cache(
    async () => {
      const [
        topicsCount,
        goalsCount,
        completedGoals,
        sessions,
        recentTopicsRaw,
        activeGoals,
      ] = await Promise.all([
        prisma.topic.count({ where: { userId } }),
        prisma.goal.count({ where: { userId } }),
        prisma.goal.count({ where: { userId, completed: true } }),

        // ✅ OPTIMIZED (groupBy instead of findMany)
        prisma.session.groupBy({
          by: ["date"],
          where: {
            userId,
            date: { gte: subDays(new Date(), 364) },
          },
          _sum: {
            minutes: true,
          },
          orderBy: { date: "asc" },
        }),

        prisma.topic.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 3,
          select: {
            id: true,
            title: true,
          },
        }),

        prisma.goal.findMany({
          where: { userId, completed: false },
          orderBy: { createdAt: "desc" },
          take: 3,
          select: { id: true, title: true },
        }),
      ])
      const topicIds = recentTopicsRaw.map(t => t.id)
      const topicMinutes = topicIds.length ===0  ? [] : await prisma.session.groupBy({
        by: ["topicId"],
        where: {
          topicId: { in: topicIds },
        },
        _sum: {
          minutes: true,
        },
      })
      const recentTopics = recentTopicsRaw.map(topic => {
        const match = topicMinutes.find(t => t.topicId === topic.id)
        return {
          ...topic,
          minutes: match?._sum.minutes || 0,
        }
      })

      return {
        topicsCount,
        goalsCount,
        completedGoals,
        sessions,
        recentTopics,
        activeGoals,
      }
    },
    [`dashboard-${userId}`],
    { tags: [`dashboard-${userId}`], revalidate: 300 } 
)()

export default async function DashboardPage() {
  const userId = await getUserId()

  const {
    topicsCount,
    goalsCount,
    completedGoals,
    sessions,
    recentTopics,
    activeGoals,
  } = await getDashboardData(userId)

  return (
    <div className="flex flex-col gap-8 max-w-5xl">

      <div>
        <h1 className="text-2xl py-6 font-semibold tracking-tight">
          Welcome back 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here is your learning overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={BookOpen} label="Topics tracking" value={topicsCount} color="blue" />
        <StatCard icon={Target} label="Total goals" value={goalsCount} color="purple" />
        <StatCard icon={CheckCircle2} label="Goals completed" value={completedGoals} color="green" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-border rounded-xl p-5 bg-card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-sm">Recent topics</h2>
            <Link href="/topics" prefetch className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {recentTopics.length === 0 ? (
            <p className="text-sm text-muted-foreground">No topics yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentTopics.map((topic) => {
                const totalMinutes = topic.minutes || 0
                const hours = Math.floor(totalMinutes / 60)
                const mins = totalMinutes % 60
                const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
                return (
                  <div key={topic.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="text-sm font-medium">{topic.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {totalMinutes === 0 ? "no sessions" : timeLabel}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="border border-border rounded-xl p-5 bg-card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-sm">Active goals</h2>
            <Link href="/goals" prefetch className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {activeGoals.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {goalsCount === 0 ? "No goals yet." : "All goals completed! 🎉"}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {activeGoals.map((goal) => (
                <div key={goal.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-4 h-4 rounded border-2 border-border flex-shrink-0" />
                  <span className="text-sm">{goal.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border border-border rounded-xl p-6 bg-card">
        <div className="mb-5">
          <h2 className="font-semibold tracking-tight">Learning activity</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Your study sessions over the last year</p>
        </div>
        <Heatmap sessions={sessions.map((s) => ({ date: s.date, minutes: s._sum.minutes || 0 }))} />
      </div>

    </div>
  )
}

function StatCard({
  icon: Icon, label, value, color,
}: {
  icon: React.ElementType
  label: string
  value: number
  color: "blue" | "purple" | "green"
}) {
  const colors = {
    blue: { bg: "bg-blue-500/10", icon: "text-blue-500", border: "border-blue-500/20" },
    purple: { bg: "bg-purple-500/10", icon: "text-purple-500", border: "border-purple-500/20" },
    green: { bg: "bg-green-500/10", icon: "text-green-500", border: "border-green-500/20" },
  }
  const c = colors[color]
  return (
    <div className="border border-border rounded-xl p-5 bg-card flex flex-col gap-4 hover:bg-accent/30 transition-colors">
      <div className={`w-9 h-9 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center`}>
        <Icon size={16} className={c.icon} />
      </div>
      <div>
        <div className="text-3xl font-semibold tracking-tight font-mono">{value}</div>
        <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
      </div>
    </div>
  )
}