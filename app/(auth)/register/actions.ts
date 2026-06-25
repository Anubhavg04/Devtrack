"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!email || !password || !confirmPassword) {
    return { error: "All fields are required" }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  // Server-side strict validation
  if (password.length < 8) return { error: "Password must be at least 8 characters" }
  if (!/[a-z]/.test(password)) return { error: "Password must contain a lowercase letter" }
  if (!/[0-9]/.test(password)) return { error: "Password must contain a number" }
  if (!/[^a-zA-Z0-9]/.test(password)) return { error: "Password must contain a special character" }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return { error: "User already exists with this email" }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    }
  })

  redirect("/login?registered=1")
}
