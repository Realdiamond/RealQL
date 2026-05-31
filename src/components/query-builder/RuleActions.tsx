"use client";

/**
 * RuleActions — per-rule action buttons.
 *
 * Delete, duplicate, and disable toggle for a single query rule.
 */

import { Trash2, Copy, EyeOff, Eye } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface RuleActionsProps {
  disabled?: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleDisable: () => void;
}

export function RuleActions({
  disabled,
  onDelete,
  onDuplicate,
  onToggleDisable,
}: RuleActionsProps) {
  return (
    <div className="flex items-center gap-0.5 opacity-0 group-hover/rule:opacity-100 group-focus-within/rule:opacity-100 transition-opacity duration-150">
      <button
        type="button"
        onClick={onToggleDisable}
        className={cn(
          "inline-flex items-center justify-center",
          "h-7 w-7 rounded-md",
          "text-[var(--gray-400)] hover:text-[var(--foreground)]",
          "hover:bg-[var(--surface-secondary)]",
          "transition-colors duration-150"
        )}
        aria-label={disabled ? "Enable rule" : "Disable rule"}
        title={disabled ? "Enable rule" : "Disable rule"}
      >
        {disabled ? (
          <Eye className="h-3.5 w-3.5" />
        ) : (
          <EyeOff className="h-3.5 w-3.5" />
        )}
      </button>

      <button
        type="button"
        onClick={onDuplicate}
        className={cn(
          "inline-flex items-center justify-center",
          "h-7 w-7 rounded-md",
          "text-[var(--gray-400)] hover:text-[var(--foreground)]",
          "hover:bg-[var(--surface-secondary)]",
          "transition-colors duration-150"
        )}
        aria-label="Duplicate rule"
        title="Duplicate rule"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={onDelete}
        className={cn(
          "inline-flex items-center justify-center",
          "h-7 w-7 rounded-md",
          "text-[var(--gray-400)] hover:text-[var(--error)]",
          "hover:bg-[var(--error)]/10",
          "transition-colors duration-150"
        )}
        aria-label="Delete rule"
        title="Delete rule"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
