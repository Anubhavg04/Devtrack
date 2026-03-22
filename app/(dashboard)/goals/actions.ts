"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function getUser() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    update: {},
    create: {
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    },
  })
  return user
}

export async function addGoal(formData: FormData) {
  const user = await getUser()
  const title = formData.get("title") as string
  if (!title?.trim()) return

  await prisma.goal.create({
    data: { title: title.trim(), userId: user.id },
  })

  revalidatePath("/goals")
}

export async function toggleGoal(goalId: string, completed: boolean) {
  const user = await getUser()

  await prisma.goal.update({
    where: { id: goalId, userId: user.id },
    data: { completed },
  })

  revalidatePath("/goals")
}

export async function deleteGoal(goalId: string) {
  const user = await getUser()

  await prisma.goal.delete({
    where: { id: goalId, userId: user.id },
  })

  revalidatePath("/goals")
}