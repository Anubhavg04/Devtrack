import { ImageResponse } from "next/og"
import { prisma } from "@/lib/prisma"

export const runtime = "edge"
export const size = { width: 1200, height: 630 }

export default async function OGImage({
  params,
}: {
  params: { username: string }
}) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      name: true,
      displayName: true,
      username: true,
      topics: { select: { sessions: { select: { minutes: true } } } },
      sessions: { select: { date: true } },
      goals: { select: { completed: true } },
    },
  })

  if (!user) return new ImageResponse(<div>Not found</div>)

  const totalMinutes = user.topics.reduce(
    (sum, t) => sum + t.sessions.reduce((s, se) => s + se.minutes, 0), 0
  )
  const completedGoals = user.goals.filter(g => g.completed).length
  const displayName = user.displayName ?? user.name ?? user.username

  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        padding: "60px",
        fontFamily: "monospace",
        color: "#4ade80",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "40px" }}>
        <div style={{
          width: "80px", height: "80px", borderRadius: "50%",
          background: "#14532d", border: "2px solid #166534",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "36px", color: "#4ade80", fontWeight: "bold"
        }}>
          {displayName?.[0]?.toUpperCase()}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ fontSize: "36px", fontWeight: "bold", color: "#86efac" }}>
            {displayName}
          </div>
          <div style={{ fontSize: "18px", color: "#166534" }}>
            @{user.username} · devtrack
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "40px" }}>
        {[
          { label: "total_hours", value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` },
          { label: "topics", value: `${user.topics.length}` },
          { label: "sessions", value: `${user.sessions.length}` },
          { label: "goals_done", value: `${completedGoals}` },
        ].map((s) => (
          <div key={s.label} style={{
            background: "#052e16", border: "1px solid #166534",
            borderRadius: "12px", padding: "20px 28px",
            display: "flex", flexDirection: "column", gap: "6px"
          }}>
            <div style={{ fontSize: "13px", color: "#166534" }}>{s.label}</div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#4ade80" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: "auto", display: "flex", justifyContent: "space-between",
        alignItems: "center", borderTop: "1px solid #166534", paddingTop: "24px"
      }}>
        <div style={{ fontSize: "16px", color: "#166534" }}>
          $ devtrack ~ /u/{user.username}
        </div>
        <div style={{ fontSize: "16px", color: "#4ade80" }}>
          devtrackapp-orcin.vercel.app
        </div>
      </div>
    </div>
  )
}