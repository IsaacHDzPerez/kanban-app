import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@local";
  const pass  = process.env.SEED_ADMIN_PASSWORD || "admin123";
  const hash  = await bcrypt.hash(pass, 10);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash: hash },  
    create: { email, passwordHash: hash }
  });

  console.log("Seed ok:", email);
}

main().finally(() => prisma.$disconnect());
