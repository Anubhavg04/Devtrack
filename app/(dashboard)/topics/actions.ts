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
  revalidatePath("/topics")
  revalidatePath("/dashboard")
  revalidatePath("/analytics")
}

export async function addTopic(formData: FormData) {
  const user = await getUser()

  const title = formData.get("title") as string
  const description = formData.get("description") as string

  if (!title?.trim()) return

  await prisma.topic.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      userId: user.id,
    },
  })

  invalidateAll()
}

export async function deleteTopic(topicId: string) {
  const user = await getUser()

  await prisma.topic.delete({
    where: { id: topicId, userId: user.id },
  })

  invalidateAll()
}

export async function logSession(formData: FormData) {
  const user = await getUser()

  const topicId = formData.get("topicId") as string
  const minutes = parseInt(formData.get("minutes") as string)
  const note = formData.get("note") as string

  if (!topicId || !minutes) return

  await prisma.session.create({
    data: {
      topicId,
      userId: user.id,
      minutes,
      note: note?.trim() || null,
    },
  })

  invalidateAll()
}