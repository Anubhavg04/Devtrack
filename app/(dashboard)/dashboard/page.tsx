import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Heatmap } from "@/components/heatmaps"
import { subDays } from "date-fns"
import { BookOpen, Target, CheckCircle2 } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    update: {
      name: session.user.name,
      image: session.user.image,
    },
    create: {
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    },
  })

  const topicsCount = await prisma.topic.count({
    where: { userId: user.id },
  })

  const goalsCount = await prisma.goal.count({
    where: { userId: user.id },
  })

  const completedGoals = await prisma.goal.count({
    where: { userId: user.id, completed: true },
  })

  const sessions = await prisma.session.findMany({
    where: {
      userId: user.id,
      date: { gte: subDays(new Date(), 364) },
    },
    select: { date: true, minutes: true },
  })

  return (
    <div className="flex flex-col gap-8 max-w-5xl">

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {session.user.name?.split(" ")[0]} 👋
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

      <div className="border border-border rounded-xl p-6 bg-card">
        <div className="mb-5">
          <h2 className="font-semibold tracking-tight">Learning activity</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Your study sessions over the last year
          </p>
        </div>
        <Heatmap sessions={sessions} />
      </div>

    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: number
  color: "blue" | "purple" | "green"
}) {
  const colors = {
    blue: {
      bg: "bg-blue-500/10",
      icon: "text-blue-500",
      border: "border-blue-500/20",
    },
    purple: {
      bg: "bg-purple-500/10",
      icon: "text-purple-500",
      border: "border-purple-500/20",
    },
    green: {
      bg: "bg-green-500/10",
      icon: "text-green-500",
      border: "border-green-500/20",
    },
  }

  const c = colors[color]

  return (
    <div className="border border-border rounded-xl p-5 bg-card flex flex-col gap-4 hover:bg-accent/30 transition-colors">
      <div className={`w-9 h-9 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center`}>
        <Icon size={16} className={c.icon} />
      </div>
      <div>
        <div className="text-3xl font-semibold tracking-tight font-mono">
          {value}
        </div>
        <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
      </div>
    </div>
  )
}