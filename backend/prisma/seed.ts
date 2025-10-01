import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function main() {
  const email = "admin@local";
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash }
  });
}
main().finally(() => prisma.$disconnect());


  