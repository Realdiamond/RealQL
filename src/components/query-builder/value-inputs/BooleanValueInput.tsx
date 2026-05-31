"use client";

/**
 * BooleanValueInput — toggle for boolean fields.
 *
 * Renders a simple true/false dropdown. Clean and explicit.
 */

import { cn } from "@/lib/utils/cn";

interface BooleanValueInputProps {
  value: boolean | string;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}

export function BooleanValueInput({
  value,
  disabled,
  onChange,
}: BooleanValueInputProps) {
  const stringValue = typeof value === "boolean" ? String(value) : value;

  return (
    <select
      value={stringValue}
      onChange={(e) => onChange(e.target.value === "true")}
      disabled={disabled}
      className={cn(
        "h-8 px-2 rounded-md text-sm",
        "bg-[var(--surface)] border border-[var(--border)]",
        "text-[var(--foreground)]",
        "focus-ring",
        "min-w-[100px]"
      )}
      aria-label="Boolean value"
    >
      <option value="true">True</option>
      <option value="false">False</option>
    </select>
  );
}
