import { getAllTeachers } from "@/actions/teacher";
import { TeacherList } from "./_components/list";
import { getSession } from "@/actions/session";

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

export default async function TeacherPage({ searchParams }: Props) {
  const { success, message, error, limit, skip, sortBy, sortOrder } =
    await searchParams;
  const session = await getSession();
  const teacherResult = await getAllTeachers(
    skip || "0",
    limit || "10",
    sortBy || "createdAt",
    sortOrder || "desc"
  );

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-lg">
      <div className="px-6 py-6 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Teacher Management
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Kelola data guru disini
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <TeacherList
          role={session!.role}
          teachers={teacherResult.teachers}
          pagination={{
            currentPage: teacherResult.currentPage,
            itemsPerPage: teacherResult.itemsPerPage,
            totalItems: teacherResult.totalCount,
            totalPages: teacherResult.totalPages,
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
