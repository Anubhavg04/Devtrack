// import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
// import { redirect } from "next/navigation"
import { unstable_cache } from "next/cache"
import { getUserId } from "@/lib/getUser"
import { addTopic, deleteTopic, logSession } from "./actions"
import { SubmitButton } from "@/components/submitbutton"


const getTopicsWithStats = (userId: string) =>
  unstable_cache(
    async () => {
      return await prisma.topic.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          _count: {
            select: { sessions: true }, // count done in DB, not in JS
          },
          sessions: {
            select: { minutes: true }, // only fetch minutes, not full session rows
          },
        },
      })
    },
    [`topics-${userId}`],
    { tags: [`topics-${userId}`], revalidate: 300 } // matches revalidateTag in actions.ts
  )()

export default async function TopicsPage() {
  const userId = await getUserId()
  const topics = await getTopicsWithStats(userId)

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl py-6 font-bold">Topics</h1>
        <p className="text-muted-foreground mt-1">
          Track everything you are learning
        </p>
      </div>

      {/* Add topic form */}
      <div className="border border-border rounded-xl p-6 flex flex-col gap-4">
        <h2 className="font-semibold">Add a new topic</h2>
        <form action={addTopic} className="flex flex-col gap-3">
          <input
            name="title"
            placeholder="Topic name e.g. Next.js, TypeScript, DSA"
            required
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            name="description"
            placeholder="Description (optional)"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <SubmitButton
            label="Add topic"
            loadingLabel="Adding..."
            className="self-start"
          />
        </form>
      </div>

      {/* Topics list */}
      {topics.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 flex flex-col items-center gap-3 text-center">
          <span className="text-4xl">📚</span>
          <h3 className="font-semibold">No topics yet</h3>
          <p className="text-muted-foreground text-sm">
            Add your first topic above to start tracking
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {topics.map((topic) => {
            // ✅ Aggregate minutes in JS from the lean sessions array
            const totalMinutes = topic.sessions.reduce(
              (sum, s) => sum + s.minutes,
              0
            )
            const hours = Math.floor(totalMinutes / 60)
            const mins = totalMinutes % 60

            return (
              <div
                key={topic.id}
                className="border border-border rounded-xl p-6 flex flex-col gap-4"
              >
                {/* Topic header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{topic.title}</h3>
                    {topic.description && (
                      <p className="text-muted-foreground text-sm mt-1">
                        {topic.description}
                      </p>
                    )}
                    <p className="text-sm mt-2">
                      <span className="font-medium">
                        {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
                      </span>
                      <span className="text-muted-foreground">
                        {/* ✅ Use _count from DB instead of topic.sessions.length */}
                        {" "}total · {topic._count.sessions} sessions
                      </span>
                    </p>
                  </div>

                  {/* Delete button */}
                  <form action={deleteTopic.bind(null, topic.id)}>
                    <SubmitButton
                      label="Delete"
                      loadingLabel="..."
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                    />
                  </form>
                </div>

                {/* Log session form */}
                <form
                  action={logSession}
                  className="flex items-center gap-2 pt-2 border-t border-border"
                >
                  <input type="hidden" name="topicId" value={topic.id} />
                  <input
                    name="minutes"
                    type="number"
                    placeholder="Minutes studied"
                    min="1"
                    required
                    className="w-40 px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    name="note"
                    placeholder="What did you study? (optional)"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <SubmitButton
                    label="Log session"
                    loadingLabel="Logging..."
                    size="sm"
                    variant="outline"
                  />
                </form>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}