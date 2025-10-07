"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import type { AgeGroup, Prisma } from "@prisma/client";

export const getDevelopmentAspect = unstable_cache(
  async function getDevelopmentAspect(id: string) {
    return prisma.developmentAspect.findUnique({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        indicators: {
          where: {
            isDeleted: false,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });
  },
  ["getDevelopmentAspect"],
  {
    tags: ["development-aspect"],
  }
);

export const getAllDevelopmentAspects = unstable_cache(
  async function getAllDevelopmentAspects(
    skip: string,
    limit: string,
    sortBy: string,
    sortOrder: string,
    search?: string
  ) {
    const where: Prisma.DevelopmentAspectWhereInput = {
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
          code: {
            contains: search,
          },
        },
        {
          description: {
            contains: search,
          },
        },
      ];
    }

    const [totalCount, aspects] = await Promise.all([
      prisma.developmentAspect.count({
        where,
      }),
      prisma.developmentAspect.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          [sortBy || "order"]: sortOrder === "desc" ? "desc" : "asc",
        },
        include: {
          indicators: {
            where: {
              isDeleted: false,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      }),
    ]);

    return {
      aspects,
      totalCount,
      currentPage: Math.floor(parseInt(skip) / parseInt(limit)) + 1,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      itemsPerPage: parseInt(limit),
    };
  },
  ["getAllDevelopmentAspects"],
  {
    tags: ["development-aspects"],
  }
);

export const getDevelopmentAspectsForDropdown = unstable_cache(
  async function getDevelopmentAspectsForDropdown() {
    return prisma.developmentAspect.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        order: "asc",
      },
    });
  },
  ["getDevelopmentAspectsForDropdown"],
  {
    tags: ["development-aspects"],
  }
);

export async function createDevelopmentAspectWithIndicators(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const description = formData.get("description") as string;
    const order = formData.get("order") as string;

    const indicatorNames = formData.getAll("indicatorNames") as string[];
    const indicatorShortNames = formData.getAll(
      "indicatorShortNames"
    ) as string[];
    const indicatorOrders = formData.getAll("indicatorOrders") as string[];
    const indicatorAgeGroups = formData.getAll(
      "indicatorAgeGroups"
    ) as string[];

    if (!name) {
      return {
        error: "Nama aspek perkembangan harus diisi.",
      };
    }

    if (!code) {
      return {
        error: "Kode aspek perkembangan harus diisi.",
      };
    }

    const existingCode = await prisma.developmentAspect.findUnique({
      where: { code, isDeleted: false },
    });

    if (existingCode) {
      return {
        error: "Kode aspek perkembangan sudah digunakan.",
      };
    }

    if (indicatorNames.length === 0) {
      return {
        error: "Minimal satu indikator harus diisi.",
      };
    }

    for (let i = 0; i < indicatorNames.length; i++) {
      if (!indicatorNames[i]) {
        return {
          error: `Nama indikator ${i + 1} harus diisi.`,
        };
      }
    }

    await prisma.$transaction(async (tx) => {
      const createdAspect = await tx.developmentAspect.create({
        data: {
          name,
          code: code.toUpperCase(),
          description: description || null,
          order: order ? parseInt(order) : 1,
        },
      });

      const indicatorData = indicatorNames.map((indicatorName, index) => ({
        aspectId: createdAspect.id,
        name: indicatorName,
        shortName: indicatorShortNames[index] || null,
        order: indicatorOrders[index]
          ? parseInt(indicatorOrders[index])
          : index + 1,
        ageGroup: indicatorAgeGroups[index]
          ? (indicatorAgeGroups[index] as AgeGroup)
          : null,
      }));

      await tx.developmentIndicator.createMany({
        data: indicatorData,
      });
    });

    revalidateTag("development-aspect");
    revalidateTag("development-aspects");
    revalidateTag("development-indicators");
    revalidatePath("/");
    revalidateTag("student");
  } catch (error) {
    console.error("Error creating development aspect with indicators:", error);
    return {
      error: "Terjadi kesalahan saat menambahkan aspek perkembangan.",
    };
  }

  redirect(
    `/development-aspects?success=1&message=Aspek perkembangan berhasil ditambahkan.`
  );
}

