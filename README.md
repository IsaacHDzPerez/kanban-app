# Kanban Board

> Aplicación web full stack de gestión de tareas con autenticación JWT y persistencia en PostgreSQL

Aplicación tipo Kanban que permite a los usuarios organizar tareas en tres estados: Pendiente, En Curso y Finalizado. 
---

## Stack Tecnológico

**Frontend**
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react

**Backend**
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT (jsonwebtoken)
- bcryptjs

---

## Requisitos Previos

- Node.js 18+
- PostgreSQL 12+
- npm o yarn

---

## Instalación

### 1. Clonar repositorio

```bash
git clone https://github.com/IsaacHDzPerez/kanban-app.git
cd kanban-app
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Modificar archivo `.env`:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/kanban_db"
JWT_SECRET="tu_secreto_super_seguro_cambialo_en_produccion"
```

Inicializar base de datos:

```bash
# Ejecutar migraciones
npx prisma migrate dev

# Generar cliente Prisma
npx prisma generate

# Crear usuario de prueba
npx prisma db seed
```

### 3. Configurar Frontend

```bash
cd ..
npm install
```

---

## Uso

### Desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend disponible en `http://localhost:4000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Frontend disponible en `http://localhost:3000`

### Credenciales de Prueba

```
Email: admin@local
Password: admin123
```


### Token


- Token JWT con expiración de 7 días



## Autor

**Isaac Hernández Pérez**

[![GitHub](https://img.shields.io/badge/GitHub-IsaacHDzPerez-181717?style=flat&logo=github)](https://github.com/IsaacHDzPerez)

---

**Creado con** Next.js • Express • Prisma • PostgreSQL