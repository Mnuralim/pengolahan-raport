import { DevelopmentAspectList } from "./_components/list";
import { getAllDevelopmentAspects } from "@/actions/development-aspect";

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

export default async function DevelopmentAspectPage({ searchParams }: Props) {
  const { success, message, error, limit, skip, sortBy, sortOrder } =
    await searchParams;
  const [aspectResult] = await Promise.all([
    getAllDevelopmentAspects(
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
              Development Aspect Management
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Kelola data aspek perkembangan disini
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <DevelopmentAspectList
          aspects={aspectResult.aspects}
          pagination={{
            currentPage: aspectResult.currentPage,
            itemsPerPage: aspectResult.itemsPerPage,
            totalItems: aspectResult.totalCount,
            totalPages: aspectResult.totalPages,
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
