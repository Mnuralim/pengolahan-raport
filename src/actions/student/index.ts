"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import type { Gender, Prisma, Religion } from "@prisma/client";
import { imagekit } from "@/lib/imagekit";

export const getStudent = unstable_cache(
  async function getStudent(id: string) {
    return prisma.student.findUnique({
      where: {
        id,
      },
      include: {
        class: true,
        physicalDevelopments: true,
        teacherNotes: true,
        developmentAssessments: {
          include: {
            indicator: {
              include: {
                aspect: true,
              },
            },
          },
        },
      },
    });
  },
  ["getStudent"],
  {
    tags: ["student"],
  }
);

export const getAllStudents = unstable_cache(
  async function getAllStudents(
    skip: string,
    limit: string,
    sortBy: string,
    sortOrder: string,
    search?: string,
    classId?: string
  ) {
    const where: Prisma.StudentWhereInput = {
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
          nis: {
            contains: search,
          },
        },
      ];
    }

    if (classId) {
      where.classId = classId;
    }

    const [totalCount, students] = await Promise.all([
      prisma.student.count({
        where: {
          ...where,
          isDeleted: false,
        },
      }),
      prisma.student.findMany({
        where: {
          ...where,
          isDeleted: false,
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          [sortBy || "createdAt"]: sortOrder === "desc" ? "desc" : "asc",
        },
        include: {
          class: true,
          physicalDevelopments: true,
          developmentAssessments: {
            include: {
              indicator: {
                include: {
                  aspect: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      students,
      totalCount,
      currentPage: Math.floor(parseInt(skip) / parseInt(limit)) + 1,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      itemsPerPage: parseInt(limit),
    };
  },
  ["getAllStudents"],
  {
    tags: ["students"],
  }
);

export async function createStudent(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const nis = formData.get("nis") as string;
    const name = formData.get("name") as string;
    const gender = formData.get("gender") as string;
    const birthPlace = formData.get("birthPlace") as string;
    const birthDate = formData.get("birthDate") as string;
    const religion = formData.get("religion") as string;
    const address = formData.get("address") as string;
    const fatherName = formData.get("fatherName") as string;
    const motherName = formData.get("motherName") as string;
    const fatherOccupation = formData.get("fatherOccupation") as string;
    const motherOccupation = formData.get("motherOccupation") as string;
    const childOrder = formData.get("childOrder") as string;
    const status = formData.get("status") as string;
    const academicYear = formData.get("academicYear") as string;
    const admittedAt = formData.get("admittedAt") as string;
    const classId = formData.get("classId") as string;
    const profileImage = formData.get("profileImage") as File;

    const height = formData.get("height") as string;
    const weight = formData.get("weight") as string;
    const headCircumference = formData.get("headCircumference") as string;
    const measurementDate = formData.get("measurementDate") as string;

    if (!nis) {
      return {
        error: "NIS harus diisi.",
      };
    }

    if (!name) {
      return {
        error: "Nama siswa harus diisi.",
      };
    }

    if (!religion) {
      return {
        error: "Agama harus diisi.",
      };
    }

    if (!academicYear) {
      return {
        error: "Tahun akademik harus diisi.",
      };
    }

    if (!classId) {
      return {
        error: "Kelas harus dipilih.",
      };
    }

    const existingNis = await prisma.student.findUnique({
      where: { nis, isDeleted: false },
    });

    if (existingNis) {
      return {
        error: "NIS sudah digunakan.",
      };
    }

    const existingClass = await prisma.class.findUnique({
      where: { id: classId, isDeleted: false },
    });

    if (!existingClass) {
      return {
        error: "Kelas tidak ditemukan.",
      };
    }

    let profileImageUrl: string | null = null;
    if (profileImage && profileImage.size > 0) {
      const imageArrayBuffer = await profileImage.arrayBuffer();
      const imageBuffer = Buffer.from(imageArrayBuffer);
      const uploadResponse = await imagekit.upload({
        file: imageBuffer,
        fileName: `student-${nis}-${Date.now()}.${profileImage.name
          .split(".")
          .pop()}`,
        folder: "/sis/students/profiles",
      });
      profileImageUrl = uploadResponse.url;
    }

    await prisma.$transaction(async (tx) => {
      const createdStudent = await tx.student.create({
        data: {
          nis,
          name,
          gender: gender as Gender,
          birthPlace: birthPlace || null,
          birthDate: birthDate ? new Date(birthDate) : null,
          religion: religion as Religion,
          address: address || null,
          fatherName: fatherName || null,
          motherName: motherName || null,
          fatherOccupation: fatherOccupation || null,
          motherOccupation: motherOccupation || null,
          childOrder: childOrder ? parseInt(childOrder) : null,
          status: status || null,
          academicYear,
          admittedAt: admittedAt ? new Date(admittedAt) : null,
          classId,
          imageUrl: profileImageUrl,
        },
      });

      if (height || weight || headCircumference || measurementDate) {
        await tx.physicalDevelopment.create({
          data: {
            studentId: createdStudent.id,
            height: height ? parseFloat(height) : null,
            weight: weight ? parseFloat(weight) : null,
            headCircumference: headCircumference
              ? parseFloat(headCircumference)
              : null,
            measurementDate: measurementDate ? new Date(measurementDate) : null,
          },
        });
      }
    });

    revalidateTag("student");
    revalidateTag("students");
    revalidateTag("class");
    revalidateTag("classes");
    revalidatePath("/");
  } catch (error) {
    console.error("Error creating student:", error);
    return {
      error: "Terjadi kesalahan saat menambahkan data siswa.",
    };
  }

  redirect(`/students?success=1&message=Data siswa berhasil ditambahkan.`);
}

export async function updateStudent(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const id = formData.get("id") as string;
    const nis = formData.get("nis") as string;
    const name = formData.get("name") as string;
    const gender = formData.get("gender") as string;
    const birthPlace = formData.get("birthPlace") as string;
    const birthDate = formData.get("birthDate") as string;
    const religion = formData.get("religion") as string;
    const address = formData.get("address") as string;
    const fatherName = formData.get("fatherName") as string;
    const motherName = formData.get("motherName") as string;
    const fatherOccupation = formData.get("fatherOccupation") as string;
    const motherOccupation = formData.get("motherOccupation") as string;
    const childOrder = formData.get("childOrder") as string;
    const status = formData.get("status") as string;
    const academicYear = formData.get("academicYear") as string;
    const admittedAt = formData.get("admittedAt") as string;
    const classId = formData.get("classId") as string;
    const profileImage = formData.get("profileImage") as File;

    if (!nis) {
      return {
        error: "NIS harus diisi.",
      };
    }

    if (!name) {
      return {
        error: "Nama siswa harus diisi.",
      };
    }

    if (!religion) {
      return {
        error: "Agama harus diisi.",
      };
    }

    if (!academicYear) {
      return {
        error: "Tahun akademik harus diisi.",
      };
    }

    if (!classId) {
      return {
        error: "Kelas harus dipilih.",
      };
    }

    const existingStudent = await prisma.student.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existingStudent) {
      return {
        error: "Siswa tidak ditemukan.",
      };
    }

    const existingNis = await prisma.student.findUnique({
      where: {
        nis,
        NOT: { id, isDeleted: false },
      },
    });

    if (existingNis) {
      return {
        error: "NIS sudah digunakan.",
      };
    }

    const existingClass = await prisma.class.findUnique({
      where: { id: classId, isDeleted: false },
    });

    if (!existingClass) {
      return {
        error: "Kelas tidak ditemukan.",
      };
    }

    let profileImageUrl = existingStudent.imageUrl;
    if (profileImage && profileImage.size > 0) {
      const imageArrayBuffer = await profileImage.arrayBuffer();
      const imageBuffer = Buffer.from(imageArrayBuffer);
      const uploadResponse = await imagekit.upload({
        file: imageBuffer,
        fileName: `student-${nis}-${Date.now()}.${profileImage.name
          .split(".")
          .pop()}`,
        folder: "/sis/students/profiles",
      });
      profileImageUrl = uploadResponse.url;
    }

    await prisma.student.update({
      where: { id },
      data: {
        nis,
        name,
        gender: gender as Gender,
        birthPlace: birthPlace || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        religion: religion as Religion,
        address: address || null,
        fatherName: fatherName || null,
        motherName: motherName || null,
        fatherOccupation: fatherOccupation || null,
        motherOccupation: motherOccupation || null,
        childOrder: childOrder ? parseInt(childOrder) : null,
        status: status || null,
        academicYear,
        admittedAt: admittedAt ? new Date(admittedAt) : null,
        classId,
        imageUrl: profileImageUrl,
      },
    });

    revalidateTag("student");
    revalidateTag("students");
    revalidateTag("class");
    revalidatePath("/");
    revalidateTag("classes");
  } catch (error) {
    console.error("Error updating student:", error);
    return {
      error: "Terjadi kesalahan saat memperbarui data siswa.",
    };
  }

  redirect(`/students?success=1&message=Data siswa berhasil diperbarui.`);
}

export async function deleteStudent(id: string) {
  try {
    const existingStudent = await prisma.student.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existingStudent) {
      redirect(`/students?error=1&message=Siswa tidak ditemukan.`);
    }

    await prisma.student.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        nis: `deleted_${existingStudent.nis}_${Date.now()}`,
      },
    });

    revalidateTag("students");
    revalidateTag("student");
    revalidateTag("class");
    revalidatePath("/");
    revalidateTag("classes");
  } catch (error) {
    console.error("Error deleting student:", error);
    redirect(
      `/students?error=1&message=Terjadi kesalahan saat menghapus data siswa.`
    );
  }

  redirect(`/students?success=1&message=Data siswa berhasil dihapus.`);
}
