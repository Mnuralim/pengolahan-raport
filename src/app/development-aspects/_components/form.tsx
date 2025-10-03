"use client";

import {
  BookOpen,
  Loader2,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Target,
} from "lucide-react";
import Form from "next/form";
import React, { useActionState, useState } from "react";
import { ErrorMessage } from "../../_components/error-message";
import type { AgeGroup } from "@prisma/client";
import {
  createDevelopmentAspectWithIndicators,
  updateDevelopmentAspectWithIndicators,
} from "@/actions/development-aspect";
import type { DevelopmentAspectWithRelations } from "./list";

interface Props {
  modal: "add" | "edit" | "view";
  selectedAspect?: DevelopmentAspectWithRelations | null;
  onClose: () => void;
}

interface IndicatorFormData {
  id?: string;
  name: string;
  shortName?: string;
  order: number;
  ageGroup?: AgeGroup;
}

export const DevelopmentAspectForm = ({
  modal,
  selectedAspect,
  onClose,
}: Props) => {
  const [state, action, pending] = useActionState(
    selectedAspect && modal !== "add"
      ? updateDevelopmentAspectWithIndicators
      : createDevelopmentAspectWithIndicators,
    {
      error: null,
    }
  );

  const [indicators, setIndicators] = useState<IndicatorFormData[]>(() => {
    if (selectedAspect && selectedAspect.indicators.length > 0) {
      return selectedAspect.indicators.map((indicator, index) => ({
        id: indicator.id,
        name: indicator.name,
        shortName: indicator.shortName || "",
        order: indicator.order || index + 1,
        ageGroup: indicator.ageGroup || undefined,
      }));
    }
    return [{ name: "", shortName: "", order: 1 }];
  });

  const [deletedIndicatorIds, setDeletedIndicatorIds] = useState<string[]>([]);
  const [isViewExpanded, setIsViewExpanded] = useState<boolean>(false);

  const ageGroupOptions: { value: AgeGroup | ""; label: string }[] = [
    { value: "", label: "Semua Usia" },
    { value: "TODDLER", label: "Kelompok Bermain (2-4 tahun)" },
    { value: "GROUP_A", label: "Kelompok A (4-5 tahun)" },
    { value: "GROUP_B", label: "Kelompok B (5-6 tahun)" },
  ];

  const handleAddIndicator = () => {
    setIndicators([
      ...indicators,
      {
        name: "",
        shortName: "",
        order: indicators.length + 1,
      },
    ]);
  };

  const handleRemoveIndicator = (index: number) => {
    const indicator = indicators[index];
    if (indicator.id) {
      setDeletedIndicatorIds([...deletedIndicatorIds, indicator.id]);
    }
    setIndicators(indicators.filter((_, i) => i !== index));
  };

  const handleIndicatorChange = (
    index: number,
    field: keyof IndicatorFormData,
    value: string | number | AgeGroup
  ) => {
    const newIndicators = [...indicators];
    newIndicators[index] = {
      ...newIndicators[index],
      [field]: value,
    };
    setIndicators(newIndicators);
  };

  const formatAgeGroup = (ageGroup: string) => {
    const ageGroupMap: Record<string, string> = {
      GROUP_A: "Kelompok A (4-5 tahun)",
      GROUP_B: "Kelompok B (5-6 tahun)",
      TODDLER: "Kelompok Bermain (2-4 tahun)",
    };
    return ageGroupMap[ageGroup] || "Semua Usia";
  };

  const getAgeGroupColor = (ageGroup: string) => {
    const colorMap: Record<string, string> = {
      GROUP_A: "bg-blue-100 text-blue-800",
      GROUP_B: "bg-green-100 text-green-800",
      TODDLER: "bg-pink-100 text-pink-800",
    };
    return colorMap[ageGroup] || "bg-gray-100 text-gray-800";
  };

  if (modal === "view" && selectedAspect) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Detail Aspek Perkembangan
          </h2>
          <p className="text-sm text-gray-600">
            Informasi lengkap aspek perkembangan dan indikator-indikatornya
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <BookOpen className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Informasi Aspek
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Aspek
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg border">
                  <span className="font-mono text-sm">
                    {selectedAspect.code}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Urutan
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg border">
                  <span className="text-sm">{selectedAspect.order}</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Aspek
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg border">
                  <span className="text-sm font-medium">
                    {selectedAspect.name}
                  </span>
                </div>
              </div>

              {selectedAspect.description && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg border">
                    <span className="text-sm">
                      {selectedAspect.description}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Target className="w-5 h-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  Indikator Perkembangan ({selectedAspect.indicators.length})
                </h3>
              </div>
              <button
                onClick={() => setIsViewExpanded(!isViewExpanded)}
                className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                {isViewExpanded ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-1" />
                    Sembunyikan Detail
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    Lihat Detail
                  </>
                )}
              </button>
            </div>

            {selectedAspect.indicators.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Belum ada indikator untuk aspek ini</p>
              </div>
            ) : isViewExpanded ? (
              <div className="space-y-4">
                {selectedAspect.indicators.map((indicator) => (
                  <div
                    key={indicator.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {indicator.order}
                          </span>
                          {indicator.shortName && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {indicator.shortName}
                            </span>
                          )}
                          {indicator.ageGroup && (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getAgeGroupColor(
                                indicator.ageGroup
                              )}`}
                            >
                              {formatAgeGroup(indicator.ageGroup)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">
                          {indicator.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedAspect.indicators.map((indicator) => (
                  <div
                    key={indicator.id}
                    className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mr-3">
                      {indicator.order}
                    </span>
                    <span className="text-sm text-gray-700 truncate">
                      {indicator.shortName || indicator.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              type="button"
              className="px-6 py-2.5 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-150"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {modal === "add"
            ? "Tambah Aspek Perkembangan"
            : "Edit Aspek Perkembangan"}
        </h2>
        <p className="text-sm text-gray-600">
          {modal === "add"
            ? "Lengkapi informasi aspek perkembangan dan indikator-indikatornya"
            : "Perbarui informasi aspek perkembangan sesuai kebutuhan"}
        </p>
      </div>

      <Form action={action} className="space-y-6">
        <input
          type="hidden"
          name="id"
          defaultValue={selectedAspect?.id || ""}
        />

        {indicators.map((indicator, index) => (
          <div key={index}>
            <input
              type="hidden"
              name="indicatorIds"
              value={indicator.id || ""}
            />
            <input type="hidden" name="indicatorNames" value={indicator.name} />
            <input
              type="hidden"
              name="indicatorShortNames"
              value={indicator.shortName || ""}
            />
            <input
              type="hidden"
              name="indicatorOrders"
              value={indicator.order.toString()}
            />
            <input
              type="hidden"
              name="indicatorAgeGroups"
              value={indicator.ageGroup || ""}
            />
          </div>
        ))}

        {deletedIndicatorIds.map((id, index) => (
          <input
            key={index}
            type="hidden"
            name="deletedIndicatorIds"
            value={id}
          />
        ))}

        <ErrorMessage message={state.error} />

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <BookOpen className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Informasi Aspek Perkembangan
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Kode Aspek *
              </label>
              <input
                type="text"
                id="code"
                name="code"
                defaultValue={selectedAspect?.code || ""}
                placeholder="Contoh: NAM, FISIK, KOGNITIF"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150 font-mono"
                required
              />
            </div>

            <div>
              <label
                htmlFor="order"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Urutan Tampil
              </label>
              <input
                type="number"
                id="order"
                name="order"
                defaultValue={selectedAspect?.order || 1}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nama Aspek *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={selectedAspect?.name || ""}
                placeholder="Contoh: Nilai Agama dan Moral"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Deskripsi
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={selectedAspect?.description || ""}
                placeholder="Deskripsi aspek perkembangan (opsional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Target className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Indikator Perkembangan ({indicators.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={handleAddIndicator}
              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-150"
            >
              <Plus className="w-4 h-4 mr-1" />
              Tambah Indikator
            </button>
          </div>

          <div className="space-y-4">
            {indicators.map((indicator, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {index + 1}
                    </span>
                    <h4 className="text-sm font-medium text-gray-900">
                      Indikator {index + 1}
                    </h4>
                  </div>
                  {indicators.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveIndicator(index)}
                      className="inline-flex items-center justify-center w-6 h-6 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors duration-150"
                      title="Hapus Indikator"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Indikator *
                    </label>
                    <textarea
                      rows={2}
                      value={indicator.name}
                      onChange={(e) =>
                        handleIndicatorChange(index, "name", e.target.value)
                      }
                      placeholder="Contoh: Anak dapat berdoa sebelum dan sesudah melakukan kegiatan"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Singkat
                    </label>
                    <input
                      type="text"
                      value={indicator.shortName || ""}
                      onChange={(e) =>
                        handleIndicatorChange(
                          index,
                          "shortName",
                          e.target.value
                        )
                      }
                      placeholder="Contoh: Berdoa"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urutan
                    </label>
                    <input
                      type="number"
                      value={indicator.order}
                      onChange={(e) =>
                        handleIndicatorChange(
                          index,
                          "order",
                          parseInt(e.target.value) || 1
                        )
                      }
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kelompok Usia
                    </label>
                    <select
                      value={indicator.ageGroup || ""}
                      onChange={(e) =>
                        handleIndicatorChange(
                          index,
                          "ageGroup",
                          e.target.value as AgeGroup
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
                    >
                      {ageGroupOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {indicators.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="mb-4">Belum ada indikator</p>
              <button
                type="button"
                onClick={handleAddIndicator}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-150"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Indikator Pertama
              </button>
            </div>
          )}
        </div>

        {indicators.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Ringkasan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Total Indikator:</span>
                <span className="ml-2 font-medium text-blue-900">
                  {indicators.length}
                </span>
              </div>
              <div>
                <span className="text-blue-700">Dengan Kelompok Usia:</span>
                <span className="ml-2 font-medium text-blue-900">
                  {indicators.filter((ind) => ind.ageGroup).length}
                </span>
              </div>
              <div>
                <span className="text-blue-700">Nama Singkat:</span>
                <span className="ml-2 font-medium text-blue-900">
                  {indicators.filter((ind) => ind.shortName).length}
                </span>
              </div>
            </div>
          </div>
        )}

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
              indicators.length === 0 ||
              indicators.some((ind) => !ind.name)
            }
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            {pending ? (
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                {modal === "add" ? "Menambahkan..." : "Menyimpan..."}
              </div>
            ) : modal === "add" ? (
              "Tambah Aspek Perkembangan"
            ) : (
              "Simpan Perubahan"
            )}
          </button>
        </div>
      </Form>
    </div>
  );
};
