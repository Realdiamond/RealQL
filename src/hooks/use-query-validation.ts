"use client";

/**
 * useQueryValidation — debounced query validation hook.
 *
 * Runs the validation engine against the current query tree
 * with a short debounce to avoid excessive re-validation
 * on every keystroke. Returns the current list of errors.
 */

import { useMemo } from "react";
import { validateQuery } from "@/lib/engine/query-validator";
import { useDebounce } from "@/hooks/use-debounce";
import type { QueryGroup, ValidationError, SchemaField } from "@/lib/types";

const DEBOUNCE_MS = 300;

export function useQueryValidation(
  rootGroup: QueryGroup,
  fields: SchemaField[]
): ValidationError[] {
  // Debounce the entire rootGroup state to prevent excessive validation on every keystroke
  const debouncedGroup = useDebounce(rootGroup, DEBOUNCE_MS);

  // Derived state: strictly compute errors from the debounced state
  const errors = useMemo(() => {
    return validateQuery(debouncedGroup, fields);
  }, [debouncedGroup, fields]);

  return errors;
}
