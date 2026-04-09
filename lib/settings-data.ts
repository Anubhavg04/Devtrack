import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

export const getSettingsData = (userId: string) =>
  unstable_cache(
    async () => {
      return prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          name: true,
          displayName: true,
          avatar: true,
        },
      })
    },
    [`settings-${userId}`],
    { tags: [`settings-${userId}`], revalidate: 300 }
  )()
