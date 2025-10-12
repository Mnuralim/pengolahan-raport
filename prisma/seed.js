import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function createAdmin() {
  console.log("Seeding Kepala Sekolah...");

  const defaultTeacher = {
    username: process.env.TEACHER_USERNAME,
    password: process.env.TEACHER_PASSWORD,
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
        role: "KEPALA_SEKOLAH",
        name: "Test Kepala Sekolah",
        address: "Jl. Contoh Alamat No. 123, Kota Contoh",
        mobile: "081234222220",
      },
    });

    console.log("Kepala Sekolah seeded successfully!");
  } else {
    console.log("Kepala Sekolah already exists. Skipping seeding.");
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
