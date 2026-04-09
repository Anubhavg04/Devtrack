import { cache } from "react"
import { auth } from "@/auth"
import { prisma } from "./prisma"
import { redirect } from "next/navigation"

export const getCurrentUser = cache(async () => {
  const session = await auth()
  if (!session?.user?.email) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      username: true,
      displayName: true,
      avatar: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  return user
})

export async function getUserId() {
  const user = await getCurrentUser()
  return user.id
}