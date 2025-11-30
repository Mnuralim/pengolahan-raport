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

export default async function PrintsPage({ searchParams }: Props) {
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
                Reports Management
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Kelola cetak rapot disini
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center text-slate-700">
            Anda belum ditugaskan ke kelas manapun. Silakan hubungi admin untuk
            penugasan kelas.
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
              Report Management
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Kelola cetak rapot disini
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
