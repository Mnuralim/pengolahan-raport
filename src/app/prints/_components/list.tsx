"use client";
import { Printer, X } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Tabel, type TabelColumn } from "../../_components/tabel";
import { Pagination } from "../../_components/pagination";
import { Alert } from "../../_components/alert";
import type { StudentWithAssessments } from "@/app/students/[id]/_components/student-detail";
import { PAUDReportPDF } from "./template";
import { FilterControlStudents } from "@/app/students/_components/filter-controll";
import type { Class } from "@prisma/client";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false }
);

interface Props {
  alertType?: "success" | "error";
  message?: string;
  reports: StudentWithAssessments[];
  pagination: PaginationProps;
  classes: Class[];
}

export const ReportList = ({
  alertType,
  reports,
  message,
  pagination,
  classes,
}: Props) => {
  const router = useRouter();
  const [previewStudent, setPreviewStudent] =
    useState<StudentWithAssessments | null>(null);

  const handleCloseAlert = () => {
    router.replace("/reports", { scroll: false });
  };

  const schoolInfo = {
    name: "PAUD MUTIARA HATI",
    address: "Jl. Poros Lombe - Tolandona, Kode Pos 93762",
    city: "Desa Wake-kea, Kecamatan Gu, Kabupaten Buton Tengah",
    province: "Sulawesi Tenggara",
    phone: "(0401) 123456",
    email: "tkwakeakea@gmail.com",
  };

  const currentSemester = 1;
  const currentAcademicYear = "2024/2025";

  const generatePDFFileName = (student: StudentWithAssessments): string => {
    return `Raport_${student.name.replace(/\s+/g, "_")}_${
      student.nis
    }_Semester_${currentSemester}.pdf`;
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
            onClick={() => setPreviewStudent(item)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-150 border border-blue-200"
            title="Preview Raport PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Laporan Raport</h1>
          <span className="text-sm text-gray-500">
            Semester {currentSemester} - {currentAcademicYear}
          </span>
        </div>
      </div>
      <FilterControlStudents
        path="prints"
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

      {previewStudent && (
        <div className="fixed inset-0 z-[90999999000] flex items-center justify-center backdrop-blur-sm shadow-2xl bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Preview Raport
                </h2>
                <p className="text-sm text-gray-600">
                  {previewStudent.name} - {previewStudent.nis}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <PDFDownloadLink
                  document={
                    <PAUDReportPDF
                      student={previewStudent}
                      semester={currentSemester}
                      academicYear={currentAcademicYear}
                      schoolInfo={schoolInfo}
                    />
                  }
                  fileName={generatePDFFileName(previewStudent)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors duration-150"
                >
                  {({ loading }) => (
                    <>
                      <Printer className="w-4 h-4" />
                      {loading ? "Generating..." : "Download PDF"}
                    </>
                  )}
                </PDFDownloadLink>

                <button
                  onClick={() => setPreviewStudent(null)}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-150"
                  title="Tutup Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <PDFViewer
                style={{ width: "100%", height: "100%" }}
                showToolbar={true}
              >
                <PAUDReportPDF
                  student={previewStudent}
                  semester={currentSemester}
                  academicYear={currentAcademicYear}
                  schoolInfo={schoolInfo}
                />
              </PDFViewer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
