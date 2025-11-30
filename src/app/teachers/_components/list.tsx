"use client";

import { Edit, Plus, Trash2, User } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabel, type TabelColumn } from "../../_components/tabel";
import { deleteTeacher } from "@/actions/teacher";
import { Pagination } from "../../_components/pagination";
import { Modal } from "../../_components/modal";
import { Alert } from "../../_components/alert";
import type { Role, Teacher } from "@prisma/client";
import { TeacherForm } from "./form";
import Image from "next/image";

interface Props {
  alertType?: "success" | "error";
  message?: string;
  teachers: Teacher[];
  pagination: PaginationProps;
  role: Role;
}

export const TeacherList = ({
  alertType,
  teachers,
  message,
  pagination,
  role,
}: Props) => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const router = useRouter();

  const handleOpenModal = (teacher?: Teacher) => {
    setIsOpenModal(true);
    if (teacher) {
      setSelectedTeacher(teacher);
    }
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
    setSelectedTeacher(null);
  };

  const handleCloseAlert = () => {
    router.replace("/teachers", { scroll: false });
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      TETAP: "Tetap",
      KONTRAK: "Kontrak",
      HONORER: "Honorer",
    };
    return statusMap[status] || status;
  };

  const formatGender = (gender: string) => {
    const genderMap: Record<string, string> = {
      MALE: "Laki-laki",
      FEMALE: "Perempuan",
    };
    return genderMap[gender] || gender;
  };

  const tabel: TabelColumn<Teacher>[] = [
    {
      header: "No",
      accessor: "id",
      render: (_, index) => (index as number) + 1,
    },
    {
      header: "Gambar",
      accessor: (item) => item.imageUrl || "-",
      render: (item) =>
        item.imageUrl ? (
          <Image
            width={64}
            height={64}
            src={item.imageUrl}
            alt={item.name}
            className="w-16 h-16 object-cover rounded-full"
          />
        ) : (
          <User className="w-16 h-16" />
        ),
    },
    {
      header: "NIP",
      accessor: (item) => item.nip || "-",
    },
    {
      header: "Nama",
      accessor: (item) => item.name || "-",
    },
    {
      header: "Jenis Kelamin",
      accessor: (item) => formatGender(item.gender),
    },
    {
      header: "No. HP",
      accessor: (item) => item.mobile || "-",
    },
    {
      header: "Alamat",
      accessor: (item) => item.address || "-",
      render: (item) => (
        <div className="max-w-xs truncate" title={item.address}>
          {item.address || "-"}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (item) => formatStatus(item.status),
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.status === "TETAP"
              ? "bg-green-100 text-green-800"
              : item.status === "HONORER"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {formatStatus(item.status)}
        </span>
      ),
    },
    {
      header: "Username",
      accessor: (item) => item.username || "-",
    },
    {
      header: "Aksi",
      accessor: (item) => (
        <div className="flex items-center gap-2">
          <button
            disabled={role !== "ADMIN"}
            onClick={() => handleOpenModal(item)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200"
            title={role === "ADMIN" ? "Edit Data" : "Tidak memiliki akses"}
          >
            <Edit className="w-4 h-4" />
          </button>
          <form action={() => deleteTeacher(item.id)}>
            <button
              type="submit"
              disabled={role !== "ADMIN"}
              onClick={(e) => {
                e.preventDefault();
                if (
                  confirm(
                    `Apakah Anda yakin ingin menghapus guru "${item.name}"?`
                  )
                ) {
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              className="w-8 h-8 inline-flex items-center justify-center rounded-md bg-red-500 text-white hover:bg-red-600 text-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Hapus Data"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </form>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        {role === "ADMIN" && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Guru
          </button>
        )}
      </div>

      <Tabel columns={tabel} data={teachers} />

      <div className="mt-8">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          preserveParams={pagination.preserveParams}
        />
      </div>

      <Modal isOpen={isOpenModal} onClose={handleCloseModal}>
        <TeacherForm
          modal={selectedTeacher ? "edit" : "add"}
          onClose={handleCloseModal}
          selectedTeacher={selectedTeacher}
        />
      </Modal>

      <Alert
        isVisible={message !== undefined}
        message={message || ""}
        onClose={handleCloseAlert}
        type={alertType || "success"}
        autoClose
      />
    </div>
  );
};
