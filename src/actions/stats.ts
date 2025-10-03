"use server";

import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getStats = unstable_cache(async function getStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    studentsCount,
    teachersCount,
    classesCount,
    assessmentsCount,
    aspectsCount,
    indicatorsCount,
  ] = await Promise.all([
    prisma.student.count({
      where: {
        isDeleted: false,
      },
    }),
    prisma.teacher.count({
      where: {
        isDeleted: false,
      },
    }),
    prisma.class.count({
      where: {
        isDeleted: false,
      },
    }),
    prisma.developmentAssessment.count({
      where: {
        isDeleted: false,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    }),
    prisma.developmentAspect.count({
      where: {
        isDeleted: false,
      },
    }),
    prisma.developmentIndicator.count({
      where: {
        isDeleted: false,
      },
    }),
  ]);

  const recentAssessments = await prisma.developmentAssessment.findMany({
    where: {
      isDeleted: false,
    },
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      student: {
        select: {
          name: true,
          nis: true,
        },
      },
      indicator: {
        select: {
          name: true,
          shortName: true,
          aspect: {
            select: {
              name: true,
              code: true,
            },
          },
        },
      },
    },
  });

  const developmentDistribution = await prisma.developmentAssessment.groupBy({
    by: ["development"],
    where: {
      isDeleted: false,
    },
    _count: {
      development: true,
    },
  });

  const classDistribution = await prisma.student.groupBy({
    by: ["classId"],
    where: {
      isDeleted: false,
    },
    _count: {
      classId: true,
    },
  });

  return {
    studentsCount,
    teachersCount,
    classesCount,
    assessmentsCount,
    aspectsCount,
    indicatorsCount,
    recentAssessments,
    developmentDistribution,
    classDistribution,
  };
});
