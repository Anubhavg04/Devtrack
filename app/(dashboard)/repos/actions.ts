"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { signIn } from "@/auth"
import { getCurrentUser } from "@/lib/getUser"
import { importSelectedRepos, syncAllTrackedRepos, syncTrackedRepo } from "@/lib/github/sync"
import { prisma } from "@/lib/prisma"

export async function connectGithub() {
  const user = await getCurrentUser()
  const cookieStore = await cookies()
  cookieStore.set("github_link_user_id", user.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  })
  await signIn("github", { redirectTo: "/repos" })
}

export async function importRepos(formData: FormData) {
  const user = await getCurrentUser()
  const selectedIds = formData.getAll("repoIds").map((id) => String(id))
  if (selectedIds.length === 0) {
    redirect("/repos?error=select-repository")
  }

  try {
    await importSelectedRepos(user.id, selectedIds)
  } catch {
    redirect("/repos?error=import-failed")
  }
  revalidateTag(`github-repos-${user.id}`, "max")
  revalidateTag(`github-metrics-${user.id}`, "max")
  revalidatePath("/repos")
  revalidatePath("/analytics")
  redirect("/repos?imported=1")
}

export async function updateRepoStatus(formData: FormData) {
  const user = await getCurrentUser()
  const repoId = String(formData.get("repoId") ?? "")
  const status = String(formData.get("status") ?? "")

  if (!repoId || !["planned", "in_progress", "completed"].includes(status)) {
    redirect("/repos?error=invalid-status")
  }

  try {
    await prisma.trackedRepo.updateMany({
      where: { id: repoId, userId: user.id },
      data: {
        status: status as "planned" | "in_progress" | "completed",
        startedAt: status === "in_progress" ? new Date() : null,
        completedAt: status === "completed" ? new Date() : null,
      },
    })
  } catch {
    redirect("/repos?error=status-update-failed")
  }

  revalidateTag(`github-repos-${user.id}`, "max")
  revalidateTag(`github-metrics-${user.id}`, "max")
  revalidatePath("/repos")
  revalidatePath("/analytics")
}

export async function syncOneRepo(formData: FormData) {
  const user = await getCurrentUser()
  const repoId = String(formData.get("repoId") ?? "")
  if (!repoId) redirect("/repos?error=invalid-repo")

  try {
    await syncTrackedRepo(user.id, repoId)
  } catch {
    redirect("/repos?error=sync-failed")
  }
  revalidateTag(`github-repos-${user.id}`, "max")
  revalidateTag(`github-metrics-${user.id}`, "max")
  revalidatePath("/repos")
  revalidatePath("/analytics")
}

export async function syncRepos() {
  const user = await getCurrentUser()
  const result = await syncAllTrackedRepos(user.id)
  revalidateTag(`github-repos-${user.id}`, "max")
  revalidateTag(`github-metrics-${user.id}`, "max")
  revalidatePath("/repos")
  revalidatePath("/analytics")
  if (result.failed > 0) {
    redirect("/repos?error=partial-sync")
  }
}
