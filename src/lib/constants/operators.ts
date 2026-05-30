/**
 * Operator definitions with field-type compatibility matrix.
 *
 * This is the single source of truth for which operators are valid
 * for which field types. The OperatorSelector component uses this
 * to filter the dropdown based on the selected field's type.
 */

import type { OperatorMeta, FieldType, OperatorType } from "@/lib/types";

export const OPERATORS: OperatorMeta[] = [
  {
    type: "equals",
    label: "equals",
    description: "Exact match",
    requiresValue: true,
    valueCount: "single",
    compatibleTypes: ["string", "number", "enum", "date", "boolean"],
  },
  {
    type: "not_equals",
    label: "not equals",
    description: "Does not match",
    requiresValue: true,
    valueCount: "single",
    compatibleTypes: ["string", "number", "enum", "date", "boolean"],
  },
  {
    type: "contains",
    label: "contains",
    description: "Contains substring",
    requiresValue: true,
    valueCount: "single",
    compatibleTypes: ["string"],
  },
  {
    type: "not_contains",
    label: "not contains",
    description: "Does not contain substring",
    requiresValue: true,
    valueCount: "single",
    compatibleTypes: ["string"],
  },
  {
    type: "starts_with",
    label: "starts with",
    description: "Begins with prefix",
    requiresValue: true,
    valueCount: "single",
    compatibleTypes: ["string"],
  },
  {
    type: "ends_with",
    label: "ends with",
    description: "Ends with suffix",
    requiresValue: true,
    valueCount: "single",
    compatibleTypes: ["string"],
  },
  {
    type: "greater_than",
    label: "greater than",
    description: "Strictly greater than",
    requiresValue: true,
    valueCount: "single",
    compatibleTypes: ["number", "date"],
  },
  {
    type: "greater_than_or_equal",
    label: "greater than or equal",
    description: "Greater than or equal to",
    requiresValue: true,
    valueCount: "single",
    compatibleTypes: ["number", "date"],
  },
  {
    type: "less_than",
    label: "less than",
    description: "Strictly less than",
    requiresValue: true,
    valueCount: "single",
    compatibleTypes: ["number", "date"],
  },
  {
    type: "less_than_or_equal",
    label: "less than or equal",
    description: "Less than or equal to",
    requiresValue: true,
    valueCount: "single",
    compatibleTypes: ["number", "date"],
  },
  {
    type: "in_array",
    label: "in",
    description: "Matches any value in list",
    requiresValue: true,
    valueCount: "array",
    compatibleTypes: ["string", "number", "enum"],
  },
  {
    type: "not_in_array",
    label: "not in",
    description: "Does not match any value in list",
    requiresValue: true,
    valueCount: "array",
    compatibleTypes: ["string", "number", "enum"],
  },
  {
    type: "between",
    label: "between",
    description: "Within range (inclusive)",
    requiresValue: true,
    valueCount: "dual",
    compatibleTypes: ["number", "date"],
  },
  {
    type: "is_null",
    label: "is empty",
    description: "Value is null or empty",
    requiresValue: false,
    valueCount: "none",
    compatibleTypes: ["string", "number", "enum", "date", "boolean"],
  },
  {
    type: "is_not_null",
    label: "is not empty",
    description: "Value exists",
    requiresValue: false,
    valueCount: "none",
    compatibleTypes: ["string", "number", "enum", "date", "boolean"],
  },
  {
    type: "regex",
    label: "matches pattern",
    description: "Matches regular expression",
    requiresValue: true,
    valueCount: "single",
    compatibleTypes: ["string"],
  },
];

/**
 * Get operators compatible with a given field type.
 */
export function getOperatorsForFieldType(fieldType: FieldType): OperatorMeta[] {
  return OPERATORS.filter((op) => op.compatibleTypes.includes(fieldType));
}

/**
 * Look up operator metadata by type.
 */
export function getOperatorMeta(
  operatorType: OperatorType
): OperatorMeta | undefined {
  return OPERATORS.find((op) => op.type === operatorType);
}

/**
 * Check if an operator is valid for a given field type.
 */
export function isOperatorValidForType(
  operatorType: OperatorType,
  fieldType: FieldType
): boolean {
  const meta = getOperatorMeta(operatorType);
  return meta ? meta.compatibleTypes.includes(fieldType) : false;
}
