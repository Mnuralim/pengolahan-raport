"use client";

import { Edit, Eye, Plus, Trash2, User, Users } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { StudentForm } from "./form";
import { Tabel, type TabelColumn } from "../../_components/tabel";
import { deleteStudent } from "@/actions/student";
import { Pagination } from "../../_components/pagination";
import { Modal } from "../../_components/modal";
import { Alert } from "../../_components/alert";
import type { AcademicYear, Class, Prisma } from "@prisma/client";
import { FilterControlStudents } from "./filter-controll";
import Image from "next/image";

export type StudentWithClass = Prisma.StudentGetPayload<{
  include: { physicalDevelopments: true; class: true; academicYear: true };
}>;

interface Props {
  alertType?: "success" | "error";
  message?: string;
  students: StudentWithClass[];
  pagination: PaginationProps;
  classes: Class[];
  academicYears: AcademicYear[];
}

export const StudentList = ({
  alertType,
  students,
  message,
  pagination,
  classes,
  academicYears,
}: Props) => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentWithClass | null>(null);
  const router = useRouter();

  const handleOpenModal = (student?: StudentWithClass) => {
    setIsOpenModal(true);
    if (student) {
      setSelectedStudent(student);
    }
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
    setSelectedStudent(null);
  };

  const handleCloseAlert = () => {
    router.replace("/students", { scroll: false });
  };

  const formatGender = (gender: string) => {
    const genderMap: Record<string, string> = {
      MALE: "Laki-laki",
      FEMALE: "Perempuan",
    };
    return genderMap[gender] || gender;
  };

  const formatReligion = (religion: string) => {
    const religionMap: Record<string, string> = {
      ISLAM: "Islam",
      KATOLIK: "Katolik",
      PROTESTAN: "Protestan",
      HINDU: "Hindu",
      BUDHA: "Budha",
      KONGHUCU: "Konghucu",
      LAINNYA: "Lainnya",
    };
    return religionMap[religion] || religion;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const calculateAge = (birthDate: Date | string | null) => {
    if (!birthDate) return "-";
    const birth =
      typeof birthDate === "string" ? new Date(birthDate) : birthDate;
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      return `${age - 1} tahun`;
    }
    return `${age} tahun`;
  };

  const tabel: TabelColumn<StudentWithClass>[] = [
    {
      header: "No",
      accessor: "id",
      render: (_, index) => (index as number) + 1,
    },
    {
      header: "Foto",
      accessor: (item) => item.imageUrl || "-",
      render: (item) =>
        item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={50}
            height={50}
            className="rounded-full"
          />
        ) : (
          <User className="w-16 h-16" />
        ),
    },
    {
      header: "NIS",
      accessor: (item) => item.nis || "-",
    },
    {
      header: "Nama Siswa",
      accessor: (item) => item.name || "-",
      render: (item) => (
        <div className="font-medium text-gray-900">{item.name}</div>
      ),
    },
    {
      header: "Jenis Kelamin",
      accessor: (item) => formatGender(item.gender),
    },
    {
      header: "Tanggal Lahir",
      accessor: (item) => formatDate(item.birthDate),
      render: (item) => (
        <div>
          <div className="text-sm">{formatDate(item.birthDate)}</div>
          <div className="text-xs text-gray-500">
            {calculateAge(item.birthDate)}
          </div>
        </div>
      ),
    },
    {
      header: "Agama",
      accessor: (item) => formatReligion(item.religion),
    },
    {
      header: "Kelas",
      accessor: (item) => item.class?.name || "-",
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {item.class?.name || "-"}
        </span>
      ),
    },
    {
      header: "Tahun Akademik",
      accessor: (item) => item.academicYear?.year || "-",
    },
    {
      header: "Orang Tua",
      accessor: (item) => item.fatherName || item.motherName || "-",
      render: (item) => (
        <div className="text-sm">
          {item.fatherName && (
            <div className="text-gray-900">Ayah: {item.fatherName}</div>
          )}
          {item.motherName && (
            <div className="text-gray-600">Ibu: {item.motherName}</div>
          )}
          {!item.fatherName && !item.motherName && "-"}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (item) => item.status || "Aktif",
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {item.status || "Aktif"}
        </span>
      ),
    },
    {
      header: "Aksi",
      accessor: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/students/${item.id}`)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors duration-150 border border-green-200"
            title="Lihat Detail"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenModal(item)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200"
            title="Edit Data"
          >
            <Edit className="w-4 h-4" />
          </button>
          <form action={() => deleteStudent(item.id)}>
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                if (
                  confirm(
                    `Apakah Anda yakin ingin menghapus siswa "${item.name}" (${item.nis})?`
                  )
                ) {
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              className="w-8 h-8 inline-flex items-center justify-center rounded-md bg-red-500 text-white hover:bg-red-600 text-sm transition-colors duration-150"
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
        <div className="flex items-center gap-2 text-gray-700">
          <Users className="w-5 h-5" />
          <span className="text-sm font-medium">
            Total Siswa: {pagination.totalItems}
          </span>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors duration-150 shadow-sm border border-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Siswa
        </button>
      </div>
      <FilterControlStudents
        classes={classes}
        path="students"
        currentClassId={pagination.preserveParams!.classId as string}
        currentSearch={pagination.preserveParams!.search as string}
        currentSortOrder={pagination.preserveParams!.sortOrder as string}
      />
      <Tabel columns={tabel} data={students} />

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
        <StudentForm
          academicYears={academicYears}
          modal={selectedStudent ? "edit" : "add"}
          onClose={handleCloseModal}
          selectedStudent={selectedStudent}
          classes={classes}
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
