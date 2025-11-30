"use client";

import { Edit, Plus, Trash2, Eye } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabel, type TabelColumn } from "../../_components/tabel";
import { deleteDevelopmentAspect } from "@/actions/development-aspect";
import { Pagination } from "../../_components/pagination";
import { Modal } from "../../_components/modal";
import { Alert } from "../../_components/alert";
import type { Prisma } from "@prisma/client";
import { DevelopmentAspectForm } from "./form";

export type DevelopmentAspectWithRelations =
  Prisma.DevelopmentAspectGetPayload<{
    include: {
      indicators: {
        where: {
          isDeleted: false;
        };
        orderBy: {
          order: "asc";
        };
      };
    };
  }>;

interface Props {
  alertType?: "success" | "error";
  message?: string;
  aspects: DevelopmentAspectWithRelations[];
  pagination: PaginationProps;
}

export const DevelopmentAspectList = ({
  alertType,
  aspects,
  message,
  pagination,
}: Props) => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [selectedAspect, setSelectedAspect] =
    useState<DevelopmentAspectWithRelations | null>(null);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const router = useRouter();

  const handleOpenModal = (
    aspect?: DevelopmentAspectWithRelations,
    viewMode: boolean = false
  ) => {
    setIsOpenModal(true);
    setIsViewMode(viewMode);
    if (aspect) {
      setSelectedAspect(aspect);
    }
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
    setSelectedAspect(null);
    setIsViewMode(false);
  };

  const handleCloseAlert = () => {
    router.replace("/development-aspects", { scroll: false });
  };

  // const formatAgeGroup = (ageGroup: string) => {
  //   const ageGroupMap: Record<string, string> = {
  //     GROUP_A: "Kelompok A (4-5 tahun)",
  //     GROUP_B: "Kelompok B (5-6 tahun)",
  //     TODDLER: "Kelompok Bermain (2-4 tahun)",
  //   };
  //   return ageGroupMap[ageGroup] || ageGroup;
  // };

  // const getAgeGroupColor = (ageGroup: string) => {
  //   const colorMap: Record<string, string> = {
  //     GROUP_A: "bg-blue-100 text-blue-800",
  //     GROUP_B: "bg-green-100 text-green-800",
  //     TODDLER: "bg-pink-100 text-pink-800",
  //   };
  //   return colorMap[ageGroup] || "bg-gray-100 text-gray-800";
  // };

  const tabel: TabelColumn<DevelopmentAspectWithRelations>[] = [
    {
      header: "No",
      accessor: "id",
      render: (_, index) => (index as number) + 1,
    },
    {
      header: "Kode",
      accessor: (item) => item.code || "-",
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-medium bg-gray-100 text-gray-800 border">
          {item.code}
        </span>
      ),
    },
    {
      header: "Nama Aspek",
      accessor: (item) => item.name || "-",
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900">{item.name}</div>
          {item.description && (
            <div className="text-sm text-gray-500 mt-1 line-clamp-2">
              {item.description}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Jumlah Indikator",
      accessor: (item) => item.indicators.length.toString(),
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            {item.indicators.length}
          </span>
          {item.indicators.length > 0 && (
            <button
              onClick={() => handleOpenModal(item, true)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Lihat Detail
            </button>
          )}
        </div>
      ),
    },
    // {
    //   header: "Kelompok Usia",
    //   accessor: (item) => {
    //     const ageGroups = [
    //       ...new Set(
    //         item.indicators
    //           .filter((ind) => ind.ageGroup)
    //           .map((ind) => ind.ageGroup as string)
    //       ),
    //     ];
    //     return ageGroups.length > 0 ? ageGroups.join(", ") : "Semua";
    //   },
    //   render: (item) => {
    //     const ageGroups = [
    //       ...new Set(
    //         item.indicators
    //           .filter((ind) => ind.ageGroup)
    //           .map((ind) => ind.ageGroup as string)
    //       ),
    //     ];

    //     if (ageGroups.length === 0) {
    //       return (
    //         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
    //           Semua Usia
    //         </span>
    //       );
    //     }

    //     return (
    //       <div className="flex flex-wrap gap-1">
    //         {ageGroups.map((ageGroup) => (
    //           <span
    //             key={ageGroup}
    //             className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getAgeGroupColor(
    //               ageGroup
    //             )}`}
    //           >
    //             {formatAgeGroup(ageGroup)}
    //           </span>
    //         ))}
    //       </div>
    //     );
    //   },
    // },
    {
      header: "Urutan",
      accessor: (item) => item.order.toString(),
      render: (item) => (
        <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
          {item.order}
        </span>
      ),
    },
    {
      header: "Aksi",
      accessor: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal(item, true)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors duration-150 border border-green-200"
            title="Lihat Detail"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenModal(item)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-150 border border-blue-200"
            title="Edit Data"
          >
            <Edit className="w-4 h-4" />
          </button>
          <form action={() => deleteDevelopmentAspect(item.id)}>
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                if (item.indicators.length > 0) {
                  alert(
                    "Tidak dapat menghapus aspek yang masih memiliki indikator."
                  );
                  return;
                }
                if (
                  confirm(
                    `Apakah Anda yakin ingin menghapus aspek "${item.name}"?`
                  )
                ) {
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              className={`w-8 h-8 inline-flex items-center justify-center rounded-md text-white text-sm transition-colors duration-150 ${
                item.indicators.length > 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
              }`}
              title={
                item.indicators.length > 0
                  ? "Tidak dapat menghapus aspek yang memiliki indikator"
                  : "Hapus Data"
              }
              disabled={item.indicators.length > 0}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </form>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Aspek Perkembangan
          </h1>
          <p className="text-sm text-gray-600">
            Kelola aspek-aspek perkembangan anak dan indikator-indikatornya
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors duration-150 shadow-sm border border-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Aspek Perkembangan
        </button>
      </div>

      {aspects.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-600">
                {aspects.length}
              </div>
              <div className="text-sm text-blue-700">Total Aspek</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-600">
                {aspects.reduce(
                  (total, aspect) => total + aspect.indicators.length,
                  0
                )}
              </div>
              <div className="text-sm text-blue-700">Total Indikator</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-600">
                {
                  aspects.filter((aspect) => aspect.indicators.length > 0)
                    .length
                }
              </div>
              <div className="text-sm text-blue-700">Aspek Aktif</div>
            </div>
          </div>
        </div>
      )}

      <Tabel columns={tabel} data={aspects} />

      <div className="mt-8">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          preserveParams={pagination.preserveParams}
        />
      </div>

      <Modal isOpen={isOpenModal} onClose={handleCloseModal}>
        <DevelopmentAspectForm
          modal={selectedAspect ? (isViewMode ? "view" : "edit") : "add"}
          onClose={handleCloseModal}
          selectedAspect={selectedAspect}
        />
      </Modal>

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
