"use client";

/**
 * DateValueInput — date picker for date fields.
 *
 * Uses type="date" for native calendar widget.
 * Stores value as ISO date string (YYYY-MM-DD).
 */

import { cn } from "@/lib/utils/cn";

interface DateValueInputProps {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function DateValueInput({
  value,
  disabled,
  onChange,
}: DateValueInputProps) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        "h-8 px-2 rounded-md text-sm flex-1",
        "bg-[var(--surface)] border border-[var(--border)]",
        "text-[var(--foreground)]",
        "focus-ring",
        "min-w-[140px]"
      )}
      aria-label="Date value"
    />
  );
}
