"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { KanbanBoard } from "@/components/kanban-board"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { logout, isAuthenticated } from "@/lib/api"

export default function BoardPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
    } else {
      setMounted(true)
    }
  }, [router])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Tablero Kanban</h1>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <KanbanBoard />
      </main>
    </div>
  )
}