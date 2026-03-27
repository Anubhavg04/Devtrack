"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function getUser() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) redirect("/login")
  return user
}

function invalidateAll() {
  revalidatePath("/goals")
  revalidatePath("/dashboard")
}

export async function addGoal(formData: FormData) {
  const user = await getUser()
  const title = formData.get("title") as string
  if (!title?.trim()) return

  await prisma.goal.create({
    data: { title: title.trim(), userId: user.id },
  })

  invalidateAll()
}

export async function toggleGoal(goalId: string, completed: boolean) {
  const user = await getUser()

  await prisma.goal.update({
    where: { id: goalId, userId: user.id },
    data: { completed },
  })

  invalidateAll()
}

export async function deleteGoal(goalId: string) {
  const user = await getUser()

  await prisma.goal.delete({
    where: { id: goalId, userId: user.id },
  })

  invalidateAll()
}