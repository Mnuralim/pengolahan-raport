"use server";

import prisma from "@/lib/prisma";
import type { AgeGroup, Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";

export const getAllClasses = unstable_cache(
  async function getAllClasses(
    skip: string,
    limit: string,
    sortBy: string,
    sortOrder: string,
    search?: string
  ) {
    const where: Prisma.ClassWhereInput = {
      isDeleted: false,
    };

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
          },
        },
        {
          teacher: {
            name: {
              contains: search,
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
          teacher: true,
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
    const teacherId = formData.get("teacherId") as string;

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

    if (!teacherId) {
      return {
        error: "Guru harus dipilih.",
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

    const existingTeacher = await prisma.teacher.findUnique({
      where: {
        id: teacherId,
        isDeleted: false,
      },
    });

    if (!existingTeacher) {
      return {
        error: "Guru tidak ditemukan atau sudah tidak aktif.",
      };
    }

    await prisma.class.create({
      data: {
        name,
        ageGroup: ageGroup as AgeGroup,
        teacherId,
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
    const teacherId = formData.get("teacherId") as string;

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

    if (!teacherId) {
      return {
        error: "Guru harus dipilih.",
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

    const existingTeacher = await prisma.teacher.findUnique({
      where: {
        id: teacherId,
        isDeleted: false,
      },
    });

    if (!existingTeacher) {
      return {
        error: "Guru tidak ditemukan atau sudah tidak aktif.",
      };
    }

    await prisma.class.update({
      where: { id },
      data: {
        name,
        ageGroup: ageGroup as AgeGroup,
        teacherId,
      },
    });

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
