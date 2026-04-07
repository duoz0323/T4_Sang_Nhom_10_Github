import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
export default function Pagination({
  totalItems,
  currentPage,
  totalPages,
  onPageChange,
  onRowsPerPageChange,
}) {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const getPages = () => {
    const pages = [];

    if (currentPage <= 2) {
      pages.push(1, 2, 3);
      if (totalPages > 3) pages.push("...");
      pages.push(totalPages);
    } else {
      pages.push(1);
      pages.push("...");

      const start = currentPage + 1;
      const end = Math.min(currentPage + 3, totalPages);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };
  const pages = getPages();
  const start = (currentPage - 1) * rowsPerPage + 1;
  const end = Math.min(currentPage * rowsPerPage, totalItems);
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
      <div className="text-sm text-gray-600">
        Showing <span className="text-gray-900">{start}</span> to{" "}
        <span className="text-gray-900">{totalItems}</span> of{" "}
        <span className="text-gray-900">{end}</span> results
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page:</span>
          <div className="relative">
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="appearance-none pl-3 pr-9 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>30</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-400 bg-white transition-colors disabled:opacity-65 disabled:cursor-not-allowed"
            disabled
          >
            <ChevronLeft size={16} />
          </button>
          {pages.map((page, index) =>
            page === "..." ? (
              <span key={index}>...</span>
            ) : (
              <button
                key={index}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 border rounded 
              ${page === currentPage ? "bg-blue-500 text-white" : ""}
            `}
              >
                {page}
              </button>
            ),
          )}
          <button className="px-3.5 py-2 border border-gray-900 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
