"use client";

import { FileX } from "lucide-react";

export interface TabelColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  render?: (item: T, index?: number) => React.ReactNode;
}

export interface TabelProps<T extends Record<string, unknown>> {
  data: T[];
  columns: TabelColumn<T>[];
  className?: string;
  emptyMessage?: string;
}

const getValue = <T extends Record<string, unknown>>(
  item: T,
  accessor: keyof T | ((item: T) => React.ReactNode)
): unknown => {
  if (typeof accessor === "function") {
    return accessor(item);
  }
  return item[accessor];
};

export function Tabel<T extends Record<string, unknown>>({
  data,
  columns,
  className = "",
  emptyMessage = "Tidak ada data yang tersedia",
}: TabelProps<T>) {
  return (
    <div className="w-full overflow-hidden bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className={`w-full ${className}`}>
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 text-left text-sm font-semibold text-slate-900 ${
                    column.className || ""
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-slate-50 transition-colors duration-150"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 text-sm text-slate-700 ${
                        column.className || ""
                      }`}
                    >
                      {column.render
                        ? column.render(item, index)
                        : (getValue(item, column.accessor) as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                      <FileX className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-lg font-medium text-slate-900 mb-2">
                      {emptyMessage}
                    </p>
                    <p className="text-sm text-slate-500">
                      Coba ubah filter pencarian Anda
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
