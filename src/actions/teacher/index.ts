"use server";

import prisma from "@/lib/prisma";
import { revalidateTag, unstable_cache } from "next/cache";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import type { Gender, Prisma, TeacherStatus } from "@prisma/client";

export const getTeacher = unstable_cache(
  async function getTeacher(id: string) {
    return prisma.teacher.findUnique({
      where: {
        id,
      },
    });
  },
  ["getTeacher"],
  {
    tags: ["teacher"],
  }
);

export const getAllTeachers = unstable_cache(
  async function getAllTeachers(
    skip: string,
    limit: string,
    sortBy: string,
    sortOrder: string,
    search?: string
  ) {
    const where: Prisma.TeacherWhereInput = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          username: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const [totalCount, teachers] = await Promise.all([
      prisma.teacher.count({
        where: {
          ...where,
          isDeleted: false,
        },
      }),
      prisma.teacher.findMany({
        where: {
          ...where,
          isDeleted: false,
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          [sortBy || "createdAt"]: sortOrder === "desc" ? "desc" : "asc",
        },
      }),
    ]);

    return {
      teachers,
      totalCount,
      currentPage: Math.floor(parseInt(skip) / parseInt(limit)) + 1,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      itemsPerPage: parseInt(limit),
    };
  },
  ["getAllTeachers"],
  {
    tags: ["teachers"],
  }
);

export async function createTeacher(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const nip = formData.get("nip") as string;
    const name = formData.get("name") as string;
    const gender = formData.get("gender") as string;
    const mobile = formData.get("mobile") as string;
    const address = formData.get("address") as string;
    const status = formData.get("status") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!name) {
      return {
        error: "Nama guru harus diisi.",
      };
    }

    if (!mobile) {
      return {
        error: "Nomor mobile harus diisi.",
      };
    }

    if (!address) {
      return {
        error: "Alamat harus diisi.",
      };
    }

    if (!username) {
      return {
        error: "Username harus diisi.",
      };
    }

    if (!password) {
      return {
        error: "Password harus diisi.",
      };
    }

    if (password.length < 6) {
      return {
        error: "Password minimal 6 karakter.",
      };
    }

    // Check for existing username
    const existingUsername = await prisma.teacher.findUnique({
      where: { username, isDeleted: false },
    });

    if (existingUsername) {
      return {
        error: "Username sudah digunakan.",
      };
    }

    // Check for existing mobile
    const existingMobile = await prisma.teacher.findUnique({
      where: { mobile, isDeleted: false },
    });

    if (existingMobile) {
      return {
        error: "Nomor mobile sudah digunakan.",
      };
    }

    // Check for existing NIP if provided
    if (nip && nip.trim() !== "") {
      const existingNip = await prisma.teacher.findUnique({
        where: { nip: nip.trim(), isDeleted: false },
      });

      if (existingNip) {
        return {
          error: "NIP sudah digunakan.",
        };
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.teacher.create({
      data: {
        nip: nip && nip.trim() !== "" ? nip.trim() : null,
        name,
        gender: gender as Gender,
        mobile,
        address,
        status: status as TeacherStatus,
        username,
        password: hashedPassword,
      },
    });

    revalidateTag("teacher");
    revalidateTag("teachers");
  } catch (error) {
    console.error("Error creating teacher:", error);
    return {
      error: "Terjadi kesalahan saat menambahkan data guru.",
    };
  }

  redirect(`/teachers?success=1&message=Data guru berhasil ditambahkan.`);
}

export async function updateTeacher(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const id = formData.get("id") as string;
    const nip = formData.get("nip") as string;
    const name = formData.get("name") as string;
    const gender = formData.get("gender") as string;
    const mobile = formData.get("mobile") as string;
    const address = formData.get("address") as string;
    const status = formData.get("status") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!name) {
      return {
        error: "Nama guru harus diisi.",
      };
    }

    if (!mobile) {
      return {
        error: "Nomor mobile harus diisi.",
      };
    }

    if (!address) {
      return {
        error: "Alamat harus diisi.",
      };
    }

    if (!username) {
      return {
        error: "Username harus diisi.",
      };
    }

    if (password && password.trim() !== "" && password.length < 6) {
      return {
        error: "Password minimal 6 karakter.",
      };
    }

    const existingTeacher = await prisma.teacher.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existingTeacher) {
      return {
        error: "Guru tidak ditemukan.",
      };
    }

    // Check for existing username (exclude current teacher)
    const existingUsername = await prisma.teacher.findFirst({
      where: {
        username,
        isDeleted: false,
        NOT: { id },
      },
    });

    if (existingUsername) {
      return {
        error: "Username sudah digunakan.",
      };
    }

    // Check for existing mobile (exclude current teacher)
    const existingMobile = await prisma.teacher.findFirst({
      where: {
        mobile,
        isDeleted: false,
        NOT: { id },
      },
    });

    if (existingMobile) {
      return {
        error: "Nomor mobile sudah digunakan.",
      };
    }

    // Check for existing NIP if provided (exclude current teacher)
    if (nip && nip.trim() !== "") {
      const existingNip = await prisma.teacher.findFirst({
        where: {
          nip: nip.trim(),
          isDeleted: false,
          NOT: { id },
        },
      });

      if (existingNip) {
        return {
          error: "NIP sudah digunakan.",
        };
      }
    }

    const updateData: {
      nip?: string | null;
      name?: string;
      gender?: Gender;
      mobile?: string;
      address?: string;
      status?: TeacherStatus;
      username?: string;
      password?: string;
    } = {
      nip: nip && nip.trim() !== "" ? nip.trim() : null,
      name,
      gender: gender as Gender,
      mobile,
      address,
      status: status as TeacherStatus,
      username,
    };

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await prisma.teacher.update({
      where: { id },
      data: updateData,
    });

    revalidateTag("teacher");
    revalidateTag("teachers");
  } catch (error) {
    console.error("Error updating teacher:", error);
    return {
      error: "Terjadi kesalahan saat memperbarui data guru.",
    };
  }

  redirect(`/teachers?success=1&message=Data guru berhasil diperbarui.`);
}

export async function deleteTeacher(id: string) {
  try {
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existingTeacher) {
      redirect(`/teachers?error=1&message=Guru tidak ditemukan.`);
      return;
    }

    await prisma.teacher.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        username: `deleted_${existingTeacher.username}_${Date.now()}`,
      },
    });
    revalidateTag("teachers");
    revalidateTag("teacher");
  } catch (error) {
    console.error("Error deleting teacher:", error);
    redirect(
      `/teachers?error=1&message=Terjadi kesalahan saat menghapus data guru.`
    );
  }

  redirect(`/teachers?success=1&message=Data guru berhasil dihapus.`);
}