export async function updateDevelopmentAspectWithIndicators(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const description = formData.get("description") as string;
    const order = formData.get("order") as string;

    const indicatorIds = formData.getAll("indicatorIds") as string[];
    const indicatorNames = formData.getAll("indicatorNames") as string[];
    const indicatorShortNames = formData.getAll(
      "indicatorShortNames"
    ) as string[];
    const indicatorOrders = formData.getAll("indicatorOrders") as string[];
    const indicatorAgeGroups = formData.getAll(
      "indicatorAgeGroups"
    ) as string[];
    const deletedIndicatorIds = formData.getAll(
      "deletedIndicatorIds"
    ) as string[];

    if (!name) {
      return {
        error: "Nama aspek perkembangan harus diisi.",
      };
    }

    if (!code) {
      return {
        error: "Kode aspek perkembangan harus diisi.",
      };
    }

    const existingAspect = await prisma.developmentAspect.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existingAspect) {
      return {
        error: "Aspek perkembangan tidak ditemukan.",
      };
    }

    const existingCode = await prisma.developmentAspect.findUnique({
      where: {
        code,
        NOT: { id },
        isDeleted: false,
      },
    });

    if (existingCode) {
      return {
        error: "Kode aspek perkembangan sudah digunakan.",
      };
    }

    if (indicatorNames.length === 0) {
      return {
        error: "Minimal satu indikator harus diisi.",
      };
    }

    for (let i = 0; i < indicatorNames.length; i++) {
      if (!indicatorNames[i]) {
        return {
          error: `Nama indikator ${i + 1} harus diisi.`,
        };
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.developmentAspect.update({
        where: { id },
        data: {
          name,
          code: code.toUpperCase(),
          description: description || null,
          order: order ? parseInt(order) : 1,
        },
      });

      if (deletedIndicatorIds.length > 0) {
        await tx.developmentIndicator.updateMany({
          where: {
            id: {
              in: deletedIndicatorIds,
            },
          },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
          },
        });
      }

      for (let i = 0; i < indicatorNames.length; i++) {
        const indicatorId = indicatorIds[i];
        const indicatorData = {
          aspectId: id,
          name: indicatorNames[i],
          shortName: indicatorShortNames[i] || null,
          order: indicatorOrders[i] ? parseInt(indicatorOrders[i]) : i + 1,
          ageGroup: indicatorAgeGroups[i]
            ? (indicatorAgeGroups[i] as AgeGroup)
            : null,
        };

        if (indicatorId && indicatorId !== "") {
          await tx.developmentIndicator.update({
            where: { id: indicatorId },
            data: indicatorData,
          });
        } else {
          await tx.developmentIndicator.create({
            data: indicatorData,
          });
        }
      }
    });

    revalidateTag("development-aspect");
    revalidateTag("student");
    revalidateTag("development-indicators");
    revalidatePath("/");
    revalidateTag("development-aspects");
  } catch (error) {
    console.error("Error updating development aspect with indicators:", error);
    return {
      error: "Terjadi kesalahan saat memperbarui aspek perkembangan.",
    };
  }

  redirect(
    `/development-aspects?success=1&message=Aspek perkembangan berhasil diperbarui.`
  );
}

export async function deleteDevelopmentAspect(id: string) {
  try {
    const existingAspect = await prisma.developmentAspect.findUnique({
      where: { id, isDeleted: false },
      include: {
        indicators: {
          where: { isDeleted: false },
        },
      },
    });

    if (!existingAspect) {
      redirect(
        `/development-aspects?error=1&message=Aspek perkembangan tidak ditemukan.`
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.developmentIndicator.updateMany({
        where: {
          aspectId: id,
          isDeleted: false,
        },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      await tx.developmentAspect.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          code: `deleted_${existingAspect.code}_${Date.now()}`,
        },
      });
    });

    revalidateTag("development-aspects");
    revalidatePath("/");
    revalidateTag("development-aspect");
  } catch (error) {
    console.error("Error deleting development aspect:", error);
    redirect(
      `/development-aspects?error=1&message=Terjadi kesalahan saat menghapus aspek perkembangan.`
    );
  }

  redirect(
    `/development-aspects?success=1&message=Aspek perkembangan berhasil dihapus.`
  );
}

export const getDevelopmentIndicator = unstable_cache(
  async function getDevelopmentIndicator(id: string) {
    return prisma.developmentIndicator.findUnique({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        aspect: true,
      },
    });
  },
  ["getDevelopmentIndicator"],
  {
    tags: ["development-indicator"],
  }
);

export const getIndicatorsByAspect = unstable_cache(
  async function getIndicatorsByAspect(aspectId: string) {
    return prisma.developmentIndicator.findMany({
      where: {
        aspectId,
        isDeleted: false,
      },
      orderBy: {
        order: "asc",
      },
    });
  },
  ["getIndicatorsByAspect"],
  {
    tags: ["development-indicators"],
  }
);

export const getAllDevelopmentIndicators = unstable_cache(
  async function getAllDevelopmentIndicators() {
    return prisma.developmentIndicator.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        aspect: true,
      },
    });
  },
  ["getAllDevelopmentIndicators"],
  {
    tags: ["development-indicators"],
  }
);
