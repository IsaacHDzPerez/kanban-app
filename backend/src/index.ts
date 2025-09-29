import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

// Define el tipo Status basado en tu enum
type Status = "PENDIENTE" | "EN_CURSO" | "FINALIZADO";

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

function auth(req: any, res: any, next: any) {
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

app.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
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
});

app.get("/tasks", auth, async (req: any, res) => {
  const userId = Number(req.user.sub);
  const tasks = await prisma.task.findMany({ where: { userId } });
  res.json(tasks);
});

app.post("/tasks", auth, async (req: any, res) => {
  const userId = Number(req.user.sub);
  const { title, status } = req.body || {};
  if (!title?.trim()) return res.status(400).json({ error: "Título requerido" });
  try {
    const t = await prisma.task.create({
      data: { 
        title: title.trim(), 
        status: (status as Status) || "PENDIENTE", 
        userId 
      }
    });
    res.status(201).json(t);
  } catch { 
    return res.status(409).json({ error: "Duplicado" }); 
  }
});

app.patch("/tasks/:id", auth, async (req: any, res) => {
  const userId = Number(req.user.sub);
  const id = Number(req.params.id);
  const data: any = {};
  if (req.body.title) data.title = String(req.body.title);
  if (req.body.status) data.status = req.body.status as Status;
  const t = await prisma.task.update({ where: { id }, data });
  if (t.userId !== userId) return res.status(403).json({ error: "Forbidden" });
  res.json(t);
});

app.delete("/tasks/:id", auth, async (req: any, res) => {
  const userId = Number(req.user.sub);
  const id = Number(req.params.id);
  const t = await prisma.task.delete({ where: { id } });
  if (t.userId !== userId) return res.status(403).json({ error: "Forbidden" });
  res.status(204).end();
});

app.listen(4000, () => console.log("API on http://localhost:4000"));