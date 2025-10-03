import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

type Status = "PENDIENTE" | "EN_CURSO" | "FINALIZADO";

type LoginBody = { email: string; password: string };
type CreateTaskBody = { title: string; status?: Status };
type UpdateTaskBody = { title?: string; status?: Status };

interface AuthRequest<P = any, ResBody = any, ReqBody = any, Q = any>
  extends Request<P, ResBody, ReqBody, Q> {
  user?: any;
}

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.FRONT_ORIGIN
].filter(Boolean) as string[];

app.use(
  cors({
    origin: true,  
    credentials: true,
  })
);

app.use(express.json());

app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));

// Auth 
function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET as string);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Login
app.post(
  "/login",
  async (req: Request<{}, {}, LoginBody>, res: Response) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email/password required" });

    const u = await prisma.user.findUnique({ where: { email } });
    if (!u) return res.status(401).json({ error: "Credenciales" });

    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) return res.status(401).json({ error: "Credenciales" });

    const token = jwt.sign(
      { sub: u.id, email: u.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );
    res.json({ token });
  }
);

// Listar tareas
app.get("/tasks", auth, async (req: AuthRequest, res: Response) => {
  const userId = Number(req.user?.sub);
  const tasks = await prisma.task.findMany({ where: { userId }, orderBy: { id: "asc" } });
  res.json(tasks);
});

// Crear tarea
app.post(
  "/tasks",
  auth,
  async (req: AuthRequest<{}, any, CreateTaskBody>, res: Response) => {
    const userId = Number(req.user?.sub);
    const { title, status } = req.body || {};
    if (!title?.trim()) return res.status(400).json({ error: "Título requerido" });

    const st: Status = (["PENDIENTE", "EN_CURSO", "FINALIZADO"] as const).includes(
      (status as Status)
    )
      ? (status as Status)
      : "PENDIENTE";

    try {
      const t = await prisma.task.create({
        data: { title: title.trim(), status: st, userId },
      });
      return res.status(201).json(t);
    } catch (e: any) {
      if (e?.code === "P2002") return res.status(409).json({ error: "Duplicado" });
      throw e;
    }
  }
);

// Actualizar tarea
app.patch(
  "/tasks/:id",
  auth,
  async (req: AuthRequest<{ id: string }, any, UpdateTaskBody>, res: Response) => {
    const userId = Number(req.user?.sub);
    const id = Number(req.params.id);

    const exists = await prisma.task.findFirst({ where: { id, userId } });
    if (!exists) return res.status(404).json({ error: "Not found" });

    const data: { title?: string; status?: Status } = {};
    if (typeof req.body.title === "string" && req.body.title.trim()) data.title = req.body.title.trim();
    if (typeof req.body.status === "string" && ["PENDIENTE", "EN_CURSO", "FINALIZADO"].includes(req.body.status))
      data.status = req.body.status as Status;

    try {
      const t = await prisma.task.update({ where: { id }, data });
      return res.json(t);
    } catch (e: any) {
      if (e?.code === "P2002") return res.status(409).json({ error: "Duplicado" });
      throw e;
    }
  }
);

// Borrar tarea
app.delete(
  "/tasks/:id",
  auth,
  async (req: AuthRequest<{ id: string }>, res: Response) => {
    const userId = Number(req.user?.sub);
    const id = Number(req.params.id);

    const exists = await prisma.task.findFirst({ where: { id, userId } });
    if (!exists) return res.status(404).json({ error: "Not found" });

    await prisma.task.delete({ where: { id } });
    res.status(204).end();
  }
);

// escuchar por port
app.listen(process.env.PORT || 4000, () => {
  console.log("API on", process.env.PORT || 4000);
});
