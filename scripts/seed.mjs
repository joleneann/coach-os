import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("coach123", 12);

  const coach = await prisma.user.upsert({
    where: { email: "coach@test.dev" },
    update: {},
    create: {
      email: "coach@test.dev",
      name: "Jolene Fernandes",
      passwordHash,
      role: "COACH",
      credentials: "Clinical Nutritionist",
      bio: "Nutrition and lifestyle coach",
    },
  });

  console.log("Coach account created:", coach.email);

  const clientHash = await bcrypt.hash("client123", 12);
  const client = await prisma.user.upsert({
    where: { email: "client@test.dev" },
    update: {},
    create: {
      email: "client@test.dev",
      name: "Arjun Mehta",
      passwordHash: clientHash,
      role: "CLIENT",
      coachId: coach.id,
      age: 28,
      gender: "Male",
      status: "INTAKE",
    },
  });

  console.log("Test client created:", client.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
