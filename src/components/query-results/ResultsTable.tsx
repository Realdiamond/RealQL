/**
 * ResultsTable — sortable data table for query execution results.
 *
 * Renders a clean, professional table with:
 * - Column headers derived from the first result row
 * - Click-to-sort on any column (asc → desc → none)
 * - Proper formatting for different value types (booleans, nulls, dates)
 * - Alternating row shading for readability
 */

"use client";

import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { SortState } from "@/lib/types";

type Row = Record<string, unknown>;

interface ResultsTableProps {
  data: Row[];
  sort: SortState | null;
  onSortChange: (sort: SortState | null) => void;
}

export function ResultsTable({ data, sort, onSortChange }: ResultsTableProps) {
  if (data.length === 0) return null;

  const columns = Object.keys(data[0]);

  function handleSort(column: string) {
    if (sort?.column !== column) {
      onSortChange({ column, direction: "asc" });
    } else if (sort.direction === "asc") {
      onSortChange({ column, direction: "desc" });
    } else {
      onSortChange(null);
    }
  }

  // Sort data locally
  const sortedData = sort
    ? [...data].sort((a, b) => {
        const aVal = a[sort.column];
        const bVal = b[sort.column];
        const dir = sort.direction === "asc" ? 1 : -1;

        if (aVal === null || aVal === undefined) return 1 * dir;
        if (bVal === null || bVal === undefined) return -1 * dir;

        if (typeof aVal === "number" && typeof bVal === "number") {
          return (aVal - bVal) * dir;
        }

        return String(aVal).localeCompare(String(bVal)) * dir;
      })
    : data;

  return (
    <div className="overflow-auto flex-1">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[var(--surface-secondary)]">
            {columns.map((col) => (
              <th
                key={col}
                className={cn(
                  "px-3 py-2.5 text-left font-semibold text-[var(--gray-600)] dark:text-[var(--gray-400)]",
                  "border-b border-[var(--border)]",
                  "cursor-pointer select-none",
                  "hover:text-[var(--foreground)] hover:bg-[var(--gray-100)] dark:hover:bg-[var(--gray-800)]",
                  "transition-colors duration-100",
                  "whitespace-nowrap"
                )}
                onClick={() => handleSort(col)}
                aria-sort={
                  sort?.column === col
                    ? sort.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <span className="inline-flex items-center gap-1">
                  {col}
                  {sort?.column === col ? (
                    sort.direction === "asc" ? (
                      <ArrowUp size={12} className="text-[var(--accent-500)]" />
                    ) : (
                      <ArrowDown size={12} className="text-[var(--accent-500)]" />
                    )
                  ) : (
                    <ArrowUpDown size={12} className="opacity-30" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={cn(
                "border-b border-[var(--border-subtle)]",
                "hover:bg-[var(--accent-50)]/50 dark:hover:bg-[var(--accent-900)]/10",
                "transition-colors duration-75",
                rowIdx % 2 === 1 && "bg-[var(--surface-secondary)]/50"
              )}
            >
              {columns.map((col) => (
                <td
                  key={col}
                  className="px-3 py-2 text-[var(--foreground)] whitespace-nowrap"
                >
                  {formatCellValue(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Format a cell value for display */
function formatCellValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return (
      <span className="text-[var(--gray-400)] italic">null</span>
    );
  }

  if (typeof value === "boolean") {
    return (
      <span
        className={cn(
          "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider",
          value
            ? "bg-[var(--success-500)]/10 text-[var(--success-600)]"
            : "bg-[var(--gray-200)] text-[var(--gray-600)] dark:bg-[var(--gray-700)] dark:text-[var(--gray-400)]"
        )}
      >
        {value ? "true" : "false"}
      </span>
    );
  }

  if (typeof value === "number") {
    return <span className="tabular-nums">{value}</span>;
  }

  return <span>{String(value)}</span>;
}
