"use client";

import { Edit, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabel, type TabelColumn } from "../../_components/tabel";
import { deleteClass } from "@/actions/class";
import { Pagination } from "../../_components/pagination";
import { Modal } from "../../_components/modal";
import { Alert } from "../../_components/alert";
import type { Prisma, Teacher } from "@prisma/client";
import { ClassForm } from "./form";

export type ClassWithRelations = Prisma.ClassGetPayload<{
  include: {
    teacher: true;
    _count: {
      select: {
        students: true;
      };
    };
  };
}>;

interface Props {
  alertType?: "success" | "error";
  message?: string;
  classes: ClassWithRelations[];
  teachers: Teacher[];
  pagination: PaginationProps;
}

export const ClassList = ({
  alertType,
  classes,
  message,
  pagination,
  teachers,
}: Props) => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<ClassWithRelations | null>(
    null
  );
  const router = useRouter();

  const handleOpenModal = (classItem?: ClassWithRelations) => {
    setIsOpenModal(true);
    if (classItem) {
      setSelectedClass(classItem);
    }
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
    setSelectedClass(null);
  };

  const handleCloseAlert = () => {
    router.replace("/classes", { scroll: false });
  };

  const formatAgeGroup = (ageGroup: string) => {
    const ageGroupMap: Record<string, string> = {
      TODDLER: "Toddler (1-2 tahun)",
      PRESCHOOL: "Preschool (3-4 tahun)",
      KINDERGARTEN: "Kindergarten (5-6 tahun)",
    };
    return ageGroupMap[ageGroup] || ageGroup;
  };

  const tabel: TabelColumn<ClassWithRelations>[] = [
    {
      header: "No",
      accessor: "id",
      render: (_, index) => (index as number) + 1,
    },
    {
      header: "Nama Kelas",
      accessor: (item) => item.name || "-",
    },
    {
      header: "Kelompok Usia",
      accessor: (item) => formatAgeGroup(item.ageGroup),
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.ageGroup === "TODDLER"
              ? "bg-pink-100 text-pink-800"
              : item.ageGroup === "GROUP_A"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {formatAgeGroup(item.ageGroup)}
        </span>
      ),
    },
    {
      header: "Guru Kelas",
      accessor: (item) => item.teacher?.name || "-",
    },
    {
      header: "Jumlah Siswa",
      accessor: (item) => item._count.students.toString(),
      render: (item) => (
        <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
          {item._count.students}
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
          <form action={() => deleteClass(item.id)}>
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                if (item._count.students > 0) {
                  alert(
                    "Tidak dapat menghapus kelas yang masih memiliki siswa."
                  );
                  return;
                }
                if (
                  confirm(
                    `Apakah Anda yakin ingin menghapus kelas "${item.name}"?`
                  )
                ) {
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              className={`w-8 h-8 inline-flex items-center justify-center rounded-md text-white text-sm transition-colors duration-150 ${
                item._count.students > 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
              }`}
              title={
                item._count.students > 0
                  ? "Tidak dapat menghapus kelas yang memiliki siswa"
                  : "Hapus Data"
              }
              disabled={item._count.students > 0}
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
          Tambah Kelas
        </button>
      </div>

      <Tabel columns={tabel} data={classes} />

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
        <ClassForm
          teachers={teachers}
          modal={selectedClass ? "edit" : "add"}
          onClose={handleCloseModal}
          selectedClass={selectedClass}
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
