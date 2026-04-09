import { unstable_cache } from "next/cache"
import { subDays } from "date-fns"
import { prisma } from "@/lib/prisma"

export const getDashboardData = (userId: string) =>
  unstable_cache(
    async () => {
      const [topicsCount, goalsCount, completedGoals, sessions, recentTopicsRaw, activeGoals] =
        await Promise.all([
          prisma.topic.count({ where: { userId } }),
          prisma.goal.count({ where: { userId } }),
          prisma.goal.count({ where: { userId, completed: true } }),
          prisma.session.groupBy({
            by: ["date"],
            where: {
              userId,
              date: { gte: subDays(new Date(), 364) },
            },
            _sum: { minutes: true },
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

      const topicIds = recentTopicsRaw.map((t) => t.id)
      const topicMinutes =
        topicIds.length === 0
          ? []
          : await prisma.session.groupBy({
              by: ["topicId"],
              where: {
                userId,
                topicId: { in: topicIds },
              },
              _sum: { minutes: true },
            })

      const topicMinutesById = new Map(
        topicMinutes.map((row) => [row.topicId, row._sum.minutes ?? 0])
      )

      const recentTopics = recentTopicsRaw.map((topic) => ({
        ...topic,
        minutes: topicMinutesById.get(topic.id) ?? 0,
      }))

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
