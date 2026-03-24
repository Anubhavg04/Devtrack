import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { addGoal } from "./actions"
import { Button } from "@/components/ui/button"
import { GoalsList } from "./goals-list"

export default async function GoalsPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      goals: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!user) redirect("/login")

  const completed = user.goals.filter((g) => g.completed).length
  const total = user.goals.length

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold py-6 tracking-tight">Goals</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {total === 0
            ? "Set your learning goals"
            : `${completed} of ${total} completed`}
        </p>
      </div>

      {/* Add goal form */}
      <div className="border border-border rounded-xl p-6 flex flex-col gap-4 bg-card">
        <h2 className="font-medium text-sm">Add a new goal</h2>
        <form action={addGoal} className="flex gap-3">
          <input
            name="title"
            placeholder="e.g. Build a full stack app with Next.js"
            required
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button type="submit" size="sm">Add goal</Button>
        </form>
      </div>

      {/* Goals list */}
      {user.goals.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 flex flex-col items-center gap-3 text-center">
          <span className="text-4xl">🎯</span>
          <h3 className="font-semibold">No goals yet</h3>
          <p className="text-muted-foreground text-sm">
            Add your first learning goal above
          </p>
        </div>
      ) : (
        <GoalsList goals={user.goals} />
      )}

    </div>
  )
}