"use client";

/**
 * NumberValueInput — numeric input for number fields.
 *
 * Uses type="number" for native stepper controls and validation.
 * Parses input to actual numbers before emitting changes.
 */

import { cn } from "@/lib/utils/cn";

interface NumberValueInputProps {
  value: number | string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: number | string) => void;
}

export function NumberValueInput({
  value,
  placeholder = "Enter number…",
  disabled,
  onChange,
}: NumberValueInputProps) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "" || raw === "-") {
          onChange(raw);
          return;
        }
        const num = parseFloat(raw);
        onChange(isNaN(num) ? raw : num);
      }}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        "h-8 px-2 rounded-md text-sm flex-1",
        "bg-[var(--surface)] border border-[var(--border)]",
        "text-[var(--foreground)]",
        "placeholder:text-[var(--gray-400)]",
        "focus-ring",
        "min-w-[120px]",
        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      )}
      aria-label="Number value"
    />
  );
}
