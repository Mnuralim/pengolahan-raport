import { Loader2, GraduationCap, Heart, Ruler, Upload, X } from "lucide-react";
import Form from "next/form";
import React, { useActionState, useState } from "react";
import { ErrorMessage } from "../../_components/error-message";
import type { Class } from "@prisma/client";
import { createStudent, updateStudent } from "@/actions/student";
import type { StudentWithClass } from "./list";
import Image from "next/image";

interface Props {
  modal: "add" | "edit";
  selectedStudent?: StudentWithClass | null;
  onClose: () => void;
  classes: Class[];
}

export const StudentForm = ({
  modal,
  selectedStudent,
  onClose,
  classes,
}: Props) => {
  const [state, action, pending] = useActionState(
    selectedStudent ? updateStudent : createStudent,
    {
      error: null,
    }
  );

  const [previewImage, setPreviewImage] = useState<string | null>(
    selectedStudent?.imageUrl || null
  );

  const formatDateForInput = (date: Date | string | null) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toISOString().split("T")[0];
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    const fileInput = document.getElementById(
      "profileImage"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {modal === "add" ? "Tambah Siswa" : "Edit Siswa"}
        </h2>
        <p className="text-sm text-gray-600">
          {modal === "add"
            ? "Lengkapi informasi untuk menambahkan siswa baru"
            : "Perbarui informasi siswa sesuai kebutuhan"}
        </p>
      </div>

      <Form action={action} className="space-y-8">
        <input
          type="hidden"
          name="id"
          defaultValue={selectedStudent?.id || ""}
        />
        <ErrorMessage message={state.error} />

        {/* Profile Image Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-6">
            <Upload className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Foto Profil</h3>
          </div>

          <div className="flex flex-col items-center space-y-4">
            {previewImage ? (
              <div className="relative">
                <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-gray-200">
                  <Image
                    src={previewImage}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-40 h-40 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                <Upload className="w-12 h-12 text-gray-400" />
              </div>
            )}

            <div className="w-full max-w-md">
              <label
                htmlFor="profileImage"
                className="block text-sm font-medium text-gray-700 mb-2 text-center"
              >
                Upload Foto Profil
              </label>
              <input
                type="file"
                id="profileImage"
                name="profileImage"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Format: JPG, PNG, atau GIF. Maksimal 5MB
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-6">
            <GraduationCap className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Data Dasar Siswa
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="nis"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                NIS *
              </label>
              <input
                type="text"
                id="nis"
                name="nis"
                defaultValue={selectedStudent?.nis || ""}
                placeholder="Nomor Induk Siswa"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
                required
              />
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nama Lengkap *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={selectedStudent?.name || ""}
                placeholder="Nama lengkap siswa"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
                required
              />
            </div>

            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Jenis Kelamin *
              </label>
              <select
                id="gender"
                name="gender"
                defaultValue={selectedStudent?.gender || "MALE"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
                required
              >
                <option value="MALE">Laki-laki</option>
                <option value="FEMALE">Perempuan</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="religion"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Agama *
              </label>
              <select
                id="religion"
                name="religion"
                defaultValue={selectedStudent?.religion || "ISLAM"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
                required
              >
                <option value="ISLAM">Islam</option>
                <option value="KATOLIK">Katolik</option>
                <option value="PROTESTAN">Protestan</option>
                <option value="HINDU">Hindu</option>
                <option value="BUDHA">Budha</option>
                <option value="KONGHUCU">Konghucu</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="birthPlace"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tempat Lahir
              </label>
              <input
                type="text"
                id="birthPlace"
                name="birthPlace"
                defaultValue={selectedStudent?.birthPlace || ""}
                placeholder="Tempat lahir"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
              />
            </div>

            <div>
              <label
                htmlFor="birthDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tanggal Lahir
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                defaultValue={
                  selectedStudent?.birthDate
                    ? formatDateForInput(selectedStudent.birthDate)
                    : ""
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
              />
            </div>

            <div>
              <label
                htmlFor="classId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Kelas *
              </label>
              <select
                id="classId"
                name="classId"
                defaultValue={selectedStudent?.classId || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
                required
              >
                <option value="">Pilih Kelas</option>
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="academicYear"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tahun Akademik *
              </label>
              <input
                type="text"
                id="academicYear"
                name="academicYear"
                defaultValue={selectedStudent?.academicYear || ""}
                placeholder="2024/2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
                required
              />
            </div>

            <div>
              <label
                htmlFor="admittedAt"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tanggal Masuk
              </label>
              <input
                type="date"
                id="admittedAt"
                name="admittedAt"
                defaultValue={
                  selectedStudent?.admittedAt
                    ? formatDateForInput(selectedStudent.admittedAt)
                    : ""
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Status
              </label>
              <input
                type="text"
                id="status"
                name="status"
                defaultValue={selectedStudent?.status || ""}
                placeholder="Cth: Anak Kandung"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Alamat
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                defaultValue={selectedStudent?.address || ""}
                placeholder="Alamat lengkap siswa"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-6">
            <Heart className="w-5 h-5 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Data Keluarga
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="fatherName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nama Ayah
              </label>
              <input
                type="text"
                id="fatherName"
                name="fatherName"
                defaultValue={selectedStudent?.fatherName || ""}
                placeholder="Nama lengkap ayah"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
              />
            </div>

            <div>
              <label
                htmlFor="motherName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nama Ibu
              </label>
              <input
                type="text"
                id="motherName"
                name="motherName"
                defaultValue={selectedStudent?.motherName || ""}
                placeholder="Nama lengkap ibu"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
              />
            </div>

            <div>
              <label
                htmlFor="fatherOccupation"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Pekerjaan Ayah
              </label>
              <input
                type="text"
                id="fatherOccupation"
                name="fatherOccupation"
                defaultValue={selectedStudent?.fatherOccupation || ""}
                placeholder="Pekerjaan ayah"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
              />
            </div>

            <div>
              <label
                htmlFor="motherOccupation"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Pekerjaan Ibu
              </label>
              <input
                type="text"
                id="motherOccupation"
                name="motherOccupation"
                defaultValue={selectedStudent?.motherOccupation || ""}
                placeholder="Pekerjaan ibu"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
              />
            </div>

            <div>
              <label
                htmlFor="childOrder"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Anak ke-
              </label>
              <input
                type="number"
                id="childOrder"
                name="childOrder"
                min="1"
                defaultValue={selectedStudent?.childOrder || ""}
                placeholder="Urutan anak dalam keluarga"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
              />
            </div>
          </div>
        </div>

        {/* Data Perkembangan Fisik Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <Ruler className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Data Perkembangan Fisik
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Data ini akan digunakan untuk memantau perkembangan fisik anak
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="height"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tinggi Badan (cm)
              </label>
              <input
                type="number"
                step="0.1"
                id="height"
                name="height"
                defaultValue={
                  selectedStudent?.physicalDevelopments?.height || ""
                }
                placeholder="Contoh: 110.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
              />
            </div>

            <div>
              <label
                htmlFor="weight"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Berat Badan (kg)
              </label>
              <input
                type="number"
                step="0.1"
                id="weight"
                name="weight"
                defaultValue={
                  selectedStudent?.physicalDevelopments?.weight || ""
                }
                placeholder="Contoh: 18.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
              />
            </div>

            <div>
              <label
                htmlFor="headCircumference"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Lingkar Kepala (cm)
              </label>
              <input
                type="number"
                step="0.1"
                id="headCircumference"
                name="headCircumference"
                defaultValue={
                  selectedStudent?.physicalDevelopments?.headCircumference || ""
                }
                placeholder="Contoh: 50.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
              />
            </div>

            <div>
              <label
                htmlFor="measurementDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tanggal Pengukuran
              </label>
              <input
                type="date"
                id="measurementDate"
                name="measurementDate"
                defaultValue={
                  selectedStudent?.physicalDevelopments?.measurementDate
                    ? formatDateForInput(
                        selectedStudent.physicalDevelopments.measurementDate
                      )
                    : ""
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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
                {modal === "add" ? "Menambahkan..." : "Menyimpan perubahan..."}
              </div>
            ) : modal === "add" ? (
              "Tambah Siswa"
            ) : (
              "Simpan Perubahan"
            )}
          </button>
        </div>
      </Form>
    </div>
  );
};
