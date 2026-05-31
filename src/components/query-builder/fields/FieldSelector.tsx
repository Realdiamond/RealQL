"use client";

/**
 * FieldSelector — schema-driven field picker.
 *
 * Populates options from the active schema's fields.
 * When the user changes the field, we auto-reset the operator
 * and value to safe defaults for the new field type.
 */

import { cn } from "@/lib/utils/cn";
import type { SchemaField } from "@/lib/types";

interface FieldSelectorProps {
  value: string;
  fields: SchemaField[];
  disabled?: boolean;
  onChange: (fieldName: string, fieldType: SchemaField["type"]) => void;
}

export function FieldSelector({
  value,
  fields,
  disabled,
  onChange,
}: FieldSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => {
        const selected = fields.find((f) => f.name === e.target.value);
        if (selected) {
          onChange(selected.name, selected.type);
        }
      }}
      disabled={disabled}
      className={cn(
        "h-8 px-2 rounded-md text-sm",
        "bg-[var(--surface)] border border-[var(--border)]",
        "text-[var(--foreground)]",
        "focus-ring",
        "min-w-[140px]",
        !value && "text-[var(--gray-400)]"
      )}
      aria-label="Select field"
    >
      <option value="" disabled>
        Select field…
      </option>
      {fields.map((field) => (
        <option key={field.name} value={field.name}>
          {field.label}
        </option>
      ))}
    </select>
  );
}
