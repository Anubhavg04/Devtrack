"use client"

import { useState, useTransition, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { updateGoalStatus, deleteGoal } from "./actions"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import confetti from "canvas-confetti"

type Goal = {
  id: string
  title: string
  status: string
  completed: boolean
}

type Props = {
  goals: Goal[]
}

const COLUMNS = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" }
]

export function KanbanBoard({ goals: initialGoals }: Props) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [isPending, startTransition] = useTransition()
  
  // Need to wait for mount to avoid hydration mismatch with dnd
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  // Sync state if props change
  useEffect(() => setGoals(initialGoals), [initialGoals])

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStatus = destination.droppableId
    const oldStatus = source.droppableId

    // Optimistic update
    setGoals((prev) => 
      prev.map(g => g.id === draggableId ? { ...g, status: newStatus, completed: newStatus === "done" } : g)
    )

    if (newStatus === "done" && oldStatus !== "done") {
      fireConfetti()
    }

    startTransition(async () => {
      try {
        await updateGoalStatus(draggableId, newStatus)
      } catch {
        // Revert on error
        setGoals(initialGoals)
      }
    })
  }

  const handleDelete = (goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId))
    startTransition(async () => {
      try {
        await deleteGoal(goalId)
      } catch {
        setGoals(initialGoals)
      }
    })
  }

  if (!isMounted) return <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">Loading board...</div>

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map(col => {
          const colGoals = goals.filter(g => (g.status || "todo") === col.id)

          return (
            <div key={col.id} className="flex flex-col bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border font-semibold flex justify-between items-center bg-muted/30">
                {col.title}
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                  {colGoals.length}
                </span>
              </div>
              
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-3 min-h-[150px] flex flex-col gap-3 transition-colors ${
                      snapshot.isDraggingOver ? "bg-muted/50" : ""
                    }`}
                  >
                    {colGoals.map((goal, index) => (
                      <Draggable key={goal.id} draggableId={goal.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`
                              bg-background border border-border p-3 rounded-lg shadow-sm
                              group flex justify-between items-start gap-2 relative
                              ${snapshot.isDragging ? "shadow-md ring-2 ring-primary/20 rotate-2 scale-105 z-50" : ""}
                              ${goal.status === "done" ? "opacity-75" : ""}
                            `}
                            style={provided.draggableProps.style}
                          >
                            <span className={`text-sm flex-1 ${goal.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              {goal.title}
                            </span>
                            
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={isPending}
                              onClick={() => handleDelete(goal.id)}
                              className="text-muted-foreground hover:text-destructive h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}

function fireConfetti() {
  confetti({
    particleCount: 60,
    spread: 55,
    origin: { x: 0.3, y: 0.6 },
    colors: ["#22c55e", "#16a34a", "#86efac", "#ffffff"],
    ticks: 200,
  })

  setTimeout(() => {
    confetti({
      particleCount: 60,
      spread: 55,
      origin: { x: 0.7, y: 0.6 },
      colors: ["#22c55e", "#16a34a", "#86efac", "#ffffff"],
      ticks: 200,
    })
  }, 100)
}
