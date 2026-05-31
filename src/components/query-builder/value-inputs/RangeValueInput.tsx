"use client";

/**
 * RangeValueInput — dual-field input for the "between" operator.
 *
 * Renders two inputs (min and max) separated by a label.
 * Adapts input type based on field type (number or date).
 */

import { cn } from "@/lib/utils/cn";
import type { FieldType } from "@/lib/types";

interface RangeValueInputProps {
  value: [string, string] | [number, number] | null;
  fieldType: FieldType;
  disabled?: boolean;
  onChange: (value: [string, string] | [number, number]) => void;
}

export function RangeValueInput({
  value,
  fieldType,
  disabled,
  onChange,
}: RangeValueInputProps) {
  const min = value ? String(value[0]) : "";
  const max = value ? String(value[1]) : "";
  const isDate = fieldType === "date";
  const inputType = isDate ? "date" : "number";

  const handleMinChange = (raw: string) => {
    if (isDate) {
      onChange([raw, max]);
    } else {
      const num = parseFloat(raw);
      const parsedMax = max === "" ? "" : (isNaN(parseFloat(max)) ? 0 : parseFloat(max));
      onChange([
        isNaN(num) ? (raw === "" ? "" : 0) : num,
        parsedMax,
      ] as [number, number] | [string, string]);
    }
  };

  const handleMaxChange = (raw: string) => {
    if (isDate) {
      onChange([min, raw]);
    } else {
      const num = parseFloat(raw);
      const parsedMin = min === "" ? "" : (isNaN(parseFloat(min)) ? 0 : parseFloat(min));
      onChange([
        parsedMin,
        isNaN(num) ? (raw === "" ? "" : 0) : num,
      ] as [number, number] | [string, string]);
    }
  };

  const inputClass = cn(
    "h-8 px-2 rounded-md text-sm",
    "bg-[var(--surface)] border border-[var(--border)]",
    "text-[var(--foreground)]",
    "placeholder:text-[var(--gray-400)]",
    "focus-ring",
    "min-w-[90px] flex-1",
    !isDate &&
      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
  );

  return (
    <div className="flex items-center gap-1.5 flex-1">
      <input
        type={inputType}
        value={min}
        onChange={(e) => handleMinChange(e.target.value)}
        placeholder={isDate ? "" : "Min"}
        disabled={disabled}
        className={inputClass}
        aria-label="Minimum value"
      />
      <span className="text-xs text-[var(--gray-400)] shrink-0">and</span>
      <input
        type={inputType}
        value={max}
        onChange={(e) => handleMaxChange(e.target.value)}
        placeholder={isDate ? "" : "Max"}
        disabled={disabled}
        className={inputClass}
        aria-label="Maximum value"
      />
    </div>
  );
}
