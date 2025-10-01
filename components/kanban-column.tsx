"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { KanbanTask } from "./kanban-task"
import { Plus } from "lucide-react"
import type { Task, TaskStatus } from "@/lib/api"

interface KanbanColumnProps {
  column: { id: TaskStatus; title: string; color: string }
  tasks: Task[]
  onCreateTask: (title: string, status: TaskStatus) => void
  onDeleteTask: (id: number) => void
  onDragStart: (task: Task) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (status: TaskStatus) => void
}

export function KanbanColumn({
  column,
  tasks,
  onCreateTask,
  onDeleteTask,
  onDragStart,
  onDragOver,
  onDrop,
}: KanbanColumnProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")

  const handleCreateClick = () => {
    setIsCreating(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (newTaskTitle.trim()) {
        onCreateTask(newTaskTitle, column.id)
        setNewTaskTitle("")
        setIsCreating(false)
      }
    } else if (e.key === "Escape") {
      setNewTaskTitle("")
      setIsCreating(false)
    }
  }

  const handleBlur = () => {
    if (newTaskTitle.trim()) {
      onCreateTask(newTaskTitle, column.id)
    }
    setNewTaskTitle("")
    setIsCreating(false)
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-16rem)]" onDragOver={onDragOver} onDrop={() => onDrop(column.id)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${column.color}`} />
          <CardTitle className="text-lg font-semibold">{column.title}</CardTitle>
          <span className="ml-auto text-sm text-muted-foreground">{tasks.length}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-2">
        {tasks.map((task) => (
          <KanbanTask key={task.id} task={task} onDelete={onDeleteTask} onDragStart={onDragStart} />
        ))}
        {isCreating ? (
          <Input
            autoFocus
            placeholder="Nombre de la tarea..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="bg-white"
          />
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleCreateClick}
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear tarea
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
