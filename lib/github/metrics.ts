import { unstable_cache } from "next/cache"
import { subDays } from "date-fns"
import { prisma } from "@/lib/prisma"
import { fetchUserRepos, getGithubConnection, getGithubToken } from "@/lib/github/client"

async function loadReposDashboardData(userId: string) {
  const [connection, trackedRepos, recentSnapshots] = await Promise.all([
    getGithubConnection(userId),
    prisma.trackedRepo.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.repoSnapshot.findMany({
      where: {
        trackedRepo: { userId },
        snapshotDate: { gte: subDays(new Date(), 30) },
      },
      orderBy: { snapshotDate: "asc" },
      include: {
        trackedRepo: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    }),
  ])

  const latestSnapshotByRepo = new Map<string, (typeof recentSnapshots)[number]>()
  for (const snapshot of recentSnapshots) {
    latestSnapshotByRepo.set(snapshot.trackedRepoId, snapshot)
  }

  const repoRows = trackedRepos.map((repo) => {
    const latest = latestSnapshotByRepo.get(repo.id)
    return {
      ...repo,
      metrics: {
        commitCount7d: latest?.commitCount7d ?? 0,
        prOpened7d: latest?.prOpened7d ?? 0,
        prMerged7d: latest?.prMerged7d ?? 0,
        issuesOpened7d: latest?.issuesOpened7d ?? 0,
        contributorsCount: latest?.contributorsCount ?? 0,
        activeDays7d: latest?.activeDays7d ?? 0,
      },
    }
  })

  const totalCommits7d = repoRows.reduce((sum, repo) => sum + repo.metrics.commitCount7d, 0)
  const activeRepos = repoRows.filter((repo) => repo.status !== "completed")
  const completedRepos = repoRows.filter((repo) => repo.status === "completed")

  const mostActiveRepo = [...repoRows].sort(
    (a, b) => b.metrics.commitCount7d - a.metrics.commitCount7d
  )[0]

  const trendByDate = new Map<string, number>()
  for (const snapshot of recentSnapshots) {
    const key = snapshot.snapshotDate.toISOString().slice(0, 10)
    trendByDate.set(key, (trendByDate.get(key) ?? 0) + snapshot.commitCount7d)
  }

  const commitTrend = [...trendByDate.entries()].map(([date, commits]) => ({ date, commits }))

  return {
    connection,
    repos: repoRows,
    summary: {
      totalRepos: repoRows.length,
      activeRepos: activeRepos.length,
      completedRepos: completedRepos.length,
      totalCommits7d,
      mostActiveRepo: mostActiveRepo?.fullName ?? null,
    },
    statusBreakdown: [
      { label: "planned", value: repoRows.filter((repo) => repo.status === "planned").length },
      {
        label: "in_progress",
        value: repoRows.filter((repo) => repo.status === "in_progress").length,
      },
      {
        label: "completed",
        value: repoRows.filter((repo) => repo.status === "completed").length,
      },
    ],
    commitTrend,
  }
}

export const getReposDashboardData = (userId: string) =>
  unstable_cache(
    async () => loadReposDashboardData(userId),
    [`github-repos-${userId}`],
    { tags: [`github-repos-${userId}`, `github-metrics-${userId}`], revalidate: 300 }
  )()

export const getReposDashboardDataLive = (userId: string) => loadReposDashboardData(userId)

export async function getSelectableGithubRepos(userId: string) {
  const token = await getGithubToken(userId)
  if (!token) return []

  const [repos, tracked] = await Promise.all([
    fetchUserRepos(token),
    prisma.trackedRepo.findMany({
      where: { userId },
      select: { githubRepoId: true },
    }),
  ])

  const trackedIds = new Set(tracked.map((repo) => repo.githubRepoId))
  return repos.filter((repo) => !trackedIds.has(repo.githubRepoId))
}
