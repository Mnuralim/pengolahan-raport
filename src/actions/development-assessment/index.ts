"use server";

import prisma from "@/lib/prisma";
import type { DevelopmentLevel, Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";

export const getAllDevelopmentAssessments = unstable_cache(
  async function getAllDevelopmentAssessments(
    skip: string,
    limit: string,
    sortBy: string,
    sortOrder: string,
    search?: string,
    studentId?: string,
    indicatorId?: string
  ) {
    const where: Prisma.DevelopmentAssessmentWhereInput = {
      isDeleted: false,
    };

    if (search) {
      where.OR = [
        {
          student: {
            name: {
              contains: search,
            },
          },
        },
        {
          student: {
            nis: {
              contains: search,
            },
          },
        },
        {
          indicator: {
            name: {
              contains: search,
            },
          },
        },
        {
          notes: {
            contains: search,
          },
        },
      ];
    }

    if (studentId) {
      where.studentId = studentId;
    }

    if (indicatorId) {
      where.indicatorId = indicatorId;
    }

    const [totalCount, assessments] = await Promise.all([
      prisma.developmentAssessment.count({
        where,
      }),
      prisma.developmentAssessment.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          [sortBy || "createdAt"]: sortOrder === "desc" ? "desc" : "asc",
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              nis: true,
              class: {
                select: {
                  name: true,
                  ageGroup: true,
                },
              },
            },
          },
          indicator: {
            include: {
              aspect: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      assessments,
      totalCount,
      currentPage: Math.floor(parseInt(skip) / parseInt(limit)) + 1,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      itemsPerPage: parseInt(limit),
    };
  },
  ["getAllDevelopmentAssessments"],
  {
    tags: ["development-assessments"],
  }
);

export const getDevelopmentAssessmentById = unstable_cache(
  async function getDevelopmentAssessmentById(id: string) {
    const assessment = await prisma.developmentAssessment.findUnique({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        student: {
          include: {
            class: {
              include: {
                teacher: true,
              },
            },
          },
        },
        indicator: {
          include: {
            aspect: true,
          },
        },
      },
    });

    return assessment;
  },
  ["getDevelopmentAssessmentById"],
  {
    tags: ["development-assessment"],
  }
);

export const getStudentDevelopmentAssessments = unstable_cache(
  async function getStudentDevelopmentAssessments(studentId: string) {
    const assessments = await prisma.developmentAssessment.findMany({
      where: {
        studentId,
        isDeleted: false,
      },
      include: {
        indicator: {
          include: {
            aspect: true,
          },
        },
      },
      orderBy: [
        {
          indicator: {
            aspect: {
              order: "asc",
            },
          },
        },
        {
          indicator: {
            order: "asc",
          },
        },
      ],
    });

    return assessments;
  },
  ["getStudentDevelopmentAssessments"],
  {
    tags: ["student-development-assessments"],
  }
);

export async function createDevelopmentAssessment(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const studentId = formData.get("studentId") as string;
    const indicatorId = formData.get("indicatorId") as string;
    const development = formData.get("development") as string;
    const notes = formData.get("notes") as string;
    const assessmentDate = formData.get("assessmentDate") as string;

    if (!studentId) {
      return {
        error: "Siswa harus dipilih.",
      };
    }

    if (!indicatorId) {
      return {
        error: "Indikator perkembangan harus dipilih.",
      };
    }

    if (!development) {
      return {
        error: "Tingkat perkembangan harus dipilih.",
      };
    }

    const existingStudent = await prisma.student.findUnique({
      where: {
        id: studentId,
        isDeleted: false,
      },
    });

    if (!existingStudent) {
      return {
        error: "Siswa tidak ditemukan atau sudah tidak aktif.",
      };
    }

    const existingIndicator = await prisma.developmentIndicator.findUnique({
      where: {
        id: indicatorId,
        isDeleted: false,
      },
    });

    if (!existingIndicator) {
      return {
        error: "Indikator perkembangan tidak ditemukan atau sudah tidak aktif.",
      };
    }

    const existingAssessment = await prisma.developmentAssessment.findUnique({
      where: {
        studentId_indicatorId: {
          studentId,
          indicatorId,
        },
        isDeleted: false,
      },
    });

    if (existingAssessment) {
      return {
        error: "Penilaian untuk siswa dan indikator ini sudah ada.",
      };
    }

    await prisma.developmentAssessment.create({
      data: {
        studentId,
        indicatorId,
        development: development as DevelopmentLevel,
        notes: notes || null,
        assessmentDate: assessmentDate ? new Date(assessmentDate) : null,
      },
    });

    revalidateTag("development-assessment");
    revalidateTag("development-assessments");
    revalidateTag("student-development-assessments");
    revalidatePath("/");
  } catch (error) {
    console.error("Error creating development assessment:", error);
    return {
      error: "Terjadi kesalahan saat menambahkan penilaian perkembangan.",
    };
  }

  redirect(
    `/development-assessments?success=1&message=Penilaian perkembangan berhasil ditambahkan.`
  );
}

