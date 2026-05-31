"use client";

/**
 * CombinatorToggle — AND/OR pill toggle.
 *
 * Rendered between the group header and its children.
 * Clicking toggles the parent group's combinator.
 */

import { cn } from "@/lib/utils/cn";

interface CombinatorToggleProps {
  combinator: "AND" | "OR";
  onToggle: () => void;
}

export function CombinatorToggle({
  combinator,
  onToggle,
}: CombinatorToggleProps) {
  const isAnd = combinator === "AND";

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex items-center justify-center",
        "px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
        "transition-colors duration-150 cursor-pointer",
        "border",
        "focus-ring",
        isAnd
          ? "bg-[var(--combinator-and-bg)] text-[var(--combinator-and-text)] border-[var(--combinator-and-border)]"
          : "bg-[var(--combinator-or-bg)] text-[var(--combinator-or-text)] border-[var(--combinator-or-border)]"
      )}
      aria-label={`Toggle combinator, currently ${combinator}`}
      title={`Click to switch to ${isAnd ? "OR" : "AND"}`}
    >
      {combinator}
    </button>
  );
}
