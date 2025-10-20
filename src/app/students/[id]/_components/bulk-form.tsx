import { ClipboardCheck, Loader2, User, Edit3, Plus } from "lucide-react";
import Form from "next/form";
import React, { useActionState, useState, useEffect } from "react";
import { ErrorMessage } from "../../../_components/error-message";
import type { Student, DevelopmentLevel, Prisma } from "@prisma/client";
import {
  createBulkDevelopmentAssessments,
  updateBulkDevelopmentAssessments,
} from "@/actions/development-assessment";

type DevelopmentIndicatorWithAspect = Prisma.DevelopmentIndicatorGetPayload<{
  include: {
    aspect: true;
  };
}>;

interface DevelopmentAssessmentWithRelations {
  id: string;
  development: DevelopmentLevel;
  notes: string | null;
  assessmentDate: Date | null;
  indicatorId: string;
  indicator: {
    id: string;
    name: string;
    aspect: {
      id: string;
      name: string;
    };
  };
}

interface Props {
  onClose: () => void;
  student: Student & {
    developmentAssessments?: DevelopmentAssessmentWithRelations[];
  };
  indicators?: DevelopmentIndicatorWithAspect[];
}

export const DevelopmentAssessmentBulkForm = ({
  onClose,
  student,
  indicators = [],
}: Props) => {
  const existingAssessments = student.developmentAssessments;
  const hasExistingAssessments = existingAssessments!.length > 0;
  const isEditMode = hasExistingAssessments;

  const [state, action, pending] = useActionState(
    isEditMode
      ? updateBulkDevelopmentAssessments
      : createBulkDevelopmentAssessments,
    {
      error: null,
    }
  );

  const [selectedStudent, setSelectedStudent] = useState<string>(student.id);
  const [assessmentDate, setAssessmentDate] = useState<string>("");
  const [assessments, setAssessments] = useState<
    Record<
      string,
      {
        development?: DevelopmentLevel;
        notes?: string;
        assessmentId?: string;
      }
    >
  >({});

  useEffect(() => {
    if (isEditMode) {
      const existingData: Record<
        string,
        {
          development?: DevelopmentLevel;
          notes?: string;
          assessmentId?: string;
        }
      > = {};

      existingAssessments!.forEach((assessment) => {
        existingData[assessment.indicatorId] = {
          development: assessment.development,
          notes: assessment.notes || undefined,
          assessmentId: assessment.id,
        };
      });

      setAssessments(existingData);

      if (
        existingAssessments!.length > 0 &&
        existingAssessments![0].assessmentDate
      ) {
        setAssessmentDate(
          new Date(existingAssessments![0].assessmentDate)
            .toISOString()
            .split("T")[0]
        );
      }
    }
  }, [isEditMode, existingAssessments]);

  const developmentLevelOptions: {
    value: DevelopmentLevel;
    label: string;
    shortLabel: string;
  }[] = [
    {
      value: "BAIK",
      label: "Baik (✓✓✓)",
      shortLabel: "Baik",
    },
    {
      value: "CUKUP",
      label: "Cukup (✓✓)",
      shortLabel: "Cukup",
    },
    {
      value: "PERLU_DILATIH",
      label: "Perlu Dilatih (✓)",
      shortLabel: "Perlu Dilatih",
    },
  ];

  const handleAssessmentChange = (
    indicatorId: string,
    field: "development" | "notes",
    value: string
  ) => {
    setAssessments((prev) => ({
      ...prev,
      [indicatorId]: {
        ...prev[indicatorId],
        [field]: value || undefined,
      },
    }));
  };

  const handleSubmit = (formData: FormData) => {
    const assessmentData = indicators
      .map((indicator) => {
        const assessment = assessments[indicator.id];
        return {
          indicatorId: indicator.id,
          development: assessment?.development,
          notes: assessment?.notes,
          assessmentDate: assessmentDate || null,
          assessmentId: assessment?.assessmentId,
        };
      })
      .filter((item) => item.development);

    formData.set("assessmentData", JSON.stringify(assessmentData));
    formData.set("isEditMode", isEditMode.toString());
    action(formData);
  };

  const getFilledCount = () => {
    return Object.values(assessments).filter((a) => a.development).length;
  };
  const indicatorsToShow = isEditMode
    ? indicators
    : indicators.filter(
        (indicator) =>
          !existingAssessments!.some(
            (assessment) => assessment.indicatorId === indicator.id
          )
      );

  const groupedIndicatorsToShow = indicatorsToShow.reduce((acc, indicator) => {
    const aspectName = indicator.aspect.name;
    if (!acc[aspectName]) {
      acc[aspectName] = [];
    }
    acc[aspectName].push(indicator);
    return acc;
  }, {} as Record<string, DevelopmentIndicatorWithAspect[]>);

  return (
    <div className="w-full max-w-6xl mx-auto max-h-[90vh] overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {isEditMode ? (
            <Edit3 className="w-6 h-6 text-blue-600" />
          ) : (
            <Plus className="w-6 h-6 text-green-600" />
          )}
          <h2 className="text-2xl font-semibold text-gray-900">
            {isEditMode ? "Edit" : "Tambah"} Penilaian Perkembangan
          </h2>
        </div>
        <p className="text-sm text-gray-600">
          {isEditMode
            ? "Edit penilaian perkembangan yang sudah ada"
            : "Isi penilaian untuk indikator perkembangan yang belum dinilai"}
        </p>

        {!isEditMode && indicatorsToShow.length === 0 && (
          <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Semua indikator sudah dinilai:</strong> Semua indikator
              perkembangan untuk siswa ini sudah memiliki penilaian. Gunakan
              tombol edit pada halaman detail untuk mengubah penilaian yang
              sudah ada.
            </p>
          </div>
        )}
      </div>

      {indicatorsToShow.length === 0 && !isEditMode ? (
        <div className="text-center py-12">
          <ClipboardCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Semua Indikator Sudah Dinilai
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Tidak ada indikator yang perlu dinilai. Semua penilaian sudah
            lengkap.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      ) : (
        <Form action={handleSubmit} className="space-y-6">
          <input type="hidden" name="studentId" value={selectedStudent} />
          <ErrorMessage message={state.error} />

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Informasi Siswa
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="studentId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nama Siswa *
                </label>
                <select
                  id="studentId"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150 
                  bg-gray-100 cursor-not-allowed"
                  required
                  disabled
                >
                  <option value={student.id}>{student.name}</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="assessmentDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tanggal Penilaian
                </label>
                <input
                  type="date"
                  id="assessmentDate"
                  value={assessmentDate}
                  disabled
                  onChange={(e) => setAssessmentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150 bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-lg border ${
              isEditMode
                ? "bg-blue-50 border-blue-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <div
              className={`flex items-center justify-between text-sm ${
                isEditMode ? "text-blue-800" : "text-green-800"
              }`}
            >
              <span>
                {isEditMode ? "Progress Edit:" : "Progress Penilaian:"}
              </span>
              <span className="font-medium">
                {getFilledCount()} dari {indicatorsToShow.length} indikator
              </span>
            </div>
            <div
              className={`mt-2 rounded-full h-2 ${
                isEditMode ? "bg-blue-200" : "bg-green-200"
              }`}
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isEditMode ? "bg-blue-600" : "bg-green-600"
                }`}
                style={{
                  width: `${
                    (getFilledCount() / indicatorsToShow.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedIndicatorsToShow).map(
              ([aspectName, aspectIndicators]) => (
                <div
                  key={aspectName}
                  className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center mb-6">
                    <ClipboardCheck className="w-5 h-5 text-gray-400 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">
                      {aspectName}
                    </h3>
                    <span className="ml-auto text-sm text-gray-500">
                      {
                        aspectIndicators.filter(
                          (ind) => assessments[ind.id]?.development
                        ).length
                      }{" "}
                      / {aspectIndicators.length} terisi
                    </span>
                  </div>

                  <div className="space-y-6">
                    {aspectIndicators.map((indicator) => (
                      <div
                        key={indicator.id}
                        className={`border rounded-lg p-4 ${
                          isEditMode && assessments[indicator.id]?.assessmentId
                            ? "border-blue-200 bg-blue-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="mb-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {indicator.name}
                            </h4>
                            {isEditMode &&
                              assessments[indicator.id]?.assessmentId && (
                                <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                                  Sudah ada penilaian
                                </span>
                              )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tingkat Perkembangan
                            </label>
                            <div className="space-y-2">
                              {developmentLevelOptions.map((option) => (
                                <label
                                  key={option.value}
                                  className="flex items-center space-x-3 p-2 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                >
                                  <input
                                    type="radio"
                                    name={`development_${indicator.id}`}
                                    value={option.value}
                                    checked={
                                      assessments[indicator.id]?.development ===
                                      option.value
                                    }
                                    onChange={(e) =>
                                      handleAssessmentChange(
                                        indicator.id,
                                        "development",
                                        e.target.value
                                      )
                                    }
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                  />
                                  <span className="text-sm text-gray-900">
                                    {option.label}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Catatan (Opsional)
                            </label>
                            <textarea
                              rows={4}
                              value={assessments[indicator.id]?.notes || ""}
                              onChange={(e) =>
                                handleAssessmentChange(
                                  indicator.id,
                                  "notes",
                                  e.target.value
                                )
                              }
                              placeholder="Berikan catatan tambahan..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              type="button"
              className="w-full sm:w-auto px-6 py-2.5 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-150"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={
                pending ||
                !selectedStudent ||
                indicatorsToShow.length === 0 ||
                getFilledCount() === 0
              }
              className={`w-full sm:w-auto px-6 py-2.5 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ${
                isEditMode
                  ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                  : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
              }`}
            >
              {pending ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  {isEditMode ? "Menyimpan..." : "Menambah..."}
                </div>
              ) : (
                `${
                  isEditMode ? "Simpan Perubahan" : "Simpan Penilaian"
                } (${getFilledCount()} indikator)`
              )}
            </button>
          </div>
        </Form>
      )}
    </div>
  );
};
