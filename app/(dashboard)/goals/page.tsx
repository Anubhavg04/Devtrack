import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { addGoal, toggleGoal, deleteGoal } from "./actions"
import { Button } from "@/components/ui/button"

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
        <h1 className="text-2xl font-bold">Goals</h1>
        <p className="text-muted-foreground mt-1">
          {total === 0
            ? "Set your learning goals"
            : `${completed} of ${total} completed`}
        </p>
      </div>

      {/* Add goal form */}
      <div className="border border-border rounded-xl p-6 flex flex-col gap-4">
        <h2 className="font-semibold">Add a new goal</h2>
        <form action={addGoal} className="flex gap-3">
          <input
            name="title"
            placeholder="e.g. Build a full stack app with Next.js"
            required
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button type="submit">Add goal</Button>
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
        <div className="flex flex-col gap-3">
          {user.goals.map((goal) => (
            <div
              key={goal.id}
              className="border border-border rounded-xl px-5 py-4 flex items-center gap-4"
            >
              {/* Toggle checkbox */}
              <form action={toggleGoal.bind(null, goal.id, !goal.completed)}>
                <button
                  type="submit"
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    goal.completed
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {goal.completed && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </form>

              {/* Goal title */}
              <span
                className={`flex-1 text-sm ${
                  goal.completed
                    ? "line-through text-muted-foreground"
                    : ""
                }`}
              >
                {goal.title}
              </span>

              {/* Delete */}
              <form action={deleteGoal.bind(null, goal.id)}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                >
                  Delete
                </Button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}