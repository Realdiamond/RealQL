/**
 * SQL query generator.
 *
 * Walks the recursive QueryGroup tree and produces a parameterized
 * SQL WHERE clause. Values are properly extracted to a params array
 * to prevent injection. The output is meant for display/preview —
 * not direct database execution.
 */

import type { QueryGroup, QueryRule, OperatorType } from "@/lib/types";

/**
 * Generate a full SELECT statement from a query tree.
 * The table name is derived from the schema name.
 */
export function generateSQL(root: QueryGroup, tableName: string): string {
  const params: unknown[] = [];
  const whereClause = generateSQLWhere(root, params);

  if (!whereClause) {
    return `SELECT *\nFROM ${escapeIdentifier(tableName)};`;
  }

  let result = `SELECT *\nFROM ${escapeIdentifier(tableName)}\nWHERE ${whereClause};`;
  
  if (params.length > 0) {
    const jsonLines = JSON.stringify(params, null, 2).split('\n');
    const commentedJson = jsonLines.map(line => `-- ${line}`).join('\n');
    result += `\n\n-- Parameters:\n${commentedJson}`;
  }
  
  return result;
}

/**
 * Generate just the WHERE clause portion (recursive).
 */
export function generateSQLWhere(group: QueryGroup, params: unknown[] = []): string {
  const conditions: string[] = [];

  for (const child of group.children) {
    if (child.type === "group") {
      const nested = generateSQLWhere(child, params);
      if (nested) {
        conditions.push(`(${nested})`);
      }
    } else {
      // Skip disabled rules
      if (child.disabled) continue;
      const clause = ruleToSQL(child, params);
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
function ruleToSQL(rule: QueryRule, params: unknown[]): string | null {
  if (!rule.field || !rule.operator) return null;

  const field = escapeIdentifier(rule.field);
  const op = rule.operator;

  // Null check operators don't need a value
  if (op === "is_null") return `${field} IS NULL`;
  if (op === "is_not_null") return `${field} IS NOT NULL`;

  // All other operators require a value
  if (rule.value === null || rule.value === undefined) return null;
  if (typeof rule.value === "string" && rule.value.trim() === "") return null;

  return formatSQLCondition(field, op, rule.value, params);
}

/**
 * Format a SQL condition for a specific operator and value.
 */
function formatSQLCondition(
  field: string,
  operator: OperatorType,
  value: unknown,
  params: unknown[]
): string | null {
  switch (operator) {
    case "equals":
      params.push(value);
      return `${field} = $${params.length}`;

    case "not_equals":
      params.push(value);
      return `${field} != $${params.length}`;

    case "contains":
      params.push(`%${escapeLike(value)}%`);
      return `${field} ILIKE $${params.length} ESCAPE '\\'`;

    case "not_contains":
      params.push(`%${escapeLike(value)}%`);
      return `${field} NOT ILIKE $${params.length} ESCAPE '\\'`;

    case "starts_with":
      params.push(`${escapeLike(value)}%`);
      return `${field} ILIKE $${params.length} ESCAPE '\\'`;

    case "ends_with":
      params.push(`%${escapeLike(value)}`);
      return `${field} ILIKE $${params.length} ESCAPE '\\'`;

    case "greater_than":
      params.push(value);
      return `${field} > $${params.length}`;

    case "greater_than_or_equal":
      params.push(value);
      return `${field} >= $${params.length}`;

    case "less_than":
      params.push(value);
      return `${field} < $${params.length}`;

    case "less_than_or_equal":
      params.push(value);
      return `${field} <= $${params.length}`;

    case "in_array": {
      if (!Array.isArray(value) || value.length === 0) return null;
      const placeholders = value.map((v) => {
        params.push(v);
        return `$${params.length}`;
      });
      return `${field} IN (${placeholders.join(", ")})`;
    }

    case "not_in_array": {
      if (!Array.isArray(value) || value.length === 0) return null;
      const placeholders = value.map((v) => {
        params.push(v);
        return `$${params.length}`;
      });
      return `${field} NOT IN (${placeholders.join(", ")})`;
    }

    case "between": {
      if (!Array.isArray(value) || value.length !== 2) return null;
      params.push(value[0]);
      const p1 = params.length;
      params.push(value[1]);
      const p2 = params.length;
      return `${field} BETWEEN $${p1} AND $${p2}`;
    }

    case "regex":
      // Normalize to PostgreSQL syntax (~ operator)
      params.push(value);
      return `${field} ~ $${params.length}`;

    case "before":
      params.push(value);
      return `${field} < $${params.length}`;

    case "after":
      params.push(value);
      return `${field} > $${params.length}`;

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
 * Escape special characters for SQL LIKE clauses.
 */
function escapeLike(value: unknown): string {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}
