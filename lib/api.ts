const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

//Tipos
export type TaskStatus = "PENDIENTE" | "EN_CURSO" | "FINALIZADO"

export interface Task {
  id: number
  title: string
  status: TaskStatus
  userId: number
}
//auth headers
function getAuthHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  if (!email.trim() || !password.trim()) {
    return { success: false, error: "Email y contraseña son requeridos" }
  }

  //fetch 

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const error = await res.json()
      return { success: false, error: error.error || "Credenciales inválidas" }
    }

    const { token } = await res.json()
    localStorage.setItem("token", token)
    return { success: true }
  } catch (error) {
    console.error("Error en login:", error)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return { success: false, error: "No se puede conectar al servidor. Verifica que el backend esté corriendo." }
    }
    return { success: false, error: "Error al iniciar sesión" }
  }
}

export function logout(): void {
  localStorage.removeItem("token")
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return !!localStorage.getItem("token")
}
//lista de los task
export async function listTasks(): Promise<Task[]> {
  try {
    const res = await fetch(`${API_URL}/tasks`, {
      headers: getAuthHeaders(),
    })

    if (res.status === 401) {
      localStorage.removeItem("token")
      throw new Error("Sesión expirada")
    }

    if (!res.ok) {
      throw new Error("Error al obtener las tareas")
    }

    return res.json()
  } catch (error) {
    console.error("Error al listar tareas:", error)
    throw error
  }
}
//crear task
export async function createTask(
  title: string,
  status: TaskStatus = "PENDIENTE",
): Promise<{ success: boolean; task?: Task; error?: string }> {
  if (!title.trim()) {
    return { success: false, error: "El título no puede estar vacío" }
  }

  try {
    const res = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ title: title.trim(), status }),
    })

    if (!res.ok) {
      const error = await res.json()
      return { success: false, error: error.error || "Error al crear la tarea" }
    }

    const task = await res.json()
    return { success: true, task }
  } catch (error) {
    console.error("Error al crear tarea:", error)
    return { success: false, error: "Error al crear la tarea" }
  }
}
//act task

export async function updateTask(
  id: number,
  updates: { status?: TaskStatus; title?: string },
): Promise<{ success: boolean; task?: Task; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    })

    if (!res.ok) {
      const error = await res.json()
      return { success: false, error: error.error || "Error al actualizar la tarea" }
    }

    const task = await res.json()
    return { success: true, task }
  } catch (error) {
    console.error("Error al actualizar tarea:", error)
    return { success: false, error: "Error al actualizar la tarea" }
  }
}
//borrar task

export async function deleteTask(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!res.ok) {
      return { success: false, error: "Error al eliminar la tarea" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error al eliminar tarea:", error)
    return { success: false, error: "Error al eliminar la tarea" }
  }
}