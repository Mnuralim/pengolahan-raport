import { Calendar, Loader2 } from "lucide-react";
import Form from "next/form";
import React, { useActionState } from "react";
import { ErrorMessage } from "../../_components/error-message";
import type { AcademicYear } from "@prisma/client";
import {
  createAcademicYear,
  updateAcademicYear,
} from "@/actions/academic-year";

interface Props {
  modal: "add" | "edit";
  selectedAcademicYear?: AcademicYear | null;
  onClose: () => void;
}

export const AcademicYearForm = ({
  modal,
  selectedAcademicYear,
  onClose,
}: Props) => {
  const [state, action, pending] = useActionState(
    selectedAcademicYear ? updateAcademicYear : createAcademicYear,
    {
      error: null,
    }
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {modal === "add" ? "Tambah Tahun Ajaran" : "Edit Tahun Ajaran"}
        </h2>
        <p className="text-sm text-gray-600">
          {modal === "add"
            ? "Lengkapi informasi untuk menambahkan tahun ajaran baru"
            : "Perbarui informasi tahun ajaran sesuai kebutuhan"}
        </p>
      </div>

      <Form action={action} className="space-y-6">
        <input
          type="hidden"
          name="id"
          defaultValue={selectedAcademicYear?.id || ""}
        />
        <ErrorMessage message={state.error} />

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Informasi Tahun Ajaran
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="year"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tahun Ajaran *
              </label>
              <input
                type="text"
                id="year"
                name="year"
                defaultValue={selectedAcademicYear?.year || ""}
                placeholder="Contoh: 2024/2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: YYYY/YYYY (contoh: 2024/2025)
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Calendar className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Format Tahun Ajaran
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Gunakan format YYYY/YYYY untuk tahun ajaran. Contoh:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>2024/2025</li>
                      <li>2025/2026</li>
                      <li>2026/2027</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedAcademicYear && (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Informasi Tambahan
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Dibuat pada:</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Intl.DateTimeFormat("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(selectedAcademicYear.createdAt))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Terakhir diubah:</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Intl.DateTimeFormat("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(selectedAcademicYear.updatedAt))}
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
            disabled={pending}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            {pending ? (
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                {modal === "add" ? "Menambahkan..." : "Menyimpan..."}
              </div>
            ) : modal === "add" ? (
              "Tambah Tahun Ajaran"
            ) : (
              "Simpan Perubahan"
            )}
          </button>
        </div>
      </Form>
    </div>
  );
};
