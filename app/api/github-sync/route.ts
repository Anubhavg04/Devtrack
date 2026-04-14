import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { syncAllTrackedRepos } from "@/lib/github/sync"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  const expected = process.env.CRON_SECRET

  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const accounts = await prisma.githubAccount.findMany({
    select: { userId: true },
  })

  let totalSyncedRepos = 0
  let totalFailedRepos = 0
  for (const account of accounts) {
    const result = await syncAllTrackedRepos(account.userId)
    totalSyncedRepos += result.synced
    totalFailedRepos += result.failed
  }

  return NextResponse.json({
    usersProcessed: accounts.length,
    totalSyncedRepos,
    totalFailedRepos,
  })
}
