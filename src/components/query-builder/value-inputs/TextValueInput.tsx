"use client";

/**
 * TextValueInput — standard text input for string fields.
 */

import { cn } from "@/lib/utils/cn";

interface TextValueInputProps {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function TextValueInput({
  value,
  placeholder = "Enter text…",
  disabled,
  onChange,
}: TextValueInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        "h-8 px-2 rounded-md text-sm flex-1",
        "bg-[var(--surface)] border border-[var(--border)]",
        "text-[var(--foreground)]",
        "placeholder:text-[var(--gray-400)]",
        "focus-ring",
        "min-w-[120px]"
      )}
      aria-label="Text value"
    />
  );
}
