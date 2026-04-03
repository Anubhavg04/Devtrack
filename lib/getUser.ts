import { auth } from "@/auth"
import { prisma } from "./prisma"
import { redirect } from "next/navigation"

export async function getUserId() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) {
    redirect("/login")
  }

  return user.id
}