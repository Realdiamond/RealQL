/**
 * ResultsPagination — page navigation for query results.
 *
 * Renders Previous/Next buttons plus a page indicator.
 * Designed to sit at the bottom of the results table.
 */

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { PaginationState } from "@/lib/types";

interface ResultsPaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
}

export function ResultsPagination({
  pagination,
  onPageChange,
}: ResultsPaginationProps) {
  const { page, totalPages } = pagination;

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-t border-[var(--border)]">
      <p className="text-xs text-[var(--gray-500)]">
        Page {page} of {totalPages}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium",
            "border border-[var(--border)] bg-[var(--surface)]",
            "text-[var(--foreground)]",
            "hover:bg-[var(--gray-100)] dark:hover:bg-[var(--gray-800)]",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "transition-colors duration-150"
          )}
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
          Prev
        </button>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium",
            "border border-[var(--border)] bg-[var(--surface)]",
            "text-[var(--foreground)]",
            "hover:bg-[var(--gray-100)] dark:hover:bg-[var(--gray-800)]",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "transition-colors duration-150"
          )}
          aria-label="Next page"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
