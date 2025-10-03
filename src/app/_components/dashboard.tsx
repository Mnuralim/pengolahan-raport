"use client";

import React from "react";
import {
  Users,
  BookOpen,
  GraduationCap,
  Activity,
  Clock,
  School,
  ClipboardCheck,
  TrendingUp,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface DevelopmentAssessment {
  id: string;
  development: string;
  createdAt: Date;
  student: {
    name: string;
    nis: string;
  };
  indicator: {
    name: string;
    shortName: string | null;
    aspect: {
      name: string;
      code: string;
    };
  };
}

interface Props {
  studentsCount: number;
  teachersCount: number;
  classesCount: number;
  assessmentsCount: number;
  aspectsCount: number;
  indicatorsCount: number;
  recentAssessments: DevelopmentAssessment[];
  developmentDistribution: Array<{
    development: string;
    _count: { development: number };
  }>;
}

const developmentLevelMap = {
  BAIK: { label: "Baik", color: "bg-green-100 text-green-700" },
  CUKUP: { label: "Cukup", color: "bg-yellow-100 text-yellow-700" },
  PERLU_DILATIH: {
    label: "Perlu Dilatih",
    color: "bg-orange-100 text-orange-700",
  },
};

export const Dashboard = ({
  studentsCount,
  teachersCount,
  classesCount,
  assessmentsCount,
  aspectsCount,
  indicatorsCount,
  recentAssessments,
  developmentDistribution,
}: Props) => {
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <p className="text-gray-600">
          Selamat datang di Sistem Informasi Penilaian PAUD
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Siswa</p>
              <p className="text-2xl font-semibold text-gray-900">
                {studentsCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Guru</p>
              <p className="text-2xl font-semibold text-gray-900">
                {teachersCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Kelas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {classesCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <School className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Penilaian Hari Ini
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {assessmentsCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">
              Aspek Perkembangan
            </h3>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{aspectsCount}</p>
            <p className="text-sm text-gray-600">aspek dengan</p>
            <p className="text-2xl font-semibold text-gray-700">
              {indicatorsCount}
            </p>
            <p className="text-sm text-gray-600">indikator</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">
              Distribusi Perkembangan
            </h3>
          </div>
          <div className="space-y-2">
            {developmentDistribution.map((item) => (
              <div
                key={item.development}
                className="flex items-center justify-between"
              >
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    developmentLevelMap[
                      item.development as keyof typeof developmentLevelMap
                    ]?.color || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {developmentLevelMap[
                    item.development as keyof typeof developmentLevelMap
                  ]?.label || item.development}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {item._count.development}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">
              Penilaian Terbaru
            </h3>
          </div>
          <div className="space-y-4">
            {recentAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="flex gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ClipboardCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="text-sm font-medium text-gray-900">
                      {assessment.student.name}
                    </h4>
                    <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
                      {assessment.student.nis}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        developmentLevelMap[
                          assessment.development as keyof typeof developmentLevelMap
                        ]?.color || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {developmentLevelMap[
                        assessment.development as keyof typeof developmentLevelMap
                      ]?.label || assessment.development}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">
                      {assessment.indicator.aspect.name}
                    </span>
                    {" - "}
                    {assessment.indicator.shortName ||
                      assessment.indicator.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(assessment.createdAt, true)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-0">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Aksi Cepat
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/students?modal=add"
              className="p-4 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors text-left"
            >
              <Users className="w-6 h-6 text-gray-700 mb-2" />
              <p className="text-sm font-medium text-gray-900">Tambah Siswa</p>
            </Link>
            <Link
              href="/assessments?modal=add"
              className="p-4 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors text-left"
            >
              <ClipboardCheck className="w-6 h-6 text-gray-700 mb-2" />
              <p className="text-sm font-medium text-gray-900">
                Input Penilaian
              </p>
            </Link>
            <Link
              href="/classes"
              className="p-4 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors text-left"
            >
              <School className="w-6 h-6 text-gray-700 mb-2" />
              <p className="text-sm font-medium text-gray-900">Kelola Kelas</p>
            </Link>
            <Link
              href="/reports"
              className="p-4 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors text-left"
            >
              <BookOpen className="w-6 h-6 text-gray-700 mb-2" />
              <p className="text-sm font-medium text-gray-900">
                Laporan Perkembangan
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
