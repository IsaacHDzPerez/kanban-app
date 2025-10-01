"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, GripVertical } from "lucide-react"
import type { Task } from "@/lib/api"

interface KanbanTaskProps {
  task: Task
  onDelete: (id: number) => void
  onDragStart: (task: Task) => void
}

export function KanbanTask({ task, onDelete, onDragStart }: KanbanTaskProps) {
  return (
    <Card
      draggable
      onDragStart={() => onDragStart(task)}
      className="p-3 cursor-move hover:shadow-md transition-shadow group bg-white"
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <p className="flex-1 text-sm leading-relaxed">{task.title}</p>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  )
}
