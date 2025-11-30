import { getAllAcademicYears } from "@/actions/academic-year";
import { ClassList } from "./_components/list";
import { getAllClasses } from "@/actions/class";
import { getSession } from "@/actions/session";
import { getTeacher } from "@/actions/teacher";

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

export default async function AssessmentPage({ searchParams }: Props) {
  const { success, message, error, limit, skip, sortBy, sortOrder } =
    await searchParams;

  const session = await getSession();

  const teacher = await getTeacher(session!.id);

  const teacherClassIds = teacher?.classes.map((ct) => ct.class.id) || [];

  if (teacherClassIds.length === 0 && session?.role === "GURU") {
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
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Belum Ada Kelas Ditugaskan
            </h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Anda belum ditugaskan ke kelas manapun. Silakan hubungi admin
              untuk penugasan kelas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const [classResult, academicYearResult] = await Promise.all([
    getAllClasses(
      skip || "0",
      limit || "10",
      sortBy || "name",
      sortOrder || "desc",
      undefined,
      session!.role === "GURU" ? teacherClassIds.join(",") : undefined
    ),
    getAllAcademicYears("0", "100", "createdAt", "desc"),
  ]);

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
        <ClassList
          teacherRole={session!.role}
          academicYears={academicYearResult.academicYears}
          classes={classResult.classes}
          pagination={{
            currentPage: classResult.currentPage,
            itemsPerPage: classResult.itemsPerPage,
            totalItems: classResult.totalCount,
            totalPages: classResult.totalPages,
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
