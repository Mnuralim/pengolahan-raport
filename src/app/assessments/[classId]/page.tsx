import { getAllStudents } from "@/actions/student";
import { AssessmentList } from "./_components/list";
import { getAllDevelopmentIndicators } from "@/actions/development-aspect";
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
    year?: string;
    semester?: string | Semester;
  }>;
  params: Promise<{
    classId: string;
  }>;
}

export default async function AssessmentPage({ searchParams, params }: Props) {
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
  const [studentResult, indicatorsResult, academicYear] = await Promise.all([
    getAllStudents(
      skip || "0",
      limit || "10",
      sortBy || "name",
      sortOrder || "desc",
      search,
      classId
    ),
    getAllDevelopmentIndicators(),
    getAcademicYear(year || ""),
  ]);

  if (year && !academicYear) {
    return (
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Academic Year Not Found
        </h2>
        <p className="text-sm text-slate-600">
          Tahun akademik dengan tahun &quot;{year}&quot; tidak ditemukan.
          Silakan periksa kembali.
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
              Assessment Management
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Kelola input nilai siswa disini
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <AssessmentList
          semester={semester as Semester | undefined}
          year={{
            id: academicYear?.id || "",
            year: academicYear?.year || "",
          }}
          indicators={indicatorsResult}
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
            },
          }}
          alertType={success ? "success" : error ? "error" : undefined}
          message={message}
          classId={classId}
        />
      </div>
    </div>
  );
}
