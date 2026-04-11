import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("coach123", 12);

  const coach = await prisma.user.upsert({
    where: { email: "jolene@coachOS.dev" },
    update: {},
    create: {
      email: "jolene@coachOS.dev",
      name: "Jolene Fernandes",
      passwordHash,
      role: "COACH",
      credentials: "Clinical Nutritionist",
      bio: "Nutrition and lifestyle coach at BioRhyme",
    },
  });

  console.log("Coach account created:", coach.email);

  // Create a test client
  const clientHash = await bcrypt.hash("client123", 12);
  const client = await prisma.user.upsert({
    where: { email: "nikhil@test.dev" },
    update: {},
    create: {
      email: "nikhil@test.dev",
      name: "Nikhil GS",
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
