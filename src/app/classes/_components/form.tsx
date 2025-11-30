import { GraduationCap, Loader2, Users, UserCheck, X } from "lucide-react";
import Form from "next/form";
import React, { useActionState, useState } from "react";
import { ErrorMessage } from "../../_components/error-message";
import type { Teacher, AgeGroup } from "@prisma/client";
import { createClass, updateClass } from "@/actions/class";
import type { ClassWithRelations } from "./list";

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

  // State untuk guru yang dipilih
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>(
    selectedClass?.teachers.map((ct) => ct.teacherId) || []
  );

  // State untuk wali kelas utama
  const [primaryTeacher, setPrimaryTeacher] = useState<string>(
    selectedClass?.teachers.find((ct) => ct.isPrimary)?.teacherId || ""
  );

  const ageGroupOptions: { value: AgeGroup; label: string }[] = [
    { value: "TODDLER", label: "Toddler (1-2 tahun)" },
    { value: "GROUP_A", label: "Group A (3-4 tahun)" },
    { value: "GROUP_B", label: "Group B (5-6 tahun)" },
  ];

  const handleTeacherToggle = (teacherId: string) => {
    setSelectedTeachers((prev) => {
      if (prev.includes(teacherId)) {
        // Jika guru dihapus dan dia adalah wali kelas utama, reset primary
        if (primaryTeacher === teacherId) {
          setPrimaryTeacher("");
        }
        return prev.filter((id) => id !== teacherId);
      } else {
        return [...prev, teacherId];
      }
    });
  };

  const handlePrimaryTeacher = (teacherId: string) => {
    // Pastikan guru sudah dipilih sebelum dijadikan wali kelas utama
    if (!selectedTeachers.includes(teacherId)) {
      setSelectedTeachers((prev) => [...prev, teacherId]);
    }
    setPrimaryTeacher(teacherId);
  };

  const getSelectedTeacherObjects = () => {
    return teachers.filter((t) => selectedTeachers.includes(t.id));
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
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
        <input type="hidden" name="primaryTeacherId" value={primaryTeacher} />
        <input
          type="hidden"
          name="teacherIds"
          value={JSON.stringify(selectedTeachers)}
        />

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

            <div className="md:col-span-2">
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
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <Users className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Wali Kelas *</h3>
          </div>

          {teachers.length === 0 ? (
            <p className="text-sm text-amber-600">
              Belum ada guru yang tersedia. Tambahkan guru terlebih dahulu.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Pilih guru yang akan mengajar di kelas ini. Anda dapat memilih
                lebih dari satu guru.
              </p>

              {/* Guru yang sudah dipilih */}
              {selectedTeachers.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-3">
                    Guru Terpilih ({selectedTeachers.length})
                  </p>
                  <div className="space-y-2">
                    {getSelectedTeacherObjects().map((teacher) => (
                      <div
                        key={teacher.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {teacher.name}
                            </p>
                            {teacher.nip && (
                              <p className="text-xs text-gray-500">
                                NIP: {teacher.nip}
                              </p>
                            )}
                          </div>
                          {primaryTeacher === teacher.id && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                              <UserCheck className="w-3 h-3 inline mr-1" />
                              Utama
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {primaryTeacher !== teacher.id && (
                            <button
                              type="button"
                              onClick={() => handlePrimaryTeacher(teacher.id)}
                              className="px-3 py-1 text-xs font-medium text-green-700 bg-green-50 rounded hover:bg-green-100 transition-colors"
                            >
                              Jadikan Utama
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleTeacherToggle(teacher.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Daftar semua guru */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {teachers.map((teacher) => {
                  const isSelected = selectedTeachers.includes(teacher.id);
                  return (
                    <label
                      key={teacher.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? "bg-blue-50 border-blue-300"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleTeacherToggle(teacher.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {teacher.name}
                        </p>
                        {teacher.nip && (
                          <p className="text-xs text-gray-500">
                            NIP: {teacher.nip}
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              {selectedTeachers.length === 0 && (
                <p className="text-sm text-red-600 mt-2">
                  Minimal pilih satu guru untuk kelas ini
                </p>
              )}
            </>
          )}
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
            disabled={
              pending || teachers.length === 0 || selectedTeachers.length === 0
            }
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
