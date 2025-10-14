"use client";

import { Modal } from "@/app/_components/modal";
import type {
  DevelopmentAssessment,
  DevelopmentIndicator,
  DevelopmentAspect,
  Prisma,
} from "@prisma/client";
import {
  ArrowLeft,
  User,
  Calendar,
  MapPin,
  BookOpen,
  Clock,
  Home,
  ClipboardCheck,
  Plus,
  Star,
  Edit3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { calculateAge, formatDate } from "@/lib/utils";
import { DevelopmentAssessmentBulkForm } from "./bulk-form";

interface DevelopmentAssessmentWithRelations extends DevelopmentAssessment {
  indicator: DevelopmentIndicator & {
    aspect: DevelopmentAspect;
  };
}

export type DevelopmentIndicatorWithAspect =
  Prisma.DevelopmentIndicatorGetPayload<{
    include: {
      aspect: true;
    };
  }>;

export type StudentWithAssessments = Prisma.StudentGetPayload<{
  include: {
    class: true;
    physicalDevelopments: true;
    developmentAssessments: {
      include: {
        indicator: {
          include: {
            aspect: true;
          };
        };
      };
    };
  };
}>;

interface Props {
  student: StudentWithAssessments;
  indicators: DevelopmentIndicatorWithAspect[];
}

type TabType = "profile" | "assessments";

export const StudentDetail = ({ student, indicators }: Props) => {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const existingAssessments = student.developmentAssessments || [];
  const hasExistingAssessments = existingAssessments.length > 0;

  const assessedIndicatorIds = new Set(
    existingAssessments.map((assessment) => assessment.indicator.id)
  );
  const unassessedIndicators = indicators.filter(
    (indicator) => !assessedIndicatorIds.has(indicator.id)
  );

  const handleAddAssessment = () => {
    setIsModalOpen(true);
  };

  const handleEditAssessment = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const developmentLevelLabels = {
    BAIK: "Baik (✓✓✓)",
    CUKUP: "Cukup (✓✓)",
    PERLU_DILATIH: "Perlu Dilatih (✓)",
  };

  const developmentLevelColors = {
    BAIK: "text-green-700 bg-green-100",
    CUKUP: "text-yellow-700 bg-yellow-100",
    PERLU_DILATIH: "text-red-700 bg-red-100",
  };

  const groupedAssessments =
    student.developmentAssessments?.reduce((acc, assessment) => {
      const aspectName = assessment.indicator.aspect.name;
      if (!acc[aspectName]) {
        acc[aspectName] = [];
      }
      acc[aspectName].push(assessment);
      return acc;
    }, {} as Record<string, DevelopmentAssessmentWithRelations[]>) || {};

  const tabs = [{ id: "profile", label: "Profil", icon: User }];

  return (
    <div>
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Detail Siswa
                </h1>
                <p className="text-sm text-gray-600">
                  Informasi lengkap data siswa
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              {activeTab === "assessments" && (
                <div className="flex gap-2">
                  {hasExistingAssessments && (
                    <button
                      onClick={handleEditAssessment}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Edit Penilaian
                      </span>
                    </button>
                  )}
                  {unassessedIndicators.length > 0 && (
                    <button
                      onClick={handleAddAssessment}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Tambah Penilaian ({unassessedIndicators.length})
                      </span>
                    </button>
                  )}
                  {!hasExistingAssessments && (
                    <button
                      onClick={handleAddAssessment}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Tambah Penilaian
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="py-6">
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                <User className="w-10 h-10 text-gray-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {student.name}
                </h2>
                <p className="text-sm text-gray-600 mb-3">NIS: {student.nis}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">
                      {student.gender === "MALE" ? "Laki-laki" : "Perempuan"}
                    </span>
                  </div>
                  {student.birthDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {calculateAge(new Date(student.birthDate).toString())}{" "}
                        tahun
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span className="font-medium">{student.academicYear}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {activeTab === "assessments" && (
          <div className="bg-white rounded-lg border border-gray-200 mb-6 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Status Penilaian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">
                      Sudah Dinilai
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {existingAssessments.length}
                    </p>
                  </div>
                  <ClipboardCheck className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-700">
                      Belum Dinilai
                    </p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {unassessedIndicators.length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">
                      Total Indikator
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {indicators.length}
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progress Penilaian:</span>
                <span className="font-medium">
                  {existingAssessments.length} dari {indicators.length}{" "}
                  indikator
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (existingAssessments.length / indicators.length) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.id === "assessments" &&
                      existingAssessments.length > 0 && (
                        <span className="ml-1 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                          {existingAssessments.length}
                        </span>
                      )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Informasi Pribadi
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Nama Lengkap
                          </p>
                          <p className="text-sm text-gray-900">
                            {student.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <BookOpen className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            NIS
                          </p>
                          <p className="text-sm text-gray-900">{student.nis}</p>
                        </div>
                      </div>

                      {student.birthPlace && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Tempat Lahir
                            </p>
                            <p className="text-sm text-gray-900">
                              {student.birthPlace}
                            </p>
                          </div>
                        </div>
                      )}

                      {student.birthDate && (
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Tanggal Lahir
                            </p>
                            <p className="text-sm text-gray-900">
                              {formatDate(student.birthDate)}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Jenis Kelamin
                          </p>
                          <p className="text-sm text-gray-900">
                            {student.gender === "MALE"
                              ? "Laki-laki"
                              : "Perempuan"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <BookOpen className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Agama
                          </p>
                          <p className="text-sm text-gray-900">
                            {student.religion}
                          </p>
                        </div>
                      </div>

                      {student.address && (
                        <div className="flex items-start gap-3">
                          <Home className="w-5 h-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Alamat
                            </p>
                            <p className="text-sm text-gray-900">
                              {student.address}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Informasi Keluarga
                    </h3>

                    <div className="space-y-3">
                      {student.fatherName && (
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Nama Ayah
                            </p>
                            <p className="text-sm text-gray-900">
                              {student.fatherName}
                            </p>
                          </div>
                        </div>
                      )}

                      {student.motherName && (
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Nama Ibu
                            </p>
                            <p className="text-sm text-gray-900">
                              {student.motherName}
                            </p>
                          </div>
                        </div>
                      )}

                      {student.fatherOccupation && (
                        <div className="flex items-start gap-3">
                          <BookOpen className="w-5 h-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Pekerjaan Ayah
                            </p>
                            <p className="text-sm text-gray-900">
                              {student.fatherOccupation}
                            </p>
                          </div>
                        </div>
                      )}

                      {student.motherOccupation && (
                        <div className="flex items-start gap-3">
                          <BookOpen className="w-5 h-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Pekerjaan Ibu
                            </p>
                            <p className="text-sm text-gray-900">
                              {student.motherOccupation}
                            </p>
                          </div>
                        </div>
                      )}

                      {student.childOrder && (
                        <div className="flex items-start gap-3">
                          <BookOpen className="w-5 h-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Anak Ke-
                            </p>
                            <p className="text-sm text-gray-900">
                              {student.childOrder}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Tahun Akademik
                          </p>
                          <p className="text-sm text-gray-900">
                            {student.academicYear}
                          </p>
                        </div>
                      </div>

                      {student.admittedAt && (
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Tanggal Masuk
                            </p>
                            <p className="text-sm text-gray-900">
                              {formatDate(student.admittedAt)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "assessments" && (
              <div className="space-y-6">
                {Object.keys(groupedAssessments).length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Belum Ada Penilaian Perkembangan
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Mulai tambahkan penilaian perkembangan untuk siswa ini.
                    </p>

                    <button
                      onClick={handleAddAssessment}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Penilaian Pertama
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedAssessments).map(
                      ([aspectName, assessments]) => (
                        <div
                          key={aspectName}
                          className="bg-gray-50 rounded-lg p-6"
                        >
                          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-blue-500" />
                            {aspectName}
                          </h4>
                          <div className="grid gap-4">
                            {assessments.map((assessment) => (
                              <div
                                key={assessment.id}
                                className="bg-white rounded-lg p-4 border border-gray-200"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h5 className="font-medium text-gray-900">
                                    {assessment.indicator.name}
                                  </h5>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      developmentLevelColors[
                                        assessment.development
                                      ]
                                    }`}
                                  >
                                    {
                                      developmentLevelLabels[
                                        assessment.development
                                      ]
                                    }
                                  </span>
                                </div>
                                {assessment.notes && (
                                  <p className="text-sm text-gray-600 mb-2">
                                    {assessment.notes}
                                  </p>
                                )}
                                {assessment.assessmentDate && (
                                  <p className="text-xs text-gray-500">
                                    Dinilai pada:{" "}
                                    {formatDate(assessment.assessmentDate)}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal onClose={handleClose} isOpen={isModalOpen}>
        {isModalOpen && (
          <DevelopmentAssessmentBulkForm
            onClose={handleClose}
            student={student}
            indicators={indicators}
          />
        )}
      </Modal>
    </div>
  );
};
