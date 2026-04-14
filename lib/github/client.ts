import { prisma } from "@/lib/prisma"
import { decryptToken } from "@/lib/github/crypto"

type GitHubRepo = {
  id: number
  name: string
  full_name: string
  private: boolean
  default_branch: string
  html_url: string
  owner: { login: string }
}

type GitHubPull = {
  created_at: string
  merged_at: string | null
}

type GitHubIssue = {
  created_at: string
  pull_request?: { url: string }
}

type GitHubCommit = {
  sha: string
  commit: { author?: { date?: string } }
  author?: { login?: string | null } | null
}

async function githubRequest<T>(token: string, path: string, query = ""): Promise<T> {
  const url = `https://api.github.com${path}${query}`
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "devtrack-app",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`GitHub API failed (${response.status}): ${errorBody}`)
  }

  return response.json() as Promise<T>
}

export async function getGithubToken(userId: string) {
  const account = await prisma.githubAccount.findUnique({
    where: { userId },
    select: { accessToken: true },
  })

  if (!account) return null
  return decryptToken(account.accessToken)
}

export async function getGithubConnection(userId: string) {
  return prisma.githubAccount.findUnique({
    where: { userId },
    select: {
      id: true,
      login: true,
      connectedAt: true,
      lastSyncedAt: true,
    },
  })
}

export async function fetchUserRepos(token: string) {
  const repos = await githubRequest<GitHubRepo[]>(
    token,
    "/user/repos",
    "?sort=updated&per_page=100&type=owner,public,private"
  )
  return repos.map((repo) => ({
    githubRepoId: String(repo.id),
    name: repo.name,
    fullName: repo.full_name,
    owner: repo.owner.login,
    isPrivate: repo.private,
    defaultBranch: repo.default_branch,
    url: repo.html_url,
  }))
}

export async function fetchRepoCommits(token: string, owner: string, name: string, sinceISO: string) {
  return githubRequest<GitHubCommit[]>(
    token,
    `/repos/${owner}/${name}/commits`,
    `?since=${encodeURIComponent(sinceISO)}&per_page=100`
  )
}

export async function fetchRepoPulls(token: string, owner: string, name: string) {
  return githubRequest<GitHubPull[]>(
    token,
    `/repos/${owner}/${name}/pulls`,
    "?state=all&sort=updated&direction=desc&per_page=100"
  )
}

export async function fetchRepoIssues(token: string, owner: string, name: string, sinceISO: string) {
  const issues = await githubRequest<GitHubIssue[]>(
    token,
    `/repos/${owner}/${name}/issues`,
    `?state=all&since=${encodeURIComponent(sinceISO)}&per_page=100`
  )
  return issues.filter((issue) => !issue.pull_request)
}
