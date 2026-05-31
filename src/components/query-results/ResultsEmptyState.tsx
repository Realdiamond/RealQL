/**
 * ResultsEmptyState — shown when a query returns no matching results,
 * or when the user hasn't executed a query yet.
 */

"use client";

import { SearchX, Play } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ResultsEmptyStateProps {
  /** Whether a query has been executed (true) or we're in the initial state (false) */
  hasExecuted: boolean;
}

export function ResultsEmptyState({ hasExecuted }: ResultsEmptyStateProps) {
  if (!hasExecuted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
        <div
          className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center",
            "bg-[var(--accent-50)] dark:bg-[var(--accent-900)]/30"
          )}
        >
          <Play
            size={24}
            className="text-[var(--accent-500)] ml-0.5"
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-[var(--foreground)]">
            Ready to execute
          </p>
          <p className="text-xs text-[var(--gray-500)] max-w-[240px]">
            Build your query above and click <strong>Execute</strong> to see matching records from the mock dataset.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
      <div
        className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center",
          "bg-[var(--gray-100)] dark:bg-[var(--gray-800)]"
        )}
      >
        <SearchX size={24} className="text-[var(--gray-400)]" />
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-[var(--foreground)]">
          No matching records
        </p>
        <p className="text-xs text-[var(--gray-500)] max-w-[240px]">
          The current query didn&apos;t match any records in the dataset. Try adjusting your conditions.
        </p>
      </div>
    </div>
  );
}