export async function updateDevelopmentAssessment(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const id = formData.get("id") as string;
    const studentId = formData.get("studentId") as string;
    const indicatorId = formData.get("indicatorId") as string;
    const development = formData.get("development") as string;
    const notes = formData.get("notes") as string;
    const assessmentDate = formData.get("assessmentDate") as string;

    if (!studentId) {
      return {
        error: "Siswa harus dipilih.",
      };
    }

    if (!indicatorId) {
      return {
        error: "Indikator perkembangan harus dipilih.",
      };
    }

    if (!development) {
      return {
        error: "Tingkat perkembangan harus dipilih.",
      };
    }

    const existingAssessment = await prisma.developmentAssessment.findUnique({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!existingAssessment) {
      return {
        error: "Penilaian perkembangan tidak ditemukan.",
      };
    }

    const existingStudent = await prisma.student.findUnique({
      where: {
        id: studentId,
        isDeleted: false,
      },
    });

    if (!existingStudent) {
      return {
        error: "Siswa tidak ditemukan atau sudah tidak aktif.",
      };
    }

    const existingIndicator = await prisma.developmentIndicator.findUnique({
      where: {
        id: indicatorId,
        isDeleted: false,
      },
    });

    if (!existingIndicator) {
      return {
        error: "Indikator perkembangan tidak ditemukan atau sudah tidak aktif.",
      };
    }

    if (
      existingAssessment.studentId !== studentId ||
      existingAssessment.indicatorId !== indicatorId
    ) {
      const duplicateAssessment = await prisma.developmentAssessment.findUnique(
        {
          where: {
            studentId_indicatorId: {
              studentId,
              indicatorId,
            },
            isDeleted: false,
          },
        }
      );

      if (duplicateAssessment && duplicateAssessment.id !== id) {
        return {
          error: "Penilaian untuk siswa dan indikator ini sudah ada.",
        };
      }
    }

    await prisma.developmentAssessment.update({
      where: { id },
      data: {
        studentId,
        indicatorId,
        development: development as DevelopmentLevel,
        notes: notes || null,
        assessmentDate: assessmentDate ? new Date(assessmentDate) : null,
      },
    });

    revalidateTag("development-assessment");
    revalidateTag("development-assessments");
    revalidatePath("/");
    revalidateTag("student-development-assessments");
  } catch (error) {
    console.error("Error updating development assessment:", error);
    return {
      error: "Terjadi kesalahan saat memperbarui penilaian perkembangan.",
    };
  }

  redirect(
    `/development-assessments?success=1&message=Penilaian perkembangan berhasil diperbarui.`
  );
}

