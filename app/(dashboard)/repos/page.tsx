import Link from "next/link"
import { Github, RefreshCw, ChartNoAxesCombined } from "lucide-react"
import { getUserId } from "@/lib/getUser"
import { getReposDashboardDataLive, getSelectableGithubRepos } from "@/lib/github/metrics"
import { connectGithub, importRepos, syncOneRepo, syncRepos, updateRepoStatus } from "./actions"
import { RepoImportSelector } from "./repo-import-selector"

export const dynamic = "force-dynamic"

export default async function ReposPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; imported?: string; github?: string }>
}) {
  const userId = await getUserId()
  const { error, imported, github } = await searchParams
  const [dashboardData, selectableRepos] = await Promise.all([
    getReposDashboardDataLive(userId),
    getSelectableGithubRepos(userId),
  ])

  const hasConnection = Boolean(dashboardData.connection)

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold py-6 tracking-tight flex items-center gap-2">
            <ChartNoAxesCombined className="h-6 w-6" />
            Repos Intelligence
          </h1>
          <p className="text-sm text-muted-foreground">
            Track selected repositories, monitor activity, and mark work as finished.
          </p>
          {dashboardData.connection?.lastSyncedAt ? (
            <p className="text-xs text-muted-foreground mt-1">
              Last synced: {new Date(dashboardData.connection.lastSyncedAt).toLocaleString()}
            </p>
          ) : null}
        </div>
        {hasConnection ? (
          <form action={syncRepos}>
            <button
              type="submit"
              className="px-3 py-2 rounded-lg border border-border text-sm hover:bg-accent flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Sync all
            </button>
          </form>
        ) : null}
      </div>

      {error ? (
        <div className="border border-red-500/30 bg-red-500/5 rounded-xl px-4 py-3 text-sm text-red-400">
          {error === "select-repository"
            ? "Select at least one repository to import."
            : error === "partial-sync"
              ? "Some repositories failed to sync due to API limits or temporary errors."
              : "Something went wrong. Please try again."}
        </div>
      ) : null}
      {imported || github ? (
        <div className="border border-green-500/30 bg-green-500/5 rounded-xl px-4 py-3 text-sm text-green-400">
          {github ? "GitHub connected successfully." : "Repositories imported successfully."}
        </div>
      ) : null}

      {!hasConnection ? (
        <div className="border border-border rounded-xl p-6 flex flex-col gap-3 bg-card">
          <h2 className="font-semibold">Connect GitHub</h2>
          <p className="text-sm text-muted-foreground">
            Connect your account to import selected repositories and unlock analytics.
          </p>
          <form action={connectGithub}>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-accent text-sm flex items-center gap-2"
            >
              <Github size={14} />
              Connect with GitHub
            </button>
          </form>
        </div>
      ) : (
        <>
          {selectableRepos.length > 0 ? (
            <form action={importRepos} className="border border-border rounded-xl p-6 bg-card flex flex-col gap-4">
              <div>
                <h2 className="font-semibold">Import repositories</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Select repositories you want DevTrack to analyze.
                </p>
              </div>

              <RepoImportSelector repos={selectableRepos.slice(0, 30)} />
              <button
                type="submit"
                className="self-start px-4 py-2 rounded-lg border border-border hover:bg-accent text-sm"
              >
                Import selected
              </button>
            </form>
          ) : null}

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard label="Tracked Repos" value={dashboardData.summary.totalRepos} />
            <StatCard label="Active" value={dashboardData.summary.activeRepos} />
            <StatCard label="Completed" value={dashboardData.summary.completedRepos} />
            <StatCard label="Commits (7d)" value={dashboardData.summary.totalCommits7d} />
            <StatCard label="Most Active" value={dashboardData.summary.mostActiveRepo ?? "n/a"} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-border rounded-xl p-5 bg-card">
              <h3 className="font-semibold text-sm mb-3">Status distribution</h3>
              <div className="flex flex-col gap-2">
                {dashboardData.statusBreakdown.map((status) => (
                  <div key={status.label} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{status.label}</span>
                    <span className="font-semibold">{status.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-border rounded-xl p-5 bg-card">
              <h3 className="font-semibold text-sm mb-3">Commit trend (30d snapshots)</h3>
              {dashboardData.commitTrend.length === 0 ? (
                <p className="text-xs text-muted-foreground">No snapshot data yet. Run sync to populate trend.</p>
              ) : (
                <div className="flex flex-col gap-1 max-h-48 overflow-auto pr-1">
                  {dashboardData.commitTrend.slice(-10).map((row) => (
                    <div key={row.date} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{row.date}</span>
                      <span className="font-semibold">{row.commits}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border border-border rounded-xl p-6 bg-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Tracked repositories</h2>
              <Link href="/analytics" className="text-xs text-muted-foreground hover:text-foreground">
                View full analytics
              </Link>
            </div>
            {dashboardData.repos.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No repositories tracked yet. Import one from the section above.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {dashboardData.repos.map((repo) => (
                  <div
                    key={repo.id}
                    className="border border-border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{repo.fullName}</div>
                      <div className="text-xs text-muted-foreground">
                        commits_7d={repo.metrics.commitCount7d} - prs_merged_7d={repo.metrics.prMerged7d} -
                        issues_7d={repo.metrics.issuesOpened7d}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <form action={updateRepoStatus}>
                        <input type="hidden" name="repoId" value={repo.id} />
                        <select
                          name="status"
                          defaultValue={repo.status}
                          className="px-2 py-1.5 rounded-md border border-border bg-background text-xs"
                        >
                          <option value="planned">planned</option>
                          <option value="in_progress">in_progress</option>
                          <option value="completed">completed</option>
                        </select>
                        <button
                          type="submit"
                          className="ml-2 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-accent"
                        >
                          Update
                        </button>
                      </form>
                      <form action={syncOneRepo}>
                        <input type="hidden" name="repoId" value={repo.id} />
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-md border border-border text-xs hover:bg-accent"
                        >
                          Sync
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-border rounded-xl p-4 bg-card">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold mt-1 truncate">{value}</div>
    </div>
  )
}
