"use client";

/**
 * ValidationMessage — inline error/warning display.
 *
 * Renders validation errors as compact messages below
 * the rule or group they apply to. Errors show in red,
 * warnings show in amber.
 */

import { AlertCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ValidationError } from "@/lib/types";

interface ValidationMessageProps {
  errors: ValidationError[];
}

export function ValidationMessage({ errors }: ValidationMessageProps) {
  if (errors.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 mt-1">
      {errors.map((error, index) => (
        <div
          key={`${error.nodeId}-${error.field}-${index}`}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium",
            error.severity === "error" &&
              "text-[var(--color-error)] bg-[var(--color-error)]/10",
            error.severity === "warning" &&
              "text-[var(--color-warning)] bg-[var(--color-warning)]/10"
          )}
          role="alert"
        >
          {error.severity === "error" ? (
            <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
          ) : (
            <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
          )}
          <span>{error.message}</span>
        </div>
      ))}
    </div>
  );
}
