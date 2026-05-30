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
  const onboarding = formData.get("onboarding") === "1"
  const intent = (formData.get("intent") as string | null) ?? ""

  const hasUsername = username.length > 0

  if (!onboarding && !hasUsername) {
    redirect("/settings?error=Username%20is%20required")
  }

  if (hasUsername && !/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
    redirect(`/settings?${onboarding ? 'onboarding=1&' : ''}error=Username%20must%20be%203-20%20chars,%20only%20letters/numbers/_/-`)
  }

  const user = await getCurrentUser()

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        username: hasUsername ? username : user.username ?? null,
        displayName: displayName || null,
        bio: bio?.trim() ? bio.trim().slice(0, 280) : null,
        avatar: avatar || null,
      } as never,
    })
  } catch (e: any) {
    // If it's a unique constraint violation for username
    if (e.code === 'P2002') {
      redirect(`/settings?${onboarding ? 'onboarding=1&' : ''}error=That%20username%20is%20already%20taken!%20Please%20try%20another%20one.`)
    }
    redirect(`/settings?${onboarding ? 'onboarding=1&' : ''}error=Something%20went%20wrong.%20Please%20try%20again.`)
  }

  revalidatePath("/settings")
  revalidatePath("/share")
  if (hasUsername) revalidatePath(`/u/${username}`)
  revalidateTag(`settings-${user.id}`)

  if (onboarding || intent === "continue-dashboard") {
    redirect("/dashboard")
  }

  redirect("/settings?success=1")
}