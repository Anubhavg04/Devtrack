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
import GitHub from "next-auth/providers/github"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { encryptToken } from "@/lib/github/crypto"

const providers: any[] = [
  Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
  }),
]

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      authorization: { params: { scope: "read:user repo" } },
    })
  )
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        const cookieStore = await cookies()
        const linkUserId = cookieStore.get("github_link_user_id")?.value

        if (account?.provider === "github" && account.access_token && linkUserId) {
          const linkTarget = await prisma.user.findUnique({
            where: { id: linkUserId },
            select: { id: true },
          })
          if (!linkTarget) return false

          const githubProfile = profile as { id?: number | string; login?: string; email?: string } | undefined
          const fallbackLogin =
            githubProfile?.login ??
            user.email?.split("@")[0] ??
            `github-${String(githubProfile?.id ?? account.providerAccountId)}`

          await prisma.githubAccount.upsert({
            where: { userId: linkTarget.id },
            create: {
              userId: linkTarget.id,
              githubUserId: String(githubProfile?.id ?? account.providerAccountId),
              login: fallbackLogin,
              accessToken: await encryptToken(account.access_token),
              scope: account.scope ?? null,
            },
            update: {
              githubUserId: String(githubProfile?.id ?? account.providerAccountId),
              login: fallbackLogin,
              accessToken: await encryptToken(account.access_token),
              scope: account.scope ?? null,
            },
          })

          cookieStore.delete("github_link_user_id")
          return "/repos?github=connected"
        }

        if (!user.email) return false

        let existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, username: true, displayName: true },
        })

        if (!existingUser) {
          existingUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
            },
            select: { id: true, username: true, displayName: true },
          })
        } else {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: user.name,
              image: user.image,
            },
          })
        }

        if (account?.provider === "github" && account.access_token) {
          const githubProfile = profile as { id?: number | string; login?: string } | undefined
          await prisma.githubAccount.upsert({
            where: { userId: existingUser.id },
            create: {
              userId: existingUser.id,
              githubUserId: String(githubProfile?.id ?? account.providerAccountId),
              login: githubProfile?.login ?? user.email.split("@")[0],
              accessToken: await encryptToken(account.access_token),
              scope: account.scope ?? null,
            },
            update: {
              githubUserId: String(githubProfile?.id ?? account.providerAccountId),
              login: githubProfile?.login ?? user.email.split("@")[0],
              accessToken: await encryptToken(account.access_token),
              scope: account.scope ?? null,
            },
          })
          return "/repos?github=connected"
        }

        return existingUser.username ? true : "/settings?onboarding=1"
      } catch (error) {
        console.error("DB error:", error)
        return false
      }
    },
  },
})