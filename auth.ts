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
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user || !user.password) {
          throw new Error("User not found or uses social login");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return user;
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  events: {
    async signIn({ user }) {
      if (user?.id) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          })
        } catch (error) {
          console.error("Failed to update lastLoginAt", error)
        }
      }
    },
  },
})