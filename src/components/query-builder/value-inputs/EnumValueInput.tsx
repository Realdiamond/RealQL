"use client";

/**
 * EnumValueInput — dropdown for enum fields.
 *
 * Shows the schema-defined enumValues as selectable options.
 */

import { cn } from "@/lib/utils/cn";

interface EnumValueInputProps {
  value: string;
  enumValues: string[];
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function EnumValueInput({
  value,
  enumValues,
  disabled,
  onChange,
}: EnumValueInputProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        "h-8 px-2 rounded-md text-sm flex-1",
        "bg-[var(--surface)] border border-[var(--border)]",
        "text-[var(--foreground)]",
        "focus-ring",
        "min-w-[120px]",
        !value && "text-[var(--gray-400)]"
      )}
      aria-label="Select value"
    >
      <option value="" disabled>
        Select value…
      </option>
      {enumValues.map((v) => (
        <option key={v} value={v}>
          {v}
        </option>
      ))}
    </select>
  );
}
