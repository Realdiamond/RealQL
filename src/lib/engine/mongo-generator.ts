/**
 * MongoDB query generator.
 *
 * Walks the recursive QueryGroup tree and produces a MongoDB
 * filter document (as a JSON string). Handles $and/$or nesting,
 * all 16 operators, and proper value typing.
 */

import type { QueryGroup, QueryRule, OperatorType } from "@/lib/types";

/**
 * Generate a MongoDB filter document from a query tree.
 * Returns a pretty-printed JSON string.
 */
export function generateMongoDB(root: QueryGroup): string {
  const filter = generateMongoFilter(root);
  return JSON.stringify(
    filter,
    (key, value) => {
      if (value instanceof RegExp) return { $regex: value.source, $options: value.flags };
      return value;
    },
    2
  );
}

/**
 * Generate the raw MongoDB filter object (recursive).
 */
export function generateMongoFilter(
  group: QueryGroup
): Record<string, unknown> {
  const conditions: Record<string, unknown>[] = [];

  for (const child of group.children) {
    if (child.type === "group") {
      const nested = generateMongoFilter(child);
      // Only add if there are actual conditions
      if (Object.keys(nested).length > 0) {
        conditions.push(nested);
      }
    } else {
      if (child.disabled) continue;
      const filter = ruleToMongoFilter(child);
      if (filter) {
        conditions.push(filter);
      }
    }
  }

  if (conditions.length === 0) return {};

  const combinator = group.combinator === "AND" ? "$and" : "$or";
  const result: Record<string, unknown> = { [combinator]: conditions };

  if (group.negated) {
    return { $nor: [result] };
  }

  // Simplify: if only one condition, unwrap the $and/$or
  if (conditions.length === 1) {
    return conditions[0];
  }

  return result;
}

/**
 * Convert a single rule into a MongoDB filter fragment.
 */
function ruleToMongoFilter(rule: QueryRule): Record<string, unknown> | null {
  if (!rule.field || !rule.operator) return null;

  const field = rule.field;
  const op = rule.operator;

  // Null check operators
  if (op === "is_null") return { [field]: { $eq: null } };
  if (op === "is_not_null") return { [field]: { $ne: null } };

  // All other operators require a value
  if (rule.value === null || rule.value === undefined) return null;
  if (typeof rule.value === "string" && rule.value.trim() === "") return null;

  return formatMongoCondition(field, op, rule.value);
}

/**
 * Format a MongoDB condition for a specific operator and value.
 */
function formatMongoCondition(
  field: string,
  operator: OperatorType,
  value: unknown
): Record<string, unknown> | null {
  switch (operator) {
    case "equals":
      return { [field]: { $eq: typedValue(value) } };

    case "not_equals":
      return { [field]: { $ne: typedValue(value) } };

    case "contains":
      return { [field]: { $regex: escapeRegex(String(value)), $options: "i" } };

    case "not_contains":
      return { [field]: { $not: new RegExp(escapeRegex(String(value)), "i") } };

    case "starts_with":
      return { [field]: { $regex: `^${escapeRegex(String(value))}`, $options: "i" } };

    case "ends_with":
      return { [field]: { $regex: `${escapeRegex(String(value))}$`, $options: "i" } };

    case "greater_than":
      return { [field]: { $gt: typedValue(value) } };

    case "greater_than_or_equal":
      return { [field]: { $gte: typedValue(value) } };

    case "less_than":
      return { [field]: { $lt: typedValue(value) } };

    case "less_than_or_equal":
      return { [field]: { $lte: typedValue(value) } };

    case "in_array": {
      if (!Array.isArray(value) || value.length === 0) return null;
      return { [field]: { $in: value.map(typedValue) } };
    }

    case "not_in_array": {
      if (!Array.isArray(value) || value.length === 0) return null;
      return { [field]: { $nin: value.map(typedValue) } };
    }

    case "between": {
      if (!Array.isArray(value) || value.length !== 2) return null;
      const gte = typedValue(value[0]);
      const lte = typedValue(value[1]);
      if (
        gte === "" || gte === null || Number.isNaN(Number(gte)) ||
        lte === "" || lte === null || Number.isNaN(Number(lte))
      ) {
        return null;
      }
      return {
        [field]: {
          $gte: gte,
          $lte: lte,
        },
      };
    }

    case "regex":
      return { [field]: { $regex: String(value) } };

    default:
      return null;
  }
}

/**
 * Coerce a string value to its typed equivalent when possible.
 * "42" → 42, "true" → true, otherwise keep as string.
 */
function typedValue(value: unknown): unknown {
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    
    // Strict numeric match: no leading zeros unless it's just "0" or "0.x"
    if (/^[+-]?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(trimmed)) {
      const num = Number(trimmed);
      if (Number.isFinite(num) && num <= Number.MAX_SAFE_INTEGER && num >= Number.MIN_SAFE_INTEGER) {
        return num;
      }
    }

    // Try boolean
    if (trimmed === "true") return true;
    if (trimmed === "false") return false;
  }
  return value;
}

/**
 * Escape special regex characters in a string for safe embedding.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
