"use client";

/**
 * EmptyGroupState — shown when a group has no children.
 *
 * Clean empty state with CTA to add the first condition.
 */

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface EmptyGroupStateProps {
  onAddRule: () => void;
}

export function EmptyGroupState({ onAddRule }: EmptyGroupStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        "py-8 px-4",
        "text-center"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center",
          "h-10 w-10 rounded-full mb-3",
          "bg-[var(--surface-secondary)]",
          "text-[var(--gray-400)]"
        )}
      >
        <Plus className="h-5 w-5" />
      </div>
      <p className="text-sm text-[var(--gray-500)] mb-3">
        No conditions yet
      </p>
      <button
        type="button"
        onClick={onAddRule}
        className={cn(
          "inline-flex items-center gap-1.5",
          "px-3 py-1.5 rounded-md text-sm font-medium",
          "bg-[var(--primary)] text-white",
          "hover:bg-[var(--primary-hover)]",
          "transition-colors duration-150",
          "focus-ring"
        )}
      >
        <Plus className="h-3.5 w-3.5" />
        Add condition
      </button>
    </div>
  );
}
