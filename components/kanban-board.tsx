"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { KanbanColumn } from "@/components/kanban-column" 
import { listTasks, createTask, updateTask, deleteTask, type Task, type TaskStatus } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: "PENDIENTE", title: "Por Hacer", color: "bg-blue-500" },
  { id: "EN_CURSO", title: "En Progreso", color: "bg-amber-500" },
  { id: "FINALIZADO", title: "Completado", color: "bg-green-500" },
]

export function KanbanBoard() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState("")
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const data = await listTasks()
      setTasks(data)
      setError("")
    } catch (err) {
      if (err instanceof Error && err.message === "Sesión expirada") {
        router.push("/login")
      } else {
        setError("Error al cargar las tareas")
      }
    } finally { 
      setLoading(false)
    }
  }

 const handleCreateTask = async (title: string, status: TaskStatus) => {
  const result = await createTask(title, status)

  if (result.success && result.task) {
    setTasks([...tasks, result.task]) 
    setError("")
  } else {
    setError(result.error || "Error al crear la tarea")
  }
}
  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id)
      setTasks(tasks.filter((task) => task.id !== id))
      setError("")
    } catch (err) {
      setError("Error al eliminar la tarea")
    }
  }

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (status: TaskStatus) => {
    if (!draggedTask || draggedTask.status === status) {
      setDraggedTask(null)
      return
    }

    try {
      await updateTask(draggedTask.id, { status })
      setTasks(tasks.map((task) => (task.id === draggedTask.id ? { ...task, status } : task)))
      setError("")
    } catch (err) {
      setError("Error al mover la tarea")
    }

    setDraggedTask(null)
  }

  if (loading) {
    return <div className="text-center py-8">Cargando tareas...</div>
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasks.filter((task) => task.status === column.id)}
            onCreateTask={handleCreateTask}
            onDeleteTask={handleDeleteTask}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  )
}