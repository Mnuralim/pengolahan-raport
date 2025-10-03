"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  itemsPerPageOptions?: number[];
  className?: string;
  preserveParams?: Record<string, string | number | boolean | undefined>;
  labels?: {
    itemsLabel?: string;
    showingText?: string;
    displayingText?: string;
    ofText?: string;
    prevText?: string;
    nextText?: string;
  };
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  itemsPerPageOptions = [5, 10, 25, 50, 100],
  className = "",
  preserveParams = {},
  labels = {},
}: PaginationProps) {
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const defaultLabels = {
    itemsLabel: "items",
    showingText: "Tampilkan",
    displayingText: "Menampilkan",
    ofText: "dari",
    prevText: "Sebelumnya",
    nextText: "Selanjutnya",
    ...labels,
  };

  const createURL = (page: number, newItemsPerPage?: number) => {
    const params = new URLSearchParams(currentSearchParams.toString());

    const itemsPP = newItemsPerPage || itemsPerPage;
    const skip = (page - 1) * itemsPP;

    params.set("skip", skip.toString());
    params.set("limit", itemsPP.toString());

    Object.entries(preserveParams).forEach(([key, value]) => {
      if (key === "skip" || key === "limit") return;
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });

    return `?${params.toString()}`;
  };

  const handlePageChange = (page: number) => {
    router.push(createURL(page), {
      scroll: false,
    });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    router.push(createURL(1, newItemsPerPage), {
      scroll: false,
    });
    setIsDropdownOpen(false);
  };

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return [...new Set(rangeWithDots)].filter((item) => {
      if (totalPages === 1) return item === 1;
      if (item === 1) return true;
      if (item === totalPages) return totalPages > 1;
      return item !== 1 && item !== totalPages;
    });
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0) {
    return null;
  }

  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span className="font-medium">{defaultLabels.showingText}</span>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          >
            {itemsPerPage}
            <ChevronRight
              className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-90" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-full overflow-hidden">
              {itemsPerPageOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => handleItemsPerPageChange(option)}
                  className={`block w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-gray-50 transition-colors duration-200 ${
                    option === itemsPerPage
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="font-medium">
          {defaultLabels.ofText} {totalItems} {defaultLabels.itemsLabel}
        </span>
      </div>

      <div className="text-sm text-gray-600 font-medium">
        {defaultLabels.displayingText} {startItem}-{endItem}{" "}
        {defaultLabels.ofText} {totalItems} {defaultLabels.itemsLabel}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
            currentPage === 1
              ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          }`}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {defaultLabels.prevText}
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(1)}
            className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
              currentPage === 1
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            }`}
          >
            1
          </button>

          {currentPage > 4 && totalPages > 5 && (
            <div className="px-2 py-2 text-gray-400">
              <MoreHorizontal className="h-4 w-4" />
            </div>
          )}

          {getPageNumbers()
            .filter(
              (page) => page !== 1 && page !== totalPages && page !== "..."
            )
            .map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page as number)}
                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                  currentPage === page
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                }`}
              >
                {page}
              </button>
            ))}

          {currentPage < totalPages - 3 && totalPages > 5 && (
            <div className="px-2 py-2 text-gray-400">
              <MoreHorizontal className="h-4 w-4" />
            </div>
          )}

          {totalPages > 1 && (
            <button
              onClick={() => handlePageChange(totalPages)}
              className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                currentPage === totalPages
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-offset-2"
              }`}
            >
              {totalPages}
            </button>
          )}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
            currentPage === totalPages
              ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          }`}
        >
          {defaultLabels.nextText}
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
