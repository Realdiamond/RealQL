/**
 * SQL query generator.
 *
 * Walks the recursive QueryGroup tree and produces a parameterized
 * SQL WHERE clause. Values are properly escaped to prevent injection.
 * The output is meant for display/preview — not direct database execution.
 */

import type { QueryGroup, QueryRule, OperatorType } from "@/lib/types";

/**
 * Generate a full SELECT statement from a query tree.
 * The table name is derived from the schema name.
 */
export function generateSQL(root: QueryGroup, tableName: string): string {
  const whereClause = generateSQLWhere(root);

  if (!whereClause || whereClause === "()") {
    return `SELECT *\nFROM ${escapeIdentifier(tableName)};`;
  }

  return `SELECT *\nFROM ${escapeIdentifier(tableName)}\nWHERE ${whereClause};`;
}

/**
 * Generate just the WHERE clause portion (recursive).
 */
export function generateSQLWhere(group: QueryGroup): string {
  const conditions: string[] = [];

  for (const child of group.children) {
    if (child.type === "group") {
      const nested = generateSQLWhere(child);
      if (nested) {
        conditions.push(`(${nested})`);
      }
    } else {
      // Skip disabled rules
      if (child.disabled) continue;
      const clause = ruleToSQL(child);
      if (clause) {
        conditions.push(clause);
      }
    }
  }

  if (conditions.length === 0) return "";

  const joiner = group.combinator === "AND" ? " AND " : " OR ";
  const result = conditions.join(joiner);

  // Apply negation if flagged
  if (group.negated) {
    return `NOT (${result})`;
  }

  return result;
}

/**
 * Convert a single rule into a SQL condition fragment.
 */
function ruleToSQL(rule: QueryRule): string | null {
  if (!rule.field || !rule.operator) return null;

  const field = escapeIdentifier(rule.field);
  const op = rule.operator;

  // Null check operators don't need a value
  if (op === "is_null") return `${field} IS NULL`;
  if (op === "is_not_null") return `${field} IS NOT NULL`;

  // All other operators require a value
  if (rule.value === null || rule.value === undefined) return null;
  if (typeof rule.value === "string" && rule.value.trim() === "") return null;

  return formatSQLCondition(field, op, rule.value);
}

/**
 * Format a SQL condition for a specific operator and value.
 */
function formatSQLCondition(
  field: string,
  operator: OperatorType,
  value: unknown
): string | null {
  switch (operator) {
    case "equals":
      return `${field} = ${escapeValue(value)}`;

    case "not_equals":
      return `${field} != ${escapeValue(value)}`;

    case "contains":
      return `${field} LIKE ${escapeValue(`%${escapeLike(value)}%`)} ESCAPE '\\'`;

    case "not_contains":
      return `${field} NOT LIKE ${escapeValue(`%${escapeLike(value)}%`)} ESCAPE '\\'`;

    case "starts_with":
      return `${field} LIKE ${escapeValue(`${escapeLike(value)}%`)} ESCAPE '\\'`;

    case "ends_with":
      return `${field} LIKE ${escapeValue(`%${escapeLike(value)}`)} ESCAPE '\\'`;

    case "greater_than":
      return `${field} > ${escapeValue(value)}`;

    case "greater_than_or_equal":
      return `${field} >= ${escapeValue(value)}`;

    case "less_than":
      return `${field} < ${escapeValue(value)}`;

    case "less_than_or_equal":
      return `${field} <= ${escapeValue(value)}`;

    case "in_array": {
      if (!Array.isArray(value) || value.length === 0) return null;
      const items = value.map((v) => escapeValue(v)).join(", ");
      return `${field} IN (${items})`;
    }

    case "not_in_array": {
      if (!Array.isArray(value) || value.length === 0) return null;
      const items = value.map((v) => escapeValue(v)).join(", ");
      return `${field} NOT IN (${items})`;
    }

    case "between": {
      if (!Array.isArray(value) || value.length !== 2) return null;
      return `${field} BETWEEN ${escapeValue(value[0])} AND ${escapeValue(value[1])}`;
    }

    case "regex":
      // Normalize to PostgreSQL syntax (~ operator)
      return `${field} ~ ${escapeValue(value)}`;

    default:
      return null;
  }
}

/**
 * Escape a SQL identifier (table/column name).
 * Uses double quotes per SQL standard.
 */
function escapeIdentifier(name: string): string {
  // Strip any existing quotes and re-wrap
  const clean = name.replace(/"/g, "");
  return `"${clean}"`;
}

/**
 * Escape a value for safe SQL embedding.
 * Numbers pass through; strings get single-quoted with inner quotes escaped.
 */
function escapeValue(value: unknown): string {
  if (typeof value === "number") {
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  }
  // String — escape single quotes by doubling them
  const str = String(value).replace(/'/g, "''");
  return `'${str}'`;
}

/**
 * Escape special characters for SQL LIKE clauses.
 */
function escapeLike(value: unknown): string {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}
