"use client";

/**
 * OperatorSelector — field-type-aware operator picker.
 *
 * Filters the global OPERATORS list to only show operators
 * that are compatible with the currently selected field's type.
 * Falls back to all operators when no field is selected.
 */

import { useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { getOperatorsForFieldType, OPERATORS } from "@/lib/constants/operators";
import type { FieldType, OperatorType } from "@/lib/types";

interface OperatorSelectorProps {
  value: OperatorType;
  fieldType: FieldType | null;
  disabled?: boolean;
  onChange: (operator: OperatorType) => void;
}

export function OperatorSelector({
  value,
  fieldType,
  disabled,
  onChange,
}: OperatorSelectorProps) {
  const availableOperators = fieldType
    ? getOperatorsForFieldType(fieldType)
    : OPERATORS;

  const selectedValue = availableOperators.find((o) => o.type === value)?.type ?? availableOperators[0]?.type ?? null;

  useEffect(() => {
    if (selectedValue && value !== selectedValue) {
      onChange(selectedValue);
    }
  }, [value, selectedValue, onChange]);

  return (
    <select
      value={selectedValue ?? ""}
      onChange={(e) => {
        if (e.target.value) onChange(e.target.value as OperatorType);
      }}
      disabled={disabled || !selectedValue}
      className={cn(
        "h-8 px-2 rounded-md text-sm",
        "bg-[var(--surface)] border border-[var(--border)]",
        "text-[var(--foreground)]",
        "focus-ring",
        "min-w-[140px]"
      )}
      aria-label="Select operator"
    >
      {availableOperators.map((op) => (
        <option key={op.type} value={op.type}>
          {op.label}
        </option>
      ))}
    </select>
  );
}
