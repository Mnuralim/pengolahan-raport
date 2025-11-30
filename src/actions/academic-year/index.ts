"use server";

import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "../session";

export const getAllAcademicYears = unstable_cache(
  async function getAllAcademicYears(
    skip: string,
    limit: string,
    sortBy: string,
    sortOrder: string,
    search?: string
  ) {
    const where: Prisma.AcademicYearWhereInput = {
      isDeleted: false,
    };

    if (search) {
      where.year = {
        contains: search,
      };
    }

    const [totalCount, academicYears] = await Promise.all([
      prisma.academicYear.count({
        where,
      }),
      prisma.academicYear.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          [sortBy || "createdAt"]: sortOrder === "desc" ? "desc" : "asc",
        },
      }),
    ]);

    return {
      academicYears,
      totalCount,
      currentPage: Math.floor(parseInt(skip) / parseInt(limit)) + 1,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      itemsPerPage: parseInt(limit),
    };
  },
  ["getAllAcademicYears"],
  {
    tags: ["academicYears"],
  }
);

export const getAcademicYear = unstable_cache(
  async function getAcademicYear(id: string) {
    return prisma.academicYear.findUnique({
      where: {
        id,
        isDeleted: false,
      },
    });
  },
  ["getAcademicYear"],
  {
    tags: ["academicYear"],
  }
);

export async function createAcademicYear(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return {
        error: "Anda tidak memiliki izin untuk melakukan tindakan ini.",
      };
    }
    const year = formData.get("year") as string;

    if (!year) {
      return {
        error: "Tahun ajaran harus diisi.",
      };
    }

    const yearPattern = /^\d{4}\/\d{4}$/;
    if (!yearPattern.test(year)) {
      return {
        error:
          "Format tahun ajaran tidak valid. Gunakan format YYYY/YYYY (contoh: 2024/2025).",
      };
    }

    const existingYear = await prisma.academicYear.findFirst({
      where: {
        year,
        isDeleted: false,
      },
    });

    if (existingYear) {
      return {
        error: "Tahun ajaran sudah ada.",
      };
    }

    await prisma.academicYear.create({
      data: {
        year,
      },
    });

    revalidateTag("academicYear");
    revalidateTag("academicYears");
    revalidatePath("/");
  } catch (error) {
    console.error("Error creating academic year:", error);
    return {
      error: "Terjadi kesalahan saat menambahkan data tahun ajaran.",
    };
  }

  redirect(
    `/academic-years?success=1&message=Data tahun ajaran berhasil ditambahkan.`
  );
}

export async function updateAcademicYear(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return {
        error: "Anda tidak memiliki izin untuk melakukan tindakan ini.",
      };
    }
    const id = formData.get("id") as string;
    const year = formData.get("year") as string;

    if (!year) {
      return {
        error: "Tahun ajaran harus diisi.",
      };
    }

    const yearPattern = /^\d{4}\/\d{4}$/;
    if (!yearPattern.test(year)) {
      return {
        error:
          "Format tahun ajaran tidak valid. Gunakan format YYYY/YYYY (contoh: 2024/2025).",
      };
    }

    const existingYear = await prisma.academicYear.findUnique({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!existingYear) {
      return {
        error: "Tahun ajaran tidak ditemukan.",
      };
    }

    const duplicateYear = await prisma.academicYear.findFirst({
      where: {
        year,
        isDeleted: false,
        NOT: { id },
      },
    });

    if (duplicateYear) {
      return {
        error: "Tahun ajaran sudah ada.",
      };
    }

    await prisma.academicYear.update({
      where: { id },
      data: {
        year,
      },
    });

    revalidateTag("academicYear");
    revalidateTag("academicYears");
    revalidatePath("/");
  } catch (error) {
    console.error("Error updating academic year:", error);
    return {
      error: "Terjadi kesalahan saat memperbarui data tahun ajaran.",
    };
  }

  redirect(
    `/academic-years?success=1&message=Data tahun ajaran berhasil diperbarui.`
  );
}

export async function deleteAcademicYear(id: string) {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      redirect(
        `/students?error=1&message=Anda tidak memiliki izin untuk melakukan tindakan ini.`
      );
    }
    const existingYear = await prisma.academicYear.findUnique({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!existingYear) {
      redirect(`/academic-years?error=1&message=Tahun ajaran tidak ditemukan.`);
    }

    await prisma.academicYear.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    revalidateTag("academicYear");
    revalidateTag("academicYears");
    revalidatePath("/");
  } catch (error) {
    console.error("Error deleting academic year:", error);
    redirect(
      `/academic-years?error=1&message=Terjadi kesalahan saat menghapus data tahun ajaran.`
    );
  }

  redirect(
    `/academic-years?success=1&message=Data tahun ajaran berhasil dihapus.`
  );
}
