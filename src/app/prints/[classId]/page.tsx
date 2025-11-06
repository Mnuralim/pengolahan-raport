import { getAllStudents } from "@/actions/student";
import { ReportList } from "./_components/list";
import type { Semester } from "@prisma/client";
import { getAcademicYear } from "@/actions/academic-year";

interface Props {
  searchParams: Promise<{
    success?: string;
    error?: string;
    message?: string;
    limit?: string;
    skip?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    semester?: string;
    year?: string;
  }>;
  params: Promise<{
    classId?: string;
  }>;
}

export default async function PrintsPage({ searchParams, params }: Props) {
  const {
    success,
    message,
    error,
    limit,
    skip,
    sortBy,
    sortOrder,
    search,
    semester,
    year,
  } = await searchParams;

  const { classId } = await params;

  const [studentResult, academicYear] = await Promise.all([
    getAllStudents(
      skip || "0",
      limit || "10",
      sortBy || "name",
      sortOrder || "desc",
      search,
      classId,
      semester || "SEMESTER_1"
    ),
    getAcademicYear(year || ""),
  ]);

  if (!academicYear) {
    return (
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-6">
        <p className="text-sm text-slate-600 mt-1">
          Tahun akademik tidak ditemukan
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-lg">
      <div className="px-6 py-6 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Prints Report Management
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Kelola cetak rapot disini
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <ReportList
          year={{
            id: academicYear?.id,
            year: academicYear?.year,
          }}
          semester={semester as Semester}
          reports={studentResult.students}
          pagination={{
            currentPage: studentResult.currentPage,
            itemsPerPage: studentResult.itemsPerPage,
            totalItems: studentResult.totalCount,
            totalPages: studentResult.totalPages,
            preserveParams: {
              limit,
              skip,
              sortBy,
              sortOrder,
              search,
              classId,
              semester,
              year,
            },
          }}
          alertType={success ? "success" : error ? "error" : undefined}
          message={message}
        />
      </div>
    </div>
  );
}
