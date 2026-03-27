import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { unstable_cache } from "next/cache"
import { addGoal } from "./actions"
import { GoalsList } from "./goals-list"
import { SubmitButton } from "@/components/submitbutton"

const getGoals = (userId: string) =>
  unstable_cache(
    async () => {
      return await prisma.goal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          completed: true,
        },
      })
    },
    [`goals-${userId}`],
    { tags: [`goals-${userId}`] }
  )()

export default async function GoalsPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })
  if (!user) redirect("/login")

  const goals = await getGoals(user.id)

  const completed = goals.filter((g) => g.completed).length
  const total = goals.length

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
          <SubmitButton label="Add goal" loadingLabel="Adding..." size="sm" />
        </form>
      </div>

      {/* Goals list */}
      {goals.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 flex flex-col items-center gap-3 text-center">
          <span className="text-4xl">🎯</span>
          <h3 className="font-semibold">No goals yet</h3>
          <p className="text-muted-foreground text-sm">
            Add your first learning goal above
          </p>
        </div>
      ) : (
        <GoalsList goals={goals} />
      )}

    </div>
  )
}