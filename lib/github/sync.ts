import { subDays, startOfDay } from "date-fns"
import { prisma } from "@/lib/prisma"
import {
  fetchRepoCommits,
  fetchRepoIssues,
  fetchRepoPulls,
  fetchUserRepos,
  getGithubToken,
} from "@/lib/github/client"

export async function importSelectedRepos(userId: string, selectedRepoIds: string[]) {
  const token = await getGithubToken(userId)
  if (!token) {
    throw new Error("GitHub account is not connected")
  }

  const repos = await fetchUserRepos(token)
  const selectedRepos = repos.filter((repo) => selectedRepoIds.includes(repo.githubRepoId))

  if (selectedRepos.length === 0) {
    return { imported: 0 }
  }

  await prisma.$transaction(
    selectedRepos.map((repo) =>
      prisma.trackedRepo.upsert({
        where: {
          userId_githubRepoId: {
            userId,
            githubRepoId: repo.githubRepoId,
          },
        },
        create: {
          userId,
          githubRepoId: repo.githubRepoId,
          owner: repo.owner,
          name: repo.name,
          fullName: repo.fullName,
          isPrivate: repo.isPrivate,
          defaultBranch: repo.defaultBranch,
          url: repo.url,
          status: "planned",
        },
        update: {
          owner: repo.owner,
          name: repo.name,
          fullName: repo.fullName,
          isPrivate: repo.isPrivate,
          defaultBranch: repo.defaultBranch,
          url: repo.url,
        },
      })
    )
  )

  return { imported: selectedRepos.length }
}

export async function syncTrackedRepo(userId: string, trackedRepoId: string) {
  const token = await getGithubToken(userId)
  if (!token) {
    throw new Error("GitHub account is not connected")
  }

  const trackedRepo = await prisma.trackedRepo.findFirst({
    where: { id: trackedRepoId, userId },
  })
  if (!trackedRepo) {
    throw new Error("Tracked repository not found")
  }

  const since7d = subDays(new Date(), 7)
  const sinceISO = since7d.toISOString()

  const [commits, pulls, issues] = await Promise.all([
    fetchRepoCommits(token, trackedRepo.owner, trackedRepo.name, sinceISO),
    fetchRepoPulls(token, trackedRepo.owner, trackedRepo.name),
    fetchRepoIssues(token, trackedRepo.owner, trackedRepo.name, sinceISO),
  ])

  const commitCount7d = commits.length
  const commitDays = new Set(
    commits
      .map((commit) => commit.commit.author?.date)
      .filter((date): date is string => Boolean(date))
      .map((date) => date.slice(0, 10))
  )
  const contributors = new Set(
    commits
      .map((commit) => commit.author?.login ?? null)
      .filter((login): login is string => Boolean(login))
  )
  const prOpened7d = pulls.filter((pr) => new Date(pr.created_at) >= since7d).length
  const prMerged7d = pulls.filter((pr) => pr.merged_at && new Date(pr.merged_at) >= since7d).length
  const issuesOpened7d = issues.filter((issue) => new Date(issue.created_at) >= since7d).length

  const latestCommitDate = commits
    .map((commit) => commit.commit.author?.date ?? null)
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1)

  const now = new Date()
  await prisma.$transaction([
    prisma.repoSnapshot.upsert({
      where: {
        trackedRepoId_snapshotDate: {
          trackedRepoId: trackedRepo.id,
          snapshotDate: startOfDay(now),
        },
      },
      create: {
        trackedRepoId: trackedRepo.id,
        snapshotDate: startOfDay(now),
        commitCount7d,
        prOpened7d,
        prMerged7d,
        issuesOpened7d,
        contributorsCount: contributors.size,
        activeDays7d: commitDays.size,
      },
      update: {
        commitCount7d,
        prOpened7d,
        prMerged7d,
        issuesOpened7d,
        contributorsCount: contributors.size,
        activeDays7d: commitDays.size,
      },
    }),
    prisma.trackedRepo.update({
      where: { id: trackedRepo.id },
      data: {
        lastActivityAt: latestCommitDate ? new Date(latestCommitDate) : trackedRepo.lastActivityAt,
      },
    }),
    prisma.githubAccount.update({
      where: { userId },
      data: { lastSyncedAt: now },
    }),
  ])
}

export async function syncAllTrackedRepos(userId: string) {
  const repos = await prisma.trackedRepo.findMany({
    where: { userId },
    select: { id: true },
  })

  let synced = 0
  const failures: string[] = []
  for (const repo of repos) {
    try {
      await syncTrackedRepo(userId, repo.id)
      synced += 1
    } catch (error) {
      failures.push(error instanceof Error ? error.message : "Unknown sync failure")
    }
  }

  return { synced, failed: failures.length, failures }
}
