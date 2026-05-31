"use client";

/**
 * useQueryValidation — debounced query validation hook.
 *
 * Runs the validation engine against the current query tree
 * with a short debounce to avoid excessive re-validation
 * on every keystroke. Returns the current list of errors.
 */

import { useState, useEffect, useRef } from "react";
import { validateQuery } from "@/lib/engine/query-validator";
import type { QueryGroup, ValidationError, SchemaField } from "@/lib/types";

const DEBOUNCE_MS = 300;

export function useQueryValidation(
  rootGroup: QueryGroup,
  fields: SchemaField[]
): ValidationError[] {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce validation
    timeoutRef.current = setTimeout(() => {
      const result = validateQuery(rootGroup, fields);
      setErrors(result);
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [rootGroup, fields]);

  return errors;
}
