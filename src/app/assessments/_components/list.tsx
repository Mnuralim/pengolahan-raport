"use client";
import { PencilIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabel, type TabelColumn } from "../../_components/tabel";
import { Pagination } from "../../_components/pagination";
import { Alert } from "../../_components/alert";
import type {
  DevelopmentIndicatorWithAspect,
  StudentWithAssessments,
} from "@/app/students/[id]/_components/student-detail";
import { FilterControlStudents } from "@/app/students/_components/filter-controll";
import type { Class } from "@prisma/client";
import { DevelopmentAssessmentBulkForm } from "./bulk-form";
import { Modal } from "@/app/_components/modal";
import { useState } from "react";

interface Props {
  alertType?: "success" | "error";
  message?: string;
  reports: StudentWithAssessments[];
  pagination: PaginationProps;
  classes: Class[];
  indicators: DevelopmentIndicatorWithAspect[];
}

export const AssessmentList = ({
  alertType,
  reports,
  message,
  pagination,
  classes,
  indicators,
}: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
  const router = useRouter();

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleEditAssessment = (id: string) => {
    setIsModalOpen(true);
    setSelectedStudentId(id);
  };

  const handleCloseAlert = () => {
    router.replace("/reports", { scroll: false });
  };

  const tabel: TabelColumn<StudentWithAssessments>[] = [
    {
      header: "No",
      accessor: "id",
      render: (_, index) => (index as number) + 1,
    },
    {
      header: "Nama Siswa",
      accessor: (item) => item.name || "-",
    },
    {
      header: "NIS",
      accessor: (item) => item.nis || "-",
    },
    {
      header: "Kelas",
      accessor: (item) => item.class.name || "-",
    },
    {
      header: "Aksi",
      accessor: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditAssessment(item.id)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-150 border border-blue-200"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Input Penilaian Siswa
          </h1>
        </div>
      </div>
      <FilterControlStudents
        path="assessments"
        classes={classes}
        currentClassId={pagination.preserveParams!.classId as string}
        currentSearch={pagination.preserveParams!.search as string}
        currentSortOrder={pagination.preserveParams!.sortOrder as string}
      />
      <Tabel columns={tabel} data={reports} />
      <div className="mt-8">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          preserveParams={pagination.preserveParams}
        />
      </div>

      <Alert
        isVisible={message !== undefined}
        message={message || ""}
        onClose={handleCloseAlert}
        type={alertType || "success"}
        autoClose
      />

      <Modal onClose={handleClose} isOpen={isModalOpen}>
        {isModalOpen && (
          <DevelopmentAssessmentBulkForm
            onClose={handleClose}
            student={
              reports.find((student) => student.id === selectedStudentId)!
            }
            indicators={indicators}
          />
        )}
      </Modal>
    </div>
  );
};
