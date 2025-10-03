import { getAllStudents } from "@/actions/student";
import { StudentList } from "./_components/list";
import { getAllClasses } from "@/actions/class";

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
    classId?: string;
  }>;
}

export default async function StudentPage({ searchParams }: Props) {
  const {
    success,
    message,
    error,
    limit,
    skip,
    sortBy,
    sortOrder,
    search,
    classId,
  } = await searchParams;
  const [studentResult, classResult] = await Promise.all([
    getAllStudents(
      skip || "0",
      limit || "10",
      sortBy || "createdAt",
      sortOrder || "desc",
      search,
      classId
    ),
    getAllClasses("0", "100", "createdAt", "desc"),
  ]);

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-lg">
      <div className="px-6 py-6 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Student Management
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Kelola data siswa disini
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <StudentList
          classes={classResult.classes}
          students={studentResult.students}
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
        />
      </div>
    </div>
  );
}
