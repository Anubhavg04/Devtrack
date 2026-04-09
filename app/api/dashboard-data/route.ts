import { NextResponse } from "next/server"
import { getUserId } from "@/lib/getUser"
import { getDashboardData } from "@/lib/dashboard-data"

export async function GET() {
  const userId = await getUserId()
  const data = await getDashboardData(userId)

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "private, s-maxage=60, stale-while-revalidate=300",
    },
  })
}
