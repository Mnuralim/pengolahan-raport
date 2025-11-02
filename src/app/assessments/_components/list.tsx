"use client";

import { EyeIcon } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabel, type TabelColumn } from "../../_components/tabel";
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

  const handleCloseModal = () => {
    setIsOpenModal(false);
    setSelectedClass(null);
  };

  const handleCloseAlert = () => {
    router.replace("/classes", { scroll: false });
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
      header: "Aksi",
      accessor: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/assessments/${item.id}`)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-150 border border-blue-200"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5"></div>

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
