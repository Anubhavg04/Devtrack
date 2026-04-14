import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

export type SettingsUser = {
  id: string
  email: string
  username: string | null
  name: string | null
  displayName: string | null
  bio: string | null
  avatar: string | null
}

export const getSettingsData = (userId: string) =>
  unstable_cache(
    async () => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          displayName: true,
          bio: true,
          avatar: true,
        },
      } as never)

      return user as SettingsUser | null
    },
    [`settings-${userId}`],
    { tags: [`settings-${userId}`], revalidate: 300 }
  )()
