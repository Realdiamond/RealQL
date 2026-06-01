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
  viewMode: "table" | "cards";
  onViewModeChange: (mode: "table" | "cards") => void;
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
  viewMode,
  onViewModeChange,
}: ResultsToolbarProps) {
  const hasResults = matchedCount !== null;

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--surface)] flex-wrap">
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

      {/* Right: Layout toggle + Page size */}
      {hasResults && matchedCount > 0 && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 p-0.5 rounded-md bg-[var(--surface-secondary)] border border-[var(--border)]">
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              aria-pressed={viewMode === "table"}
              className={cn(
                "px-2 py-1 text-xs font-medium rounded-sm transition-colors",
                viewMode === "table"
                  ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm"
                  : "text-[var(--gray-500)] hover:text-[var(--foreground)]"
              )}
            >
              Table
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("cards")}
              aria-pressed={viewMode === "cards"}
              className={cn(
                "px-2 py-1 text-xs font-medium rounded-sm transition-colors",
                viewMode === "cards"
                  ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm"
                  : "text-[var(--gray-500)] hover:text-[var(--foreground)]"
              )}
            >
              Cards
            </button>
          </div>

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
        </div>
      )}
    </div>
  );
}
