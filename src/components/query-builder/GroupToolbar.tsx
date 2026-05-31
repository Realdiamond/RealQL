"use client";

/**
 * GroupToolbar — actions bar for a query group.
 *
 * Contains the combinator toggle, add rule/group buttons,
 * collapse toggle, and delete button.
 */

import { Plus, FolderPlus, Trash2, ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils/cn";
import { CombinatorToggle } from "./CombinatorToggle";

interface GroupToolbarProps {
  groupId: string;
  combinator: "AND" | "OR";
  collapsed: boolean;
  isRoot: boolean;
  childCount: number;
  onToggleCombinator: () => void;
  onToggleCollapse: () => void;
  onAddRule: () => void;
  onAddGroup: () => void;
  onDelete: () => void;
  dragHandleRef?: (element: HTMLElement | null) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

export function GroupToolbar({
  combinator,
  collapsed,
  isRoot,
  childCount,
  onToggleCombinator,
  onToggleCollapse,
  onAddRule,
  onAddGroup,
  onDelete,
  dragHandleRef,
  dragHandleProps,
}: GroupToolbarProps) {
  return (
    <div className="flex items-center gap-2 py-2 px-3">
      {/* Drag handle (not for root) */}
      {!isRoot && (
        <div
          ref={dragHandleRef}
          {...dragHandleProps}
          className={cn(
            "flex items-center text-[var(--gray-300)] focus-ring rounded-sm",
            dragHandleProps && "cursor-grab hover:text-[var(--foreground)] active:cursor-grabbing"
          )}
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className={cn(
          "inline-flex items-center justify-center",
          "h-6 w-6 rounded",
          "text-[var(--gray-400)] hover:text-[var(--foreground)]",
          "hover:bg-[var(--surface-secondary)]",
          "transition-colors duration-150"
        )}
        aria-label={collapsed ? "Expand group" : "Collapse group"}
        aria-expanded={!collapsed}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {/* Combinator toggle */}
      <CombinatorToggle
        combinator={combinator}
        onToggle={onToggleCombinator}
      />

      {/* Child count badge */}
      {collapsed && childCount > 0 && (
        <span className="text-xs text-[var(--gray-400)] tabular-nums">
          {childCount} {childCount === 1 ? "condition" : "conditions"}
        </span>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onAddRule}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium",
            "text-[var(--gray-500)] hover:text-[var(--foreground)]",
            "hover:bg-[var(--surface-secondary)]",
            "transition-colors duration-150"
          )}
          aria-label="Add rule"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Rule</span>
        </button>

        <button
          type="button"
          onClick={onAddGroup}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium",
            "text-[var(--gray-500)] hover:text-[var(--foreground)]",
            "hover:bg-[var(--surface-secondary)]",
            "transition-colors duration-150"
          )}
          aria-label="Add group"
        >
          <FolderPlus className="h-3.5 w-3.5" />
          <span>Group</span>
        </button>

        {/* Delete — not shown for root */}
        {!isRoot && (
          <button
            type="button"
            onClick={onDelete}
            className={cn(
              "inline-flex items-center justify-center",
              "h-7 w-7 rounded-md",
              "text-[var(--gray-400)] hover:text-[var(--color-error)]",
              "hover:bg-[var(--color-error)]/10",
              "transition-colors duration-150"
            )}
            aria-label="Delete group"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