export async function deleteDevelopmentAssessment(id: string) {
  try {
    const existingAssessment = await prisma.developmentAssessment.findUnique({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!existingAssessment) {
      redirect(
        `/development-assessments?error=1&message=Penilaian perkembangan tidak ditemukan.`
      );
    }

    await prisma.developmentAssessment.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    revalidateTag("development-assessments");
    revalidateTag("development-assessment");
    revalidatePath("/");
    revalidateTag("student-development-assessments");
  } catch (error) {
    console.error("Error deleting development assessment:", error);
    redirect(
      `/development-assessments?error=1&message=Terjadi kesalahan saat menghapus penilaian perkembangan.`
    );
  }

  redirect(
    `/development-assessments?success=1&message=Penilaian perkembangan berhasil dihapus.`
  );
}

export async function createBulkDevelopmentAssessments(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const studentId = formData.get("studentId") as string;

  try {
    const assessmentData = formData.get("assessmentData") as string;

    if (!studentId) {
      return {
        error: "Siswa harus dipilih.",
      };
    }

    if (!assessmentData) {
      return {
        error: "Data penilaian harus diisi.",
      };
    }

    const existingStudent = await prisma.student.findUnique({
      where: {
        id: studentId,
        isDeleted: false,
      },
    });

    if (!existingStudent) {
      return {
        error: "Siswa tidak ditemukan atau sudah tidak aktif.",
      };
    }

    let parsedData;
    try {
      parsedData = JSON.parse(assessmentData);
    } catch {
      return {
        error: "Format data penilaian tidak valid.",
      };
    }

    const assessmentsToCreate = [];
    for (const item of parsedData) {
      if (!item.indicatorId || !item.development) {
        continue;
      }

      const existing = await prisma.developmentAssessment.findUnique({
        where: {
          studentId_indicatorId: {
            studentId,
            indicatorId: item.indicatorId,
          },
          isDeleted: false,
        },
      });

      if (!existing) {
        assessmentsToCreate.push({
          studentId,
          indicatorId: item.indicatorId,
          development: item.development as DevelopmentLevel,
          notes: item.notes || null,
          assessmentDate: item.assessmentDate
            ? new Date(item.assessmentDate)
            : null,
        });
      }
    }

    if (assessmentsToCreate.length > 0) {
      await prisma.developmentAssessment.createMany({
        data: assessmentsToCreate,
      });
    }

    revalidateTag("development-assessment");
    revalidateTag("development-assessments");
    revalidateTag("students");
    revalidateTag("student");
    revalidatePath("/");
    revalidateTag("student-development-assessments");
  } catch (error) {
    console.error("Error creating bulk development assessments:", error);
    return {
      error: "Terjadi kesalahan saat menambahkan penilaian perkembangan.",
    };
  }

  redirect(
    `/students/${studentId}?success=1&message=Penilaian perkembangan berhasil ditambahkan.`
  );
}

export async function updateBulkDevelopmentAssessments(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const isEditMode = formData.get("isEditMode") === "true";
  const studentId = formData.get("studentId") as string;

  try {
    const assessmentData = formData.get("assessmentData") as string;

    if (!studentId) {
      return {
        error: "Siswa harus dipilih.",
      };
    }

    if (!assessmentData) {
      return {
        error: "Data penilaian harus diisi.",
      };
    }

    const existingStudent = await prisma.student.findUnique({
      where: {
        id: studentId,
        isDeleted: false,
      },
    });

    if (!existingStudent) {
      return {
        error: "Siswa tidak ditemukan atau sudah tidak aktif.",
      };
    }

    let parsedData;
    try {
      parsedData = JSON.parse(assessmentData);
    } catch {
      return {
        error: "Format data penilaian tidak valid.",
      };
    }

    if (isEditMode) {
      const updatePromises = [];

      for (const item of parsedData) {
        if (!item.indicatorId || !item.development) {
          continue;
        }

        if (item.assessmentId) {
          updatePromises.push(
            prisma.developmentAssessment.update({
              where: {
                id: item.assessmentId,
                isDeleted: false,
              },
              data: {
                development: item.development as DevelopmentLevel,
                notes: item.notes || null,
                assessmentDate: item.assessmentDate
                  ? new Date(item.assessmentDate)
                  : null,
                updatedAt: new Date(),
              },
            })
          );
        } else {
          const existingAssessment =
            await prisma.developmentAssessment.findUnique({
              where: {
                studentId_indicatorId: {
                  studentId,
                  indicatorId: item.indicatorId,
                },
                isDeleted: false,
              },
            });

          if (!existingAssessment) {
            updatePromises.push(
              prisma.developmentAssessment.create({
                data: {
                  studentId,
                  indicatorId: item.indicatorId,
                  development: item.development as DevelopmentLevel,
                  notes: item.notes || null,
                  assessmentDate: item.assessmentDate
                    ? new Date(item.assessmentDate)
                    : null,
                },
              })
            );
          }
        }
      }

      await Promise.all(updatePromises);
    } else {
      const assessmentsToCreate = [];

      for (const item of parsedData) {
        if (!item.indicatorId || !item.development) {
          continue;
        }

        const existing = await prisma.developmentAssessment.findUnique({
          where: {
            studentId_indicatorId: {
              studentId,
              indicatorId: item.indicatorId,
            },
            isDeleted: false,
          },
        });

        if (!existing) {
          assessmentsToCreate.push({
            studentId,
            indicatorId: item.indicatorId,
            development: item.development as DevelopmentLevel,
            notes: item.notes || null,
            assessmentDate: item.assessmentDate
              ? new Date(item.assessmentDate)
              : null,
          });
        }
      }

      if (assessmentsToCreate.length > 0) {
        await prisma.developmentAssessment.createMany({
          data: assessmentsToCreate,
        });
      }
    }
    revalidateTag("students");
    revalidateTag("development-assessment");
    revalidateTag("development-assessments");
    revalidateTag("student");
    revalidatePath("/");
    revalidateTag("student-development-assessments");
  } catch (error) {
    console.error("Error updating bulk development assessments:", error);
    return {
      error: "Terjadi kesalahan saat memperbarui penilaian perkembangan.",
    };
  }

  const successMessage = isEditMode
    ? "Penilaian perkembangan berhasil diperbarui."
    : "Penilaian perkembangan berhasil ditambahkan.";

  redirect(
    `/students/${studentId}?success=1&message=${encodeURIComponent(
      successMessage
    )}`
  );
}
