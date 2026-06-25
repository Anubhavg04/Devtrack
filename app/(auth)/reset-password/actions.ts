"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export async function resetPassword(formData: FormData) {
  const token = formData.get("token") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!token || !password || !confirmPassword) {
    return { error: "All fields are required" }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  if (password.length < 8) return { error: "Password must be at least 8 characters" }
  if (!/[a-z]/.test(password)) return { error: "Password must contain a lowercase letter" }
  if (!/[0-9]/.test(password)) return { error: "Password must contain a number" }
  if (!/[^a-zA-Z0-9]/.test(password)) return { error: "Password must contain a special character" }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token }
  })

  if (!verificationToken) {
    return { error: "Invalid or expired reset token" }
  }

  if (new Date() > verificationToken.expires) {
    await prisma.verificationToken.delete({ where: { token } })
    return { error: "This reset link has expired. Please request a new one." }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  // Update the user's password
  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { password: hashedPassword }
  })

  // Delete the token so it can't be reused
  await prisma.verificationToken.delete({
    where: { token }
  })

  redirect("/login?reset=1")
}
