"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { SchemaField } from "@/lib/types";

type Row = Record<string, unknown>;

interface ResultsCardsProps {
  data: Row[];
  fields: SchemaField[];
}

export function ResultsCards({ data, fields }: ResultsCardsProps) {
  if (data.length === 0) return null;

  return (
    <div className="flex-1 overflow-auto p-4 bg-[var(--surface-secondary)]/30">
      <ul className="flex flex-col gap-3 max-w-4xl mx-auto">
        {data.map((row, i) => (
          <ResultCard key={i} row={row} fields={fields} />
        ))}
      </ul>
    </div>
  );
}

function ResultCard({ row, fields }: { row: Row; fields: SchemaField[] }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? fields : fields.slice(0, 3);
  const hasMore = fields.length > 3;

  return (
    <li
      className={cn(
        "rounded-lg border border-[var(--border)]",
        "bg-[var(--surface)] shadow-sm",
        "transition-all duration-200"
      )}
    >
      <button
        type="button"
        onClick={() => {
          if (hasMore) setExpanded((v) => !v);
        }}
        className={cn(
          "w-full flex flex-col gap-2 p-3 text-left focus-ring rounded-lg",
          hasMore ? "cursor-pointer" : "cursor-default"
        )}
        aria-expanded={hasMore ? expanded : undefined}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 w-full">
          {shown.map((field) => (
            <div key={field.name} className="flex flex-col gap-1 min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--gray-500)] truncate">
                {field.label}
              </span>
              <span className="text-sm font-mono text-[var(--foreground)] truncate">
                {formatCardValue(row[field.name])}
              </span>
            </div>
          ))}
        </div>
        
        {hasMore && !expanded && (
          <div className="mt-1 pt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--accent-500)] font-medium text-center hover:text-[var(--accent-600)] transition-colors">
            +{fields.length - 3} more fields
          </div>
        )}
      </button>
    </li>
  );
}

function formatCardValue(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}
