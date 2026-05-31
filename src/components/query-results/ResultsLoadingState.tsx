/**
 * ResultsLoadingState — skeleton placeholder shown during query execution.
 *
 * Displays pulsing skeleton rows to indicate data is loading.
 * Uses design system tokens for consistent styling.
 */

"use client";

import { cn } from "@/lib/utils/cn";

interface ResultsLoadingStateProps {
  columnCount?: number;
  rowCount?: number;
}

export function ResultsLoadingState({
  columnCount = 5,
  rowCount = 8,
}: ResultsLoadingStateProps) {
  return (
    <div className="flex flex-col w-full" role="status" aria-label="Loading results">
      {/* Header skeleton */}
      <div className="flex gap-2 px-4 py-3 border-b border-[var(--border)]">
        {Array.from({ length: columnCount }).map((_, i) => (
          <div
            key={`header-${i}`}
            className={cn(
              "h-4 rounded bg-[var(--gray-200)] dark:bg-[var(--gray-700)]",
              "animate-pulse",
              i === 0 ? "w-28" : "flex-1"
            )}
          />
        ))}
      </div>

      {/* Row skeletons */}
      {Array.from({ length: rowCount }).map((_, rowIdx) => (
        <div
          key={`row-${rowIdx}`}
          className="flex gap-2 px-4 py-3 border-b border-[var(--border-subtle)]"
        >
          {Array.from({ length: columnCount }).map((_, colIdx) => (
            <div
              key={`cell-${rowIdx}-${colIdx}`}
              className={cn(
                "h-4 rounded bg-[var(--gray-150)] dark:bg-[var(--gray-800)]",
                "animate-pulse",
                colIdx === 0 ? "w-28" : "flex-1"
              )}
              style={{ animationDelay: `${(rowIdx * columnCount + colIdx) * 50}ms` }}
            />
          ))}
        </div>
      ))}

      <span className="sr-only">Loading query results…</span>
    </div>
  );
}
