import React from "react";
import { Search, SortAsc, SortDesc } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { useRouter, useSearchParams } from "next/navigation";
import type { Class } from "@prisma/client";

interface Props {
  currentSortOrder?: string;
  currentSearch?: string;
  currentClassId?: string;
  classes?: Class[];
  path: string;
}

export const FilterControlStudents = ({
  currentSortOrder,
  currentSearch,
  currentClassId,
  classes = [],
  path,
}: Props) => {
  const { replace } = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = useDebouncedCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newParams = new URLSearchParams(searchParams);

      if (e.target.value.trim() === "") {
        newParams.delete("search");
      } else {
        newParams.set("search", e.target.value);
      }

      // Reset pagination when searching
      newParams.delete("skip");

      replace(`/${path}?${newParams.toString()}`, {
        scroll: false,
      });
    },
    500
  );

  const handleFilterClass = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newParams = new URLSearchParams(searchParams);

    if (e.target.value === "all") {
      newParams.delete("classId");
    } else {
      newParams.set("classId", e.target.value);
    }

    // Reset pagination when filtering
    newParams.delete("skip");

    replace(`/${path}?${newParams.toString()}`, {
      scroll: false,
    });
  };

  const handleSortOrder = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sortOrder", currentSortOrder === "asc" ? "desc" : "asc");

    replace(`/${path}?${newParams.toString()}`, {
      scroll: false,
    });
  };

  const handleSortBy = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newParams = new URLSearchParams(searchParams);

    if (e.target.value === "default") {
      newParams.delete("sortBy");
    } else {
      newParams.set("sortBy", e.target.value);
    }

    replace(`/${path}?${newParams.toString()}`, {
      scroll: false,
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              onChange={handleSearch}
              defaultValue={currentSearch}
              placeholder="Cari siswa berdasarkan nama atau NIS..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
          <select
            onChange={handleFilterClass}
            value={currentClassId || "all"}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Kelas</option>
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </select>

          <select
            onChange={handleSortBy}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="default">Urutkan berdasarkan</option>
            <option value="name">Nama</option>
            <option value="nis">NIS</option>
            <option value="createdAt">Tanggal Dibuat</option>
          </select>

          <button
            onClick={handleSortOrder}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 flex items-center justify-center gap-2"
            title={`Urutkan ${
              currentSortOrder === "asc"
                ? "ascending ke descending"
                : "descending ke ascending"
            }`}
          >
            {currentSortOrder === "asc" ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {currentSortOrder === "asc" ? "A-Z" : "Z-A"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
