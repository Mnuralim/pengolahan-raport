import { ClassList } from "./_components/list";
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
  }>;
}

export default async function ClassPage({ searchParams }: Props) {
  const { success, message, error, limit, skip, sortBy, sortOrder } =
    await searchParams;
  const [classResult] = await Promise.all([
    getAllClasses(
      skip || "0",
      limit || "10",
      sortBy || "name",
      sortOrder || "desc"
    ),
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
