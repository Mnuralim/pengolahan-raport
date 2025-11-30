"use server";

import prisma from "@/lib/prisma";
import type { AgeGroup, Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "../session";

export const getAllClasses = unstable_cache(
  async function getAllClasses(
    skip: string,
    limit: string,
    sortBy: string,
    sortOrder: string,
    search?: string,
    id?: string
  ) {
    const where: Prisma.ClassWhereInput = {
      isDeleted: false,
    };

    if (id) {
      where.id = {
        in: id.split(","),
      };
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
          },
        },
        {
          teachers: {
            some: {
              teacher: {
                name: {
                  contains: search,
                },
              },
            },
          },
        },
      ];
    }

    const [totalCount, classes] = await Promise.all([
      prisma.class.count({
        where,
      }),
      prisma.class.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          [sortBy || "createdAt"]: sortOrder === "desc" ? "desc" : "asc",
        },
        include: {
          teachers: {
            where: {
              isDeleted: false,
            },
            include: {
              teacher: true,
            },
            orderBy: {
              isPrimary: "desc",
            },
          },
          _count: {
            select: {
              students: {
                where: {
                  isDeleted: false,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      classes,
      totalCount,
      currentPage: Math.floor(parseInt(skip) / parseInt(limit)) + 1,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      itemsPerPage: parseInt(limit),
    };
  },
  ["getAllClasses"],
  {
    tags: ["classes"],
  }
);

export async function createClass(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const name = formData.get("name") as string;
    const ageGroup = formData.get("ageGroup") as string;
    const teacherIdsStr = formData.get("teacherIds") as string;
    const primaryTeacherId = formData.get("primaryTeacherId") as string;

    let teacherIds: string[] = [];
    try {
      teacherIds = JSON.parse(teacherIdsStr || "[]");
    } catch (e) {
      console.error("Error parsing teacherIds:", e);
      return {
        error: "Format data guru tidak valid.",
      };
    }

    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return {
        error: "Anda tidak memiliki izin untuk melakukan tindakan ini.",
      };
    }

    if (!name) {
      return {
        error: "Nama kelas harus diisi.",
      };
    }

    if (!ageGroup) {
      return {
        error: "Kelompok usia harus dipilih.",
      };
    }

    if (!teacherIds || teacherIds.length === 0) {
      return {
        error: "Minimal satu guru harus dipilih.",
      };
    }

    if (primaryTeacherId && !teacherIds.includes(primaryTeacherId)) {
      return {
        error: "Wali kelas utama harus termasuk dalam daftar guru.",
      };
    }

    // Validasi: Cek apakah ada guru yang sudah terdaftar di kelas lain
    const existingTeachers = await prisma.classTeacher.findMany({
      where: {
        teacherId: { in: teacherIds },
        isDeleted: false,
        class: {
          isDeleted: false,
        },
      },
      include: {
        teacher: true,
        class: true,
      },
    });

    if (existingTeachers.length > 0) {
      const teacherNames = existingTeachers
        .map((ct) => `${ct.teacher.name} (${ct.class.name})`)
        .join(", ");
      return {
        error: `Guru berikut sudah terdaftar di kelas lain: ${teacherNames}`,
      };
    }

    const existingClass = await prisma.class.findFirst({
      where: {
        name,
        isDeleted: false,
      },
    });

    if (existingClass) {
      return {
        error: "Nama kelas sudah digunakan.",
      };
    }

    const teachers = await prisma.teacher.findMany({
      where: {
        id: { in: teacherIds },
        isDeleted: false,
      },
    });

    if (teachers.length !== teacherIds.length) {
      return {
        error: "Beberapa guru tidak ditemukan atau sudah tidak aktif.",
      };
    }

    await prisma.class.create({
      data: {
        name,
        ageGroup: ageGroup as AgeGroup,
        teachers: {
          create: teacherIds.map((teacherId) => ({
            teacherId,
            isPrimary: teacherId === primaryTeacherId,
          })),
        },
      },
    });

    revalidateTag("class");
    revalidateTag("classes");
    revalidatePath("/");
    revalidateTag("teachers");
  } catch (error) {
    console.error("Error creating class:", error);
    return {
      error: "Terjadi kesalahan saat menambahkan data kelas.",
    };
  }

  redirect(`/classes?success=1&message=Data kelas berhasil ditambahkan.`);
}

export async function updateClass(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const ageGroup = formData.get("ageGroup") as string;
    const teacherIdsStr = formData.get("teacherIds") as string;
    const primaryTeacherId = formData.get("primaryTeacherId") as string;

    let teacherIds: string[] = [];
    try {
      teacherIds = JSON.parse(teacherIdsStr || "[]");
    } catch (e) {
      console.error("Error parsing teacherIds:", e);
      return {
        error: "Format data guru tidak valid.",
      };
    }

    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return {
        error: "Anda tidak memiliki izin untuk melakukan tindakan ini.",
      };
    }

    if (!name) {
      return {
        error: "Nama kelas harus diisi.",
      };
    }

    if (!ageGroup) {
      return {
        error: "Kelompok usia harus dipilih.",
      };
    }

    if (!teacherIds || teacherIds.length === 0) {
      return {
        error: "Minimal satu guru harus dipilih.",
      };
    }

    if (primaryTeacherId && !teacherIds.includes(primaryTeacherId)) {
      return {
        error: "Wali kelas utama harus termasuk dalam daftar guru.",
      };
    }

    // Validasi: Cek apakah ada guru yang sudah terdaftar di kelas lain (selain kelas yang sedang diedit)
    const existingTeachers = await prisma.classTeacher.findMany({
      where: {
        teacherId: { in: teacherIds },
        isDeleted: false,
        classId: {
          not: id, // Exclude kelas yang sedang diedit
        },
        class: {
          isDeleted: false,
        },
      },
      include: {
        teacher: true,
        class: true,
      },
    });

    if (existingTeachers.length > 0) {
      const teacherNames = existingTeachers
        .map((ct) => `${ct.teacher.name} (${ct.class.name})`)
        .join(", ");
      return {
        error: `Guru berikut sudah terdaftar di kelas lain: ${teacherNames}`,
      };
    }

    const existingClass = await prisma.class.findUnique({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!existingClass) {
      return {
        error: "Kelas tidak ditemukan.",
      };
    }

    const duplicateClass = await prisma.class.findFirst({
      where: {
        name,
        isDeleted: false,
        NOT: { id },
      },
    });

    if (duplicateClass) {
      return {
        error: "Nama kelas sudah digunakan.",
      };
    }

    const teachers = await prisma.teacher.findMany({
      where: {
        id: { in: teacherIds },
        isDeleted: false,
      },
    });

    if (teachers.length !== teacherIds.length) {
      return {
        error: "Beberapa guru tidak ditemukan atau sudah tidak aktif.",
      };
    }

    await prisma.$transaction([
      prisma.classTeacher.deleteMany({
        where: { classId: id },
      }),
      prisma.class.update({
        where: { id },
        data: {
          name,
          ageGroup: ageGroup as AgeGroup,
          teachers: {
            create: teacherIds.map((teacherId) => ({
              teacherId,
              isPrimary: teacherId === primaryTeacherId,
            })),
          },
        },
      }),
    ]);

    revalidateTag("class");
    revalidateTag("classes");
    revalidatePath("/");
    revalidateTag("teachers");
  } catch (error) {
    console.error("Error updating class:", error);
    return {
      error: "Terjadi kesalahan saat memperbarui data kelas.",
    };
  }

  redirect(`/classes?success=1&message=Data kelas berhasil diperbarui.`);
}

export async function deleteClass(id: string) {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      redirect(
        `/classes?error=1&message=Anda tidak memiliki izin untuk melakukan tindakan ini.`
      );
      return;
    }
    const existingClass = await prisma.class.findUnique({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        _count: {
          select: {
            students: {
              where: {
                isDeleted: false,
              },
            },
          },
        },
      },
    });

    if (!existingClass) {
      redirect(`/classes?error=1&message=Kelas tidak ditemukan.`);
    }

    if (existingClass._count.students > 0) {
      redirect(
        `/classes?error=1&message=Tidak dapat menghapus kelas yang masih memiliki siswa.`
      );
    }

    await prisma.class.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    revalidateTag("classes");
    revalidateTag("class");
    revalidatePath("/");
    revalidateTag("teachers");
  } catch (error) {
    console.error("Error deleting class:", error);
    redirect(
      `/classes?error=1&message=Terjadi kesalahan saat menghapus data kelas.`
    );
  }

  redirect(`/classes?success=1&message=Data kelas berhasil dihapus.`);
}
