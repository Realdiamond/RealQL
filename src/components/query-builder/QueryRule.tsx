"use client";

/**
 * QueryRule — single condition row.
 *
 * Renders field selector, operator selector, value input,
 * and rule actions. This is a placeholder layout that will
 * be wired to real selectors in PR 5 (schema-driven inputs).
 */

import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { RuleActions } from "./RuleActions";
import type { QueryRule as QueryRuleType } from "@/lib/types";
import { OPERATORS } from "@/lib/constants/operators";

interface QueryRuleProps {
  rule: QueryRuleType;
  depth: number;
  onUpdate: (updates: Partial<QueryRuleType>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function QueryRule({
  rule,
  onUpdate,
  onDelete,
  onDuplicate,
}: QueryRuleProps) {
  const operator = OPERATORS.find((op) => op.type === rule.operator);

  return (
    <div
      className={cn(
        "group/rule flex items-center gap-2 px-3 py-2 rounded-lg",
        "bg-[var(--surface)] hover:bg-[var(--surface-secondary)]",
        "border border-[var(--border)]",
        "transition-colors duration-150",
        rule.disabled && "opacity-50"
      )}
      data-rule-id={rule.id}
    >
      {/* Drag handle (visual only — wired in PR 9) */}
      <div className="flex items-center text-[var(--gray-300)] cursor-grab">
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Field selector placeholder */}
      <select
        value={rule.field}
        onChange={(e) => onUpdate({ field: e.target.value, operator: "equals", value: "" })}
        className={cn(
          "h-8 px-2 rounded-md text-sm",
          "bg-[var(--surface)] border border-[var(--border)]",
          "text-[var(--foreground)]",
          "focus-ring",
          "min-w-[140px]"
        )}
        aria-label="Select field"
      >
        <option value="">Select field...</option>
      </select>

      {/* Operator selector placeholder */}
      <select
        value={rule.operator}
        onChange={(e) => onUpdate({ operator: e.target.value as QueryRuleType["operator"] })}
        className={cn(
          "h-8 px-2 rounded-md text-sm",
          "bg-[var(--surface)] border border-[var(--border)]",
          "text-[var(--foreground)]",
          "focus-ring",
          "min-w-[140px]"
        )}
        aria-label="Select operator"
      >
        {OPERATORS.map((op) => (
          <option key={op.type} value={op.type}>
            {op.label}
          </option>
        ))}
      </select>

      {/* Value input placeholder */}
      {operator?.requiresValue !== false && (
        <input
          type="text"
          value={typeof rule.value === "string" ? rule.value : String(rule.value ?? "")}
          onChange={(e) => onUpdate({ value: e.target.value })}
          placeholder="Enter value..."
          className={cn(
            "h-8 px-2 rounded-md text-sm flex-1",
            "bg-[var(--surface)] border border-[var(--border)]",
            "text-[var(--foreground)]",
            "placeholder:text-[var(--gray-400)]",
            "focus-ring",
            "min-w-[120px]"
          )}
          aria-label="Enter value"
          disabled={rule.disabled}
        />
      )}

      {/* Actions */}
      <RuleActions
        disabled={rule.disabled}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onToggleDisable={() => onUpdate({ disabled: !rule.disabled })}
      />
    </div>
  );
}
