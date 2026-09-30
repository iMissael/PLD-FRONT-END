import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export interface TablePaginationProps {
  component?: React.ElementType;
  count: number;
  page: number; // 0-indexed
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  rowsPerPage: number;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  rowsPerPageOptions?: (number | { value: number; label: string })[];
  labelRowsPerPage?: string;
  labelDisplayedRows?: (info: { from: number; to: number; count: number; page: number }) => React.ReactNode;
  showFirstButton?: boolean;
  showLastButton?: boolean;
  className?: string;
}

export function TablePagination({
  component: Component = "div",
  count,
  page,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25, 50],
  labelRowsPerPage = "Filas por página:",
  labelDisplayedRows,
  showFirstButton = true,
  showLastButton = true,
  className,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(count / rowsPerPage));
  const from = count === 0 ? 0 : page * rowsPerPage + 1;
  const to = count === 0 ? 0 : Math.min(count, (page + 1) * rowsPerPage);

  const displayedText = labelDisplayedRows
    ? labelDisplayedRows({ from, to, count, page })
    : `${from}–${to} de ${count}`;

  // Generate numbered pages array with smart windowing
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (page > 2) {
        pages.push("...");
      }
      const start = Math.max(1, page - 1);
      const end = Math.min(totalPages - 2, page + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (page < totalPages - 3) {
        pages.push("...");
      }
      pages.push(totalPages - 1);
    }
    return pages;
  };

  const handlePageClick = (e: React.MouseEvent<HTMLButtonElement>, newPage: number) => {
    if (newPage >= 0 && newPage < totalPages && newPage !== page) {
      onPageChange(e, newPage);
    }
  };

  return (
    <Component
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 border-t border-border bg-card px-4 py-3 text-xs text-foreground",
        className,
      )}
    >
      {/* Rows per page selector */}
      <div className="flex items-center gap-2">
        {onRowsPerPageChange && rowsPerPageOptions && rowsPerPageOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{labelRowsPerPage}</span>
            <select
              value={rowsPerPage}
              onChange={onRowsPerPageChange}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {rowsPerPageOptions.map((opt) => {
                const val = typeof opt === "number" ? opt : opt.value;
                const label = typeof opt === "number" ? opt : opt.label;
                return (
                  <option key={val} value={val}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        )}
        <span className="text-muted-foreground font-medium">{displayedText}</span>
      </div>

      {/* Numbered pagination buttons & navigation */}
      <div className="flex items-center gap-1">
        {showFirstButton && (
          <button
            type="button"
            disabled={page <= 0}
            onClick={(e) => handlePageClick(e, 0)}
            title="Primera página"
            className="flex size-7 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronsLeft className="size-3.5" />
          </button>
        )}

        <button
          type="button"
          disabled={page <= 0}
          onClick={(e) => handlePageClick(e, page - 1)}
          title="Página anterior"
          className="flex size-7 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="size-3.5" />
        </button>

        {/* Numbered Buttons */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground select-none">
                  …
                </span>
              );
            }
            const isCurrent = p === page;
            return (
              <button
                key={p}
                type="button"
                onClick={(e) => handlePageClick(e, p)}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "flex size-7 items-center justify-center rounded-md text-xs font-semibold transition-colors",
                  isCurrent
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border bg-card text-foreground hover:bg-muted",
                )}
              >
                {p + 1}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={page >= totalPages - 1}
          onClick={(e) => handlePageClick(e, page + 1)}
          title="Página siguiente"
          className="flex size-7 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="size-3.5" />
        </button>

        {showLastButton && (
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={(e) => handlePageClick(e, totalPages - 1)}
            title="Última página"
            className="flex size-7 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronsRight className="size-3.5" />
          </button>
        )}
      </div>
    </Component>
  );
}
