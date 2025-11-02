"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  path: string;
  currentClassId?: string;
  currentSearch?: string;
  currentSortOrder?: string;
}

export const FilterControlStudents = ({
  path,
  currentClassId,
  currentSearch,
  currentSortOrder,
}: Props) => {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch || "");

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (currentClassId) params.set("classId", currentClassId);
    if (currentSortOrder) params.set("sortOrder", currentSortOrder);

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`/${path}?${params.toString()}`);
  };

  const handleSearch = () => {
    handleFilter("search", search);
  };

  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <div className="flex gap-2 flex-1 min-w-[200px]">
        <input
          type="text"
          placeholder="Cari nama atau NIS..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Cari
        </button>
      </div>

      <select
        value={currentSortOrder || "desc"}
        onChange={(e) => handleFilter("sortOrder", e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="asc">A-Z</option>
        <option value="desc">Z-A</option>
      </select>

      {(currentSearch || currentClassId) && (
        <button
          onClick={() => router.push(`/${path}`)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Reset
        </button>
      )}
    </div>
  );
};
