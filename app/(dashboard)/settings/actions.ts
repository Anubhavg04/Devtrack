"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath, revalidateTag } from "next/cache"
import { getCurrentUser } from "@/lib/getUser"

export async function saveProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const username = (formData.get("username") as string | null)?.trim() ?? ""
  const displayName = formData.get("displayName") as string
  const bio = formData.get("bio") as string
  const avatar = formData.get("avatar") as string
  const avatarColor = formData.get("avatarColor") as string
  const onboarding = formData.get("onboarding") === "1"
  const intent = formData.get("intent")

  const hasUsername = username.length > 0

  if (!onboarding && !hasUsername) {
    throw new Error("Username is required")
  }

  if (hasUsername && !/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
    throw new Error("Username must be 3-20 chars, only letters/numbers/_/-")
  }

  const user = await getCurrentUser()

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        username: hasUsername ? username : user.username ?? null,
        displayName: displayName || null,
        bio: intent === "continue-dashboard" ? user.bio ?? null : (bio?.trim() ? bio.trim().slice(0, 280) : null),
        avatar: avatar ? `${avatar}::${avatarColor}` : avatarColor || null,
      } as never,
    })
  } catch {
    throw new Error("Username already taken!")
  }

  revalidatePath("/settings")
  if (hasUsername) revalidatePath(`/u/${username}`)
  revalidateTag(`settings-${user.id}`, "max")

  if (onboarding || intent === "continue-dashboard") {
    redirect("/dashboard")
  }

  redirect(`/u/${username}`)
}