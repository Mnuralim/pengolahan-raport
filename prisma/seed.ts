import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

async function createAdmin() {
  console.log("Seeding teacher...");

  const defaultTeacher = {
    username: process.env.TEACHER_USERNAME!,
    password: process.env.TEACHER_PASSWORD!,
  };

  const existingTeacher = await prisma.teacher.findFirst({
    where: { username: defaultTeacher.username },
  });

  if (!existingTeacher) {
    const hashedPassword = await hash(defaultTeacher.password, 10);

    await prisma.teacher.create({
      data: {
        username: defaultTeacher.username,
        password: hashedPassword,
        name: "Test Guru",
        address: "Jl. Contoh Alamat No. 123, Kota Contoh",
        mobile: "081234567890",
      },
    });

    console.log("Teacher seeded successfully!");
  } else {
    console.log("Teacher already exists. Skipping seeding.");
  }
}

async function main() {
  await createAdmin();
}

main()
  .catch((e) => {
    console.error("Error seeding database", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
