import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function createTeacher() {
  console.log("Seeding Admin...");

  const defaultAdmin = {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
  };

  const existingTeacher = await prisma.teacher.findFirst({
    where: { username: defaultAdmin.username },
  });

  if (!existingTeacher) {
    const hashedPassword = await hash(defaultAdmin.password, 10);

    await prisma.teacher.create({
      data: {
        username: defaultAdmin.username,
        password: hashedPassword,
        role: "ADMIN",
        name: "Admin",
        address: "Jl. Contoh Alamat No. 123, Kota Contoh",
        mobile: "0812342221240",
      },
    });

    console.log("Admin seeded successfully!");
  } else {
    console.log("Kepala Sekolah already exists. Skipping seeding.");
  }
}

async function main() {
  await createTeacher();
}

main()
  .catch((e) => {
    console.error("Error seeding database", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
