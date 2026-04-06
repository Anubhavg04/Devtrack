"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function saveProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const username = formData.get("username") as string
  const displayName = formData.get("displayName") as string
  const avatar = formData.get("avatar") as string
  const avatarColor = formData.get("avatarColor") as string

  if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
    throw new Error("Username must be 3-20 chars, only letters/numbers/_/-")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })
  if (!user) redirect("/login")

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        username: username,
        displayName: displayName || null,
        avatar: avatar ? `${avatar}::${avatarColor}` : avatarColor || null,
      },
    })
  } catch {
    throw new Error("Username already taken!")
  }

  revalidatePath("/settings")
  revalidatePath(`/u/${username}`)
  redirect("/dashboard")
}