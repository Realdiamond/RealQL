/**
 * ResultsToolbar — top bar of the results panel.
 *
 * Contains the Execute button, matched/total counts,
 * execution time, and page size selector.
 */

"use client";

import { Play, Loader2, Clock, Database } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ResultsToolbarProps {
  onExecute: () => void;
  isLoading: boolean;
  matchedCount: number | null;
  totalCount: number | null;
  executionTimeMs: number | null;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZES = [10, 25, 50, 100];

export function ResultsToolbar({
  onExecute,
  isLoading,
  matchedCount,
  totalCount,
  executionTimeMs,
  pageSize,
  onPageSizeChange,
}: ResultsToolbarProps) {
  const hasResults = matchedCount !== null;

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--surface)]">
      {/* Left: Execute button + stats */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExecute}
          disabled={isLoading}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold",
            "bg-[var(--accent-500)] text-white",
            "hover:bg-[var(--accent-600)]",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            "transition-colors duration-150",
            "shadow-sm"
          )}
          aria-label="Execute query"
        >
          {isLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Play size={14} />
          )}
          {isLoading ? "Running…" : "Execute"}
        </button>

        {hasResults && (
          <div className="flex items-center gap-3 text-xs text-[var(--gray-500)]">
            <span className="inline-flex items-center gap-1">
              <Database size={12} />
              <span className="font-medium text-[var(--foreground)]">
                {matchedCount}
              </span>
              {" / "}
              {totalCount ?? "—"} rows
            </span>

            {executionTimeMs !== null && (
              <span className="inline-flex items-center gap-1">
                <Clock size={12} />
                {executionTimeMs}ms
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right: Page size selector */}
      {hasResults && matchedCount > 0 && (
        <div className="flex items-center gap-2">
          <label
            htmlFor="page-size-select"
            className="text-xs text-[var(--gray-500)]"
          >
            Show
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className={cn(
              "text-xs px-2 py-1 rounded-md",
              "border border-[var(--border)] bg-[var(--surface)]",
              "text-[var(--foreground)]",
              "focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
            )}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
