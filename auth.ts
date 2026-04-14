// import NextAuth from "next-auth"
// import Google from "next-auth/providers/google"

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   trustHost: true,
//   providers: [
//     Google({
//       clientId: process.env.AUTH_GOOGLE_ID,
//       clientSecret: process.env.AUTH_GOOGLE_SECRET,
//     }),
//   ],
//   pages: {
//     signIn: "/login",
//   },
// })

import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, username: true, displayName: true },
        })

        if (existingUser) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: user.name,
              image: user.image,
            },
          })
          return true
        }

        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            image: user.image,
          },
        })

        return "/settings?onboarding=1"
      } catch (error) {
        console.error("DB error:", error)
        return false
      }
    },
  },
})