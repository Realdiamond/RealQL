"use client";

/**
 * PreviewFormatTabs — tab switcher for query output formats.
 *
 * Renders a compact tab bar for toggling between SQL, MongoDB,
 * and GraphQL preview formats. Uses clean pill-style active state.
 */

import { cn } from "@/lib/utils/cn";
import type { QueryOutputFormat } from "@/lib/types";

interface PreviewFormatTabsProps {
  activeFormat: QueryOutputFormat;
  onChange: (format: QueryOutputFormat) => void;
}

const FORMATS: { value: QueryOutputFormat; label: string }[] = [
  { value: "sql", label: "SQL" },
  { value: "mongodb", label: "MongoDB" },
  { value: "graphql", label: "GraphQL" },
  { value: "json", label: "JSON" },
];

export function PreviewFormatTabs({
  activeFormat,
  onChange,
}: PreviewFormatTabsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-0.5",
        "p-0.5 rounded-lg",
        "bg-[var(--surface-secondary)]"
      )}
      role="group"
      aria-label="Query output format"
    >
      {FORMATS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={activeFormat === value}
          onClick={() => onChange(value)}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-medium",
            "transition-all duration-150",
            activeFormat === value
              ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm"
              : "text-[var(--gray-400)] hover:text-[var(--foreground)]"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
