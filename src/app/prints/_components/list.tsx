"use client";
import { Eye, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
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

  const handleCloseAlert = () => {
    router.replace("/admin/reports", { scroll: false });
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
            onClick={() => router.push(`/students/${item.id}`)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors duration-150 border border-green-200"
            title="Lihat Detail"
          >
            <Eye className="w-4 h-4" />
          </button>

          <PDFDownloadLink
            document={
              <PAUDReportPDF
                student={item}
                semester={currentSemester}
                academicYear={currentAcademicYear}
                schoolInfo={schoolInfo}
              />
            }
            fileName={generatePDFFileName(item)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-150 border border-red-200"
          >
            {({ loading }) => (
              <span
                title={loading ? "Generating PDF..." : "Download Raport PDF"}
              >
                <Printer className={`w-4 h-4 ${loading ? "opacity-50" : ""}`} />
              </span>
            )}
          </PDFDownloadLink>
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
    </div>
  );
};
