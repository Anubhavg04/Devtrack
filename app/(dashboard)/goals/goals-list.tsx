"use client"

import { useState } from "react"
import confetti from "canvas-confetti"
import { toggleGoal, deleteGoal } from "./actions"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

type Goal = {
  id: string
  title: string
  completed: boolean
}

type Props = {
  goals: Goal[]
}

export function GoalsList({ goals }: Props) {
  const [pendingId, setPendingId] = useState<string | null>(null)

  const handleToggle = async (goalId: string, completed: boolean) => {
    setPendingId(goalId)

    // If completing a goal, fire confetti first
    if (!completed) {
      fireConfetti()
    }

    await toggleGoal(goalId, !completed)
    setPendingId(null)
  }

  return (
    <div className="flex flex-col gap-3">
      {goals.map((goal) => (
        <div
          key={goal.id}
          className={`border border-border rounded-xl px-5 py-4 flex items-center gap-4 transition-all ${
            goal.completed ? "opacity-60" : ""
          }`}
        >
          {/* Checkbox */}
          <button
            onClick={() => handleToggle(goal.id, goal.completed)}
            disabled={pendingId === goal.id}
            className={`
              w-5 h-5 rounded border-2 flex items-center justify-center
              transition-all duration-200 flex-shrink-0
              ${goal.completed
                ? "bg-green-500 border-green-500 text-white scale-110"
                : "border-border hover:border-green-500"
              }
              ${pendingId === goal.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {goal.completed && (
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>

          {/* Title */}
          <span
            className={`flex-1 text-sm transition-all ${
              goal.completed
                ? "line-through text-muted-foreground"
                : "text-foreground"
            }`}
          >
            {goal.title}
          </span>

          {/* Delete */}
          <form action={deleteGoal.bind(null, goal.id)}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
            >
              <Trash2 size={14} />
            </Button>
          </form>
        </div>
      ))}
    </div>
  )
}

function fireConfetti() {
  // First burst from left
  confetti({
    particleCount: 60,
    spread: 55,
    origin: { x: 0.3, y: 0.6 },
    colors: ["#22c55e", "#16a34a", "#86efac", "#ffffff"],
    ticks: 200,
  })

  // Second burst from right
  setTimeout(() => {
    confetti({
      particleCount: 60,
      spread: 55,
      origin: { x: 0.7, y: 0.6 },
      colors: ["#22c55e", "#16a34a", "#86efac", "#ffffff"],
      ticks: 200,
    })
  }, 100)

  // Final center burst
  setTimeout(() => {
    confetti({
      particleCount: 30,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
      colors: ["#22c55e", "#f59e0b", "#3b82f6", "#ffffff"],
      ticks: 150,
      scalar: 0.8,
    })
  }, 200)
}