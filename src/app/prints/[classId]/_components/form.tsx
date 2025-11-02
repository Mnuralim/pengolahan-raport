import { GraduationCap, Loader2, Users } from "lucide-react";
import Form from "next/form";
import React, { useActionState } from "react";
import { ErrorMessage } from "../../../_components/error-message";
import type { Teacher, AgeGroup } from "@prisma/client";
import { createClass, updateClass } from "@/actions/class";
import type { ClassWithRelations } from "@/app/classes/_components/list";

interface Props {
  modal: "add" | "edit";
  selectedClass?: ClassWithRelations | null;
  onClose: () => void;
  teachers?: Teacher[];
}

export const ClassForm = ({
  modal,
  selectedClass,
  onClose,
  teachers = [],
}: Props) => {
  const [state, action, pending] = useActionState(
    selectedClass ? updateClass : createClass,
    {
      error: null,
    }
  );

  const ageGroupOptions: { value: AgeGroup; label: string }[] = [
    { value: "TODDLER", label: "Toddler (1-2 tahun)" },
    { value: "GROUP_A", label: "Group A (3-4 tahun)" },
    { value: "GROUP_B", label: "Group B (5-6 tahun)" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {modal === "add" ? "Tambah Kelas" : "Edit Kelas"}
        </h2>
        <p className="text-sm text-gray-600">
          {modal === "add"
            ? "Lengkapi informasi untuk menambahkan kelas baru"
            : "Perbarui informasi kelas sesuai kebutuhan"}
        </p>
      </div>

      <Form action={action} className="space-y-6">
        <input type="hidden" name="id" defaultValue={selectedClass?.id || ""} />
        <ErrorMessage message={state.error} />

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <GraduationCap className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Informasi Kelas
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nama Kelas *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={selectedClass?.name || ""}
                placeholder="Masukkan nama kelas (contoh: Kelas A, Kelas Mawar, dll)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
                required
              />
            </div>

            <div>
              <label
                htmlFor="ageGroup"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Kelompok Usia *
              </label>
              <select
                id="ageGroup"
                name="ageGroup"
                defaultValue={selectedClass?.ageGroup || "TODDLER"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
                required
              >
                {ageGroupOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="teacherId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Guru Kelas *
              </label>
              <select
                id="teacherId"
                name="teacherId"
                defaultValue={selectedClass?.teacherId || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
                required
              >
                <option value="">Pilih Guru</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} {teacher.nip ? `(${teacher.nip})` : ""}
                  </option>
                ))}
              </select>
              {teachers.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Belum ada guru yang tersedia. Tambahkan guru terlebih dahulu.
                </p>
              )}
            </div>
          </div>
        </div>

        {selectedClass && (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Statistik Kelas
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Jumlah Siswa</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {selectedClass._count.students}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-lg font-medium text-green-600">Aktif</p>
                  </div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>
            </div>

            {selectedClass._count.students > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Perhatian:</strong> Kelas ini memiliki{" "}
                  {selectedClass._count.students} siswa. Pastikan perubahan yang
                  dilakukan tidak mengganggu proses pembelajaran.
                </p>
              </div>
            )}
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
            disabled={pending || teachers.length === 0}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            {pending ? (
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                {modal === "add" ? "Menambahkan..." : "Menyimpan..."}
              </div>
            ) : modal === "add" ? (
              "Tambah Kelas"
            ) : (
              "Simpan Perubahan"
            )}
          </button>
        </div>
      </Form>
    </div>
  );
};
