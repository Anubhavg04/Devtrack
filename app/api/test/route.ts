import { prisma } from "@/lib/prisma"

export async function GET() {
  const user = await prisma.user.create({
    data: {
      email: `test${Date.now()}@gmail.com`, // unique banana zaruri
      name: "Test User"
    }
  })

  return Response.json(user)
}