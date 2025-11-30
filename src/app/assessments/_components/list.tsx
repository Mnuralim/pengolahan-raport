"use client";

import { EyeIcon } from "lucide-react";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Tabel, type TabelColumn } from "../../_components/tabel";
import { Pagination } from "../../_components/pagination";
import { Alert } from "../../_components/alert";
import type { AcademicYear, Prisma, Role } from "@prisma/client";

export type ClassWithRelations = Prisma.ClassGetPayload<{
  include: {
    teacher: true;
    _count: {
      select: {
        students: true;
      };
    };
  };
}>;

interface Props {
  alertType?: "success" | "error";
  message?: string;
  classes: ClassWithRelations[];
  pagination: PaginationProps;
  academicYears: AcademicYear[];
  teacherRole: Role;
}

const semesters = ["SEMESTER_1", "SEMESTER_2"];

type ExpandedClassData = {
  id: string;
  class: ClassWithRelations;
  academicYear: string;
  academicYearId: string;
  semester: string;
};

export const ClassList = ({
  alertType,
  classes,
  message,
  pagination,
  academicYears,
  teacherRole,
}: Props) => {
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterAcademicYear, setFilterAcademicYear] = useState<string>("all");
  const [filterSemester, setFilterSemester] = useState<string>("all");
  const router = useRouter();

  const expandedData = useMemo(() => {
    const result: ExpandedClassData[] = [];

    classes.forEach((classItem) => {
      academicYears.forEach((academicYear) => {
        semesters.forEach((semester) => {
          result.push({
            id: `${classItem.id}-${academicYear.year}-${semester}`,
            class: classItem,
            academicYear: academicYear.year,
            semester: semester,
            academicYearId: academicYear.id,
          });
        });
      });
    });

    return result;
  }, [classes, academicYears]);

  const filteredData = useMemo(() => {
    return expandedData.filter((item) => {
      const matchClass = filterClass === "all" || item.class.id === filterClass;
      const matchYear =
        filterAcademicYear === "all" ||
        item.academicYear === filterAcademicYear;
      const matchSemester =
        filterSemester === "all" || item.semester === filterSemester;

      return matchClass && matchYear && matchSemester;
    });
  }, [expandedData, filterClass, filterAcademicYear, filterSemester]);

  const handleCloseAlert = () => {
    router.replace("/classes", { scroll: false });
  };

  const handleResetFilters = () => {
    setFilterClass("all");
    setFilterAcademicYear("all");
    setFilterSemester("all");
  };

  const tabel: TabelColumn<ExpandedClassData>[] = [
    {
      header: "No",
      accessor: "id",
      render: (_, index) => (index as number) + 1,
    },
    {
      header: "Nama Kelas",
      accessor: (item) => item.class.name || "-",
    },
    {
      header: "Tahun Ajaran",
      accessor: (item) => item.academicYear,
    },
    {
      header: "Semester",
      accessor: (item) => (item.semester === "SEMESTER_1" ? "Ganjil" : "Genap"),
    },
    {
      header: "Aksi",
      accessor: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              router.push(
                `/assessments/${item.class.id}?year=${item.academicYearId}&semester=${item.semester}`
              )
            }
            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-150 border border-blue-200"
            title="Lihat Detail"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-5">
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-gray-700">Filter Data</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teacherRole === "GURU" ? null : (
              <div>
                <label
                  htmlFor="filterClass"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Kelas
                </label>
                <select
                  id="filterClass"
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">Semua Kelas</option>
                  {classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filter Tahun Ajaran */}
            <div>
              <label
                htmlFor="filterYear"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tahun Ajaran
              </label>
              <select
                id="filterYear"
                value={filterAcademicYear}
                onChange={(e) => setFilterAcademicYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Semua Tahun</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.year}>
                    {year.year}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Semester */}
            <div>
              <label
                htmlFor="filterSemester"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Semester
              </label>
              <select
                id="filterSemester"
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Semua Semester</option>
                {semesters.map((semester) => (
                  <option key={semester} value={semester}>
                    {semester === "SEMESTER_1" ? "Semester 1" : "Semester 2"}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-150 text-sm font-medium"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div className="text-sm text-gray-600">
          Menampilkan {filteredData.length} dari {expandedData.length} data
        </div>
      </div>

      <Tabel columns={tabel} data={filteredData} />

      <div className="mt-8">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          preserveParams={pagination.preserveParams}
        />
      </div>

      <Alert
        isVisible={message !== undefined}
        message={message || ""}
        onClose={handleCloseAlert}
        type={alertType || "success"}
        autoClose
      />
    </div>
  );
};
