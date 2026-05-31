/**
 * Query Execution Engine — recursive dataset filter.
 *
 * Takes a QueryGroup tree and a dataset (array of plain objects),
 * then recursively evaluates every record against the tree.
 * Returns an ExecutionResult with matched data, counts, and timing.
 *
 * This is a pure, side-effect-free function — no network calls,
 * no persistence. It operates entirely on the in-memory mock data.
 */

import type { QueryGroup, QueryRule, ExecutionResult } from "@/lib/types";

type Row = Record<string, unknown>;

/**
 * Execute a query tree against a dataset.
 * Returns matched rows plus metadata (counts, timing).
 */
export function executeQuery(
  root: QueryGroup,
  dataset: Row[]
): ExecutionResult {
  const start = performance.now();
  const matched = dataset.filter((row) => evaluateGroup(root, row));
  const elapsed = performance.now() - start;

  return {
    data: matched,
    totalCount: dataset.length,
    matchedCount: matched.length,
    executionTimeMs: Math.round(elapsed * 100) / 100,
  };
}

/**
 * Evaluate a group node against a single row.
 * Recursively processes children using the group's combinator.
 */
function evaluateGroup(group: QueryGroup, row: Row): boolean {
  let combined = false;

  if (group.children.length > 0) {
    const results = group.children.map((child) => {
      if (child.type === "group") {
        return evaluateGroup(child, row);
      }
      return evaluateRule(child, row);
    });

    combined =
      group.combinator === "AND"
        ? results.every(Boolean)
        : results.some(Boolean);
  }

  return group.negated ? !combined : combined;
}

/**
 * Evaluate a single rule against a row.
 * Disabled rules always pass (they don't filter anything out).
 */
function evaluateRule(rule: QueryRule, row: Row): boolean {
  // Disabled rules are treated as "always true" — they don't filter
  if (rule.disabled) return true;

  // Rules with no field selected can't match — skip gracefully
  if (!rule.field) return true;

  const fieldValue = row[rule.field];

  return applyOperator(rule.operator, fieldValue, rule.value);
}

/**
 * Apply an operator comparison between a field value and a rule value.
 * Handles type coercion so string-based rule values work against
 * numeric or boolean dataset fields.
 */
function applyOperator(
  operator: string,
  fieldValue: unknown,
  ruleValue: unknown
): boolean {
  switch (operator) {
    case "equals":
      return looseEquals(fieldValue, ruleValue);

    case "not_equals":
      return !looseEquals(fieldValue, ruleValue);

    case "contains": {
      const fStr = toString(fieldValue);
      const rStr = toString(ruleValue);
      if (rStr === "") return true;
      return fStr.toLowerCase().includes(rStr.toLowerCase());
    }

    case "not_contains": {
      const fStr = toString(fieldValue);
      const rStr = toString(ruleValue);
      if (rStr === "") return true;
      return !fStr.toLowerCase().includes(rStr.toLowerCase());
    }

    case "starts_with": {
      const fStr = toString(fieldValue);
      const rStr = toString(ruleValue);
      if (rStr === "") return true;
      return fStr.toLowerCase().startsWith(rStr.toLowerCase());
    }

    case "ends_with": {
      const fStr = toString(fieldValue);
      const rStr = toString(ruleValue);
      if (rStr === "") return true;
      return fStr.toLowerCase().endsWith(rStr.toLowerCase());
    }

    case "greater_than":
      return compareNumericOrDate(fieldValue, ruleValue) > 0;

    case "greater_than_or_equal":
      return compareNumericOrDate(fieldValue, ruleValue) >= 0;

    case "less_than":
      return compareNumericOrDate(fieldValue, ruleValue) < 0;

    case "less_than_or_equal":
      return compareNumericOrDate(fieldValue, ruleValue) <= 0;

    case "in_array": {
      if (!Array.isArray(ruleValue)) return false;
      return ruleValue.some((v) => looseEquals(fieldValue, v));
    }

    case "not_in_array": {
      if (!Array.isArray(ruleValue)) return true;
      return !ruleValue.some((v) => looseEquals(fieldValue, v));
    }

    case "between": {
      if (!Array.isArray(ruleValue) || ruleValue.length !== 2) return false;
      const [min, max] = ruleValue;
      const lower = compareNumericOrDate(fieldValue, min);
      const upper = compareNumericOrDate(fieldValue, max);
      // field >= min AND field <= max
      return lower >= 0 && upper <= 0;
    }

    case "is_null":
      return fieldValue === null || fieldValue === undefined || fieldValue === "";

    case "is_not_null":
      return fieldValue !== null && fieldValue !== undefined && fieldValue !== "";

    case "regex": {
      if (typeof ruleValue !== "string" || ruleValue === "") return true;
      try {
        const re = new RegExp(ruleValue, "i");
        return re.test(toString(fieldValue));
      } catch {
        // Invalid regex pattern — don't crash, just skip
        return true;
      }
    }

    default:
      return true;
  }
}

// ── Helpers ──────────────────────────────────────────────────────

/**
 * Loose equality that handles type coercion between strings and numbers/booleans.
 * "42" should equal 42, "true" should equal true.
 */
function looseEquals(fieldValue: unknown, ruleValue: unknown): boolean {
  // Exact match
  if (fieldValue === ruleValue) return true;

  // String comparison (case-insensitive)
  const fStr = toString(fieldValue);
  const rStr = toString(ruleValue);
  if (fStr.toLowerCase() === rStr.toLowerCase()) return true;

  // Numeric comparison
  const fNum = toNumber(fieldValue);
  const rNum = toNumber(ruleValue);
  if (fNum !== null && rNum !== null && fNum === rNum) return true;

  return false;
}

/**
 * Compare two values numerically or as date strings.
 * Returns:  positive if field > rule,  0 if equal,  negative if field < rule.
 */
function compareNumericOrDate(
  fieldValue: unknown,
  ruleValue: unknown
): number {
  // Try numeric first
  const fNum = toNumber(fieldValue);
  const rNum = toNumber(ruleValue);
  if (fNum !== null && rNum !== null) {
    return fNum - rNum;
  }

  // Fall back to string comparison (works for ISO date strings)
  const fStr = toString(fieldValue);
  const rStr = toString(ruleValue);
  return fStr.localeCompare(rStr);
}

/** Safely convert to string */
function toString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

/** Safely convert to number, returning null if not numeric */
function toNumber(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const num = Number(value);
    if (!Number.isNaN(num)) return num;
  }
  return null;
}
