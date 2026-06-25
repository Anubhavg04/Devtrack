"use server"

import { prisma } from "@/lib/prisma"
import { v4 as uuidv4 } from "uuid"
import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return { error: "Email is required" }
  }

  const user = await prisma.user.findUnique({
    where: { email }
  })

  // We don't want to leak whether a user exists or not for security reasons.
  if (!user || !user.password) {
    return { success: true }
  }

  // Generate a unique token
  const token = uuidv4()
  const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour from now

  await prisma.verificationToken.deleteMany({
    where: { identifier: email }
  })

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires
    }
  })

  const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`

  // If we have a Resend API key, send the email
  if (resend) {
    try {
      await resend.emails.send({
        from: "DevTrack Security <security@yourdomain.com>", // You will need a verified domain in Resend
        to: email,
        subject: "Reset your DevTrack password",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Reset your password</h2>
            <p>You recently requested to reset your password for your DevTrack account.</p>
            <p>Click the button below to reset it. This link will expire in 1 hour.</p>
            <a href="${resetLink}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
              Reset Password
            </a>
            <p style="margin-top: 32px; font-size: 12px; color: #666;">
              If you did not request a password reset, please ignore this email.
            </p>
          </div>
        `
      })
    } catch (error) {
      console.error("Failed to send email with Resend:", error)
      // Even if email fails, we return success so we don't leak user existence
    }
  }

  // Always log it for local development testing
  console.log("========================================")
  console.log("PASSWORD RESET REQUESTED FOR:", email)
  console.log("RESET LINK:", resetLink)
  console.log("========================================")

  return { success: true }
}
