/**
 * Recursive query validation engine.
 *
 * Walks the query tree and checks every node against 10 validation
 * rules. Returns a flat list of ValidationError objects that the UI
 * can map to inline error messages and red highlights.
 *
 * Rules:
 *  1. Empty field → "Select a field"
 *  2. Empty operator → "Select an operator"
 *  3. Empty value → "Enter a value" (skip for is_null/is_not_null)
 *  4. Invalid operator for type → "'X' is not valid for Y fields"
 *  5. Invalid value type → "Expected a number"
 *  6. Empty group → "Group must have at least one condition"
 *  7. Invalid between range → "Max must be greater than min"
 *  8. Invalid regex → "Invalid regular expression pattern"
 *  9. Invalid date → "Invalid date format"
 * 10. Depth warning → "Nesting exceeds 5 levels"
 */

import type {
  QueryGroup,
  QueryRule,
  ValidationError,
} from "@/lib/types";
import type { SchemaField } from "@/lib/types";
import { getOperatorMeta, isOperatorValidForType } from "@/lib/constants/operators";

const MAX_RECOMMENDED_DEPTH = 5;

/**
 * Validate the entire query tree recursively.
 * Returns a flat array of validation errors/warnings.
 */
export function validateQuery(
  root: QueryGroup,
  fields: SchemaField[],
  depth = 0
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Rule 10: Depth warning (non-blocking)
  if (depth >= MAX_RECOMMENDED_DEPTH) {
    errors.push({
      nodeId: root.id,
      field: "depth",
      message: `Nesting exceeds ${MAX_RECOMMENDED_DEPTH} levels`,
      severity: "warning",
    });
  }

  // Rule 6: Empty group
  if (root.children.length === 0) {
    errors.push({
      nodeId: root.id,
      field: "children",
      message: "Group must have at least one condition",
      severity: "error",
    });
  }

  // Validate each child
  for (const child of root.children) {
    if (child.type === "group") {
      errors.push(...validateQuery(child, fields, depth + 1));
    } else {
      errors.push(...validateRule(child, fields));
    }
  }

  return errors;
}

/**
 * Validate a single query rule against all applicable rules.
 */
export function validateRule(
  rule: QueryRule,
  fields: SchemaField[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Rule 11 (implicit): Skip validation for disabled rules
  if (rule.disabled) {
    return errors;
  }

  const operatorMeta = getOperatorMeta(rule.operator);

  // Rule 1: Empty field
  if (!rule.field) {
    errors.push({
      nodeId: rule.id,
      field: "field",
      message: "Select a field",
      severity: "error",
    });
    // Can't validate further without a field
    return errors;
  }

  // Resolve field metadata
  const schemaField = fields.find((f) => f.name === rule.field);

  // Rule 2: Empty operator (shouldn't happen with dropdowns, but safety net)
  if (!rule.operator) {
    errors.push({
      nodeId: rule.id,
      field: "operator",
      message: "Select an operator",
      severity: "error",
    });
    return errors;
  }

  // Rule 4: Invalid operator for field type
  if (schemaField && !isOperatorValidForType(rule.operator, schemaField.type)) {
    errors.push({
      nodeId: rule.id,
      field: "operator",
      message: `'${operatorMeta?.label ?? rule.operator}' is not valid for ${schemaField.type} fields`,
      severity: "error",
    });
    return errors;
  }

  // Skip value validation for operators that don't require one
  if (operatorMeta && !operatorMeta.requiresValue) {
    return errors;
  }

  // Rule 3: Empty value
  if (isValueEmpty(rule.value)) {
    errors.push({
      nodeId: rule.id,
      field: "value",
      message: "Enter a value",
      severity: "error",
    });
    return errors;
  }

  // Type-specific validations (only if we have schema info)
  if (schemaField) {
    let numericArrayInvalid = false;
    // Rule 5: Invalid value type — number field with non-numeric value
    if (schemaField.type === "number") {
      if (operatorMeta?.valueCount === "single") {
        if (rule.value !== "" && rule.value !== null && rule.value !== undefined && Number.isNaN(Number(rule.value))) {
          errors.push({
            nodeId: rule.id,
            field: "value",
            message: "Expected a number",
            severity: "error",
          });
        }
      } else if (operatorMeta?.valueCount === "array" && Array.isArray(rule.value)) {
        if (rule.value.some(v => {
          if (v === null || v === undefined) return false;
          const s = String(v).trim();
          if (s === "") return true; // Treat empty/whitespace strings as invalid numbers
          return Number.isNaN(Number(s));
        })) {
          numericArrayInvalid = true;
          errors.push({
            nodeId: rule.id,
            field: "value",
            message: "Expected all values to be numbers",
            severity: "error",
          });
        }
      }
    }

    // Rule 9: Invalid date format
    if (schemaField.type === "date" && operatorMeta?.valueCount === "single") {
      if (typeof rule.value === "string" && rule.value !== "" && !isValidDate(rule.value)) {
        errors.push({
          nodeId: rule.id,
          field: "value",
          message: "Invalid date format",
          severity: "error",
        });
      }
    }

    // Rule 7: Invalid between range
    if (rule.operator === "between" && Array.isArray(rule.value) && rule.value.length === 2) {
      const [min, max] = rule.value;
      if (schemaField.type === "number") {
        if (!numericArrayInvalid) {
          const minNum = Number(min);
          const maxNum = Number(max);
          if (maxNum <= minNum) {
            errors.push({
              nodeId: rule.id,
              field: "value",
              message: "Max must be greater than min",
              severity: "error",
            });
          }
        }
      } else if (schemaField.type === "date") {
        if (typeof min === "string" && typeof max === "string" && min !== "" && max !== "") {
          const minValid = isValidDate(min);
          const maxValid = isValidDate(max);
          if (!minValid || !maxValid) {
            errors.push({
              nodeId: rule.id,
              field: "value",
              message: "Invalid date format",
              severity: "error",
            });
          } else if (max <= min) {
            errors.push({
              nodeId: rule.id,
              field: "value",
              message: "Max must be greater than min",
              severity: "error",
            });
          }
        }
      }
    }
  }

  // Rule 8: Invalid regex pattern
  if (rule.operator === "regex" && typeof rule.value === "string" && rule.value !== "") {
    if (!isValidRegex(rule.value)) {
      errors.push({
        nodeId: rule.id,
        field: "value",
        message: "Invalid regular expression pattern",
        severity: "error",
      });
    }
  }

  return errors;
}

/**
 * Check if a value is considered "empty" for validation.
 */
function isValueEmpty(value: QueryRule["value"]): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

/**
 * Validate a date string (YYYY-MM-DD format).
 */
function isValidDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
}

/**
 * Validate a regex pattern string.
 */
function isValidRegex(pattern: string): boolean {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get errors for a specific node by ID.
 */
export function getErrorsForNode(
  errors: ValidationError[],
  nodeId: string
): ValidationError[] {
  return errors.filter((e) => e.nodeId === nodeId);
}

/**
 * Check if the query tree has any blocking errors (not warnings).
 */
export function hasBlockingErrors(errors: ValidationError[]): boolean {
  return errors.some((e) => e.severity === "error");
}

/**
 * Get error for a specific field within a node.
 */
export function getFieldError(
  errors: ValidationError[],
  nodeId: string,
  field: string
): ValidationError | undefined {
  return errors.find((e) => e.nodeId === nodeId && e.field === field);
}
