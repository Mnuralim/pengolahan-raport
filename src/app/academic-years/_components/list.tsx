"use client";

import { Edit, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabel, type TabelColumn } from "../../_components/tabel";
import { deleteAcademicYear } from "@/actions/academic-year";
import { Pagination } from "../../_components/pagination";
import { Modal } from "../../_components/modal";
import { Alert } from "../../_components/alert";
import type { AcademicYear } from "@prisma/client";
import { AcademicYearForm } from "./form";

interface Props {
  alertType?: "success" | "error";
  message?: string;
  academicYears: AcademicYear[];
  pagination: PaginationProps;
}

export const AcademicYearList = ({
  alertType,
  academicYears,
  message,
  pagination,
}: Props) => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [selectedAcademicYear, setSelectedAcademicYear] =
    useState<AcademicYear | null>(null);
  const router = useRouter();

  const handleOpenModal = (academicYear?: AcademicYear) => {
    setIsOpenModal(true);
    if (academicYear) {
      setSelectedAcademicYear(academicYear);
    }
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
    setSelectedAcademicYear(null);
  };

  const handleCloseAlert = () => {
    router.replace("/academic-years", { scroll: false });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  const tabel: TabelColumn<AcademicYear>[] = [
    {
      header: "No",
      accessor: "id",
      render: (_, index) => (index as number) + 1,
    },
    {
      header: "Tahun Ajaran",
      accessor: (item) => item.year || "-",
      render: (item) => (
        <span className="font-medium text-gray-900">{item.year}</span>
      ),
    },
    {
      header: "Tanggal Dibuat",
      accessor: (item) => formatDate(item.createdAt),
      render: (item) => (
        <span className="text-sm text-gray-600">
          {formatDate(item.createdAt)}
        </span>
      ),
    },
    {
      header: "Terakhir Diubah",
      accessor: (item) => formatDate(item.updatedAt),
      render: (item) => (
        <span className="text-sm text-gray-600">
          {formatDate(item.updatedAt)}
        </span>
      ),
    },
    {
      header: "Aksi",
      accessor: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal(item)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200"
            title="Edit Data"
          >
            <Edit className="w-4 h-4" />
          </button>
          <form action={() => deleteAcademicYear(item.id)}>
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                if (
                  confirm(
                    `Apakah Anda yakin ingin menghapus tahun ajaran "${item.year}"?`
                  )
                ) {
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              className="w-8 h-8 inline-flex items-center justify-center rounded-md bg-red-500 hover:bg-red-600 text-white text-sm transition-colors duration-150"
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
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors duration-150 shadow-sm border border-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Tahun Ajaran
        </button>
      </div>

      <Tabel columns={tabel} data={academicYears} />

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
        <AcademicYearForm
          modal={selectedAcademicYear ? "edit" : "add"}
          onClose={handleCloseModal}
          selectedAcademicYear={selectedAcademicYear}
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
