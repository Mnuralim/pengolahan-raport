import { getAllAcademicYears } from "@/actions/academic-year";
import { AcademicYearList } from "./_components/list";

interface Props {
  searchParams: Promise<{
    success?: string;
    error?: string;
    message?: string;
    limit?: string;
    skip?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function AcademicYearPage({ searchParams }: Props) {
  const { success, message, error, limit, skip, sortBy, sortOrder } =
    await searchParams;

  const academicYearResult = await getAllAcademicYears(
    skip || "0",
    limit || "100",
    sortBy || "year",
    sortOrder || "desc"
  );

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-lg">
      <div className="px-6 py-6 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Academic Year Management
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Kelola data tahun ajaran disini
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <AcademicYearList
          academicYears={academicYearResult.academicYears}
          pagination={{
            currentPage: academicYearResult.currentPage,
            itemsPerPage: academicYearResult.itemsPerPage,
            totalItems: academicYearResult.totalCount,
            totalPages: academicYearResult.totalPages,
            preserveParams: {
              limit,
              skip,
            },
          }}
          alertType={success ? "success" : error ? "error" : undefined}
          message={message}
        />
      </div>
    </div>
  );
}
