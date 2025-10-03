import { User, Loader2, Eye, EyeOff } from "lucide-react";
import Form from "next/form";
import React, { useActionState, useState } from "react";
import { ErrorMessage } from "../../_components/error-message";
import type { Teacher } from "@prisma/client";
import { createTeacher, updateTeacher } from "@/actions/teacher";

interface Props {
  modal: "add" | "edit";
  selectedTeacher?: Teacher | null;
  onClose: () => void;
}

export const TeacherForm = ({ modal, selectedTeacher, onClose }: Props) => {
  const [state, action, pending] = useActionState(
    selectedTeacher ? updateTeacher : createTeacher,
    {
      error: null,
    }
  );

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {modal === "add" ? "Tambah Guru" : "Edit Guru"}
        </h2>
        <p className="text-sm text-gray-600">
          {modal === "add"
            ? "Lengkapi informasi untuk menambahkan guru baru"
            : "Perbarui informasi guru sesuai kebutuhan"}
        </p>
      </div>

      <Form action={action} className="space-y-6">
        <input
          type="hidden"
          name="id"
          defaultValue={selectedTeacher?.id || ""}
        />
        <ErrorMessage message={state.error} />

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Data Personal</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
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
                defaultValue={selectedTeacher?.name || ""}
                placeholder="Masukkan nama lengkap guru"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
                required
              />
            </div>

            <div>
              <label
                htmlFor="nip"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                NIP
              </label>
              <input
                type="text"
                id="nip"
                name="nip"
                defaultValue={selectedTeacher?.nip || ""}
                placeholder="Nomor Induk Pegawai (opsional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
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
                defaultValue={selectedTeacher?.gender || "FEMALE"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
                required
              >
                <option value="FEMALE">Perempuan</option>
                <option value="MALE">Laki-laki</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="mobile"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nomor HP *
              </label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                defaultValue={selectedTeacher?.mobile || ""}
                placeholder="08xxxxxxxxxx"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
                required
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Status Guru *
              </label>
              <select
                id="status"
                name="status"
                defaultValue={selectedTeacher?.status || "TETAP"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
                required
              >
                <option value="TETAP">Tetap</option>
                <option value="HONORER">Honorer</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Alamat *
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                defaultValue={selectedTeacher?.address || ""}
                placeholder="Masukkan alamat lengkap"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150 resize-none"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Akun Login</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username *
              </label>
              <input
                type="text"
                id="username"
                name="username"
                defaultValue={selectedTeacher?.username || ""}
                placeholder="Username untuk login"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password{" "}
                {modal === "edit" ? "(kosongkan jika tidak diubah)" : "*"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder={
                    modal === "edit"
                      ? "Biarkan kosong jika tidak diubah"
                      : "Masukkan password"
                  }
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
                  required={modal === "add"}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {modal === "add" && (
                <p className="text-xs text-gray-500 mt-1">
                  Password minimal 6 karakter
                </p>
              )}
            </div>
          </div>
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
            disabled={pending}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            {pending ? (
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                {modal === "add" ? "Menambahkan..." : "Menyimpan..."}
              </div>
            ) : modal === "add" ? (
              "Tambah Guru"
            ) : (
              "Simpan Perubahan"
            )}
          </button>
        </div>
      </Form>
    </div>
  );
};
