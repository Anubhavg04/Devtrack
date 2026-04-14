"use client"

import { useMemo, useState } from "react"

type RepoOption = {
  githubRepoId: string
  fullName: string
  isPrivate: boolean
  defaultBranch: string | null
}

export function RepoImportSelector({ repos }: { repos: RepoOption[] }) {
  const initialState = useMemo(
    () =>
      repos.reduce<Record<string, boolean>>((acc, repo) => {
        acc[repo.githubRepoId] = false
        return acc
      }, {}),
    [repos]
  )
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>(initialState)

  const selectedCount = Object.values(checkedMap).filter(Boolean).length

  const selectAll = () =>
    setCheckedMap(
      repos.reduce<Record<string, boolean>>((acc, repo) => {
        acc[repo.githubRepoId] = true
        return acc
      }, {})
    )

  const clearAll = () =>
    setCheckedMap(
      repos.reduce<Record<string, boolean>>((acc, repo) => {
        acc[repo.githubRepoId] = false
        return acc
      }, {})
    )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{selectedCount} selected</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="px-2.5 py-1.5 rounded-md border border-border text-xs hover:bg-accent"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="px-2.5 py-1.5 rounded-md border border-border text-xs hover:bg-accent"
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {repos.map((repo) => (
          <label
            key={repo.githubRepoId}
            className="border border-border rounded-lg p-3 flex items-center justify-between gap-3 bg-background"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{repo.fullName}</div>
              <div className="text-xs text-muted-foreground truncate">
                {repo.isPrivate ? "private" : "public"} - {repo.defaultBranch ?? "main"}
              </div>
            </div>
            <input
              type="checkbox"
              name="repoIds"
              value={repo.githubRepoId}
              checked={checkedMap[repo.githubRepoId] ?? false}
              onChange={(e) => {
                setCheckedMap((prev) => ({ ...prev, [repo.githubRepoId]: e.target.checked }))
              }}
            />
          </label>
        ))}
      </div>
    </div>
  )
}
