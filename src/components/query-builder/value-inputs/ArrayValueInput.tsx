"use client";

/**
 * ArrayValueInput — comma-separated tag input for in/not_in operators.
 *
 * User types comma-separated values; we parse them into a string[].
 * Displays existing tags as removable badges.
 */

import { useState, useId } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ArrayValueInputProps {
  value: string[];
  enumValues?: string[];
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string[]) => void;
}

export function ArrayValueInput({
  value,
  enumValues,
  placeholder = "Type and press Enter…",
  disabled,
  onChange,
}: ArrayValueInputProps) {
  const [inputValue, setInputValue] = useState("");
  const datalistId = useId();

  const addValues = (raw: string) => {
    const tokens = raw.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
    let newItems = tokens.filter((s) => !value.includes(s));
    let invalidItems: string[] = [];

    if (enumValues) {
      invalidItems = newItems.filter((s) => !enumValues.includes(s));
      newItems = newItems.filter((s) => enumValues.includes(s));
    }

    if (newItems.length > 0) {
      onChange([...value, ...newItems]);
    }
    
    setInputValue(invalidItems.join(", "));
  };

  const removeItem = (item: string) => {
    onChange(value.filter((v) => v !== item));
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 flex-1",
        "h-auto min-h-[32px] px-2 py-1 rounded-md",
        "bg-[var(--surface)] border border-[var(--border)]",
        "focus-within:outline-2 focus-within:outline-[var(--ring)] focus-within:outline-offset-2",
        "min-w-[160px]"
      )}
    >
      {/* Tags */}
      {value.map((item) => (
        <span
          key={item}
          className={cn(
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium",
            "bg-[var(--accent-100)] text-[var(--accent-700)]",
            "dark:bg-[var(--accent-900)] dark:text-[var(--accent-200)]"
          )}
        >
          {item}
          {!disabled && (
            <button
              type="button"
              onClick={() => removeItem(item)}
              className="hover:text-[var(--color-error)] transition-colors"
              aria-label={`Remove ${item}`}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </span>
      ))}

      {/* Text input */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            if (inputValue.trim()) {
              addValues(inputValue);
            }
          }
          if (e.key === "Backspace" && !inputValue && value.length > 0) {
            removeItem(value[value.length - 1]);
          }
        }}
        onBlur={() => {
          if (inputValue.trim()) {
            addValues(inputValue);
          }
        }}
        placeholder={value.length === 0 ? placeholder : ""}
        disabled={disabled}
        className={cn(
          "flex-1 min-w-[80px] h-6 text-sm bg-transparent outline-none",
          "text-[var(--foreground)]",
          "placeholder:text-[var(--gray-400)]"
        )}
        aria-label="Add values"
        list={enumValues ? datalistId : undefined}
      />
      {enumValues && (
        <datalist id={datalistId}>
          {enumValues.filter((v) => !value.includes(v)).map((v) => (
            <option key={v} value={v} />
          ))}
        </datalist>
      )}
    </div>
  );
}
