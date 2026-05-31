/**
 * GraphQL query generator.
 *
 * Walks the recursive QueryGroup tree and produces a Hasura-style
 * GraphQL query with nested _and/_or filter arguments. The output
 * uses proper indentation for readability.
 */

import type { QueryGroup, QueryRule, OperatorType } from "@/lib/types";

/**
 * Generate a full GraphQL query string from a query tree.
 * Uses Hasura-style where clause syntax.
 */
export function generateGraphQL(
  root: QueryGroup,
  tableName: string
): string {
  const whereClause = generateGraphQLWhere(root);

  if (!whereClause) {
    return `query {\n  ${tableName} {\n    id\n  }\n}`;
  }

  // Format the where clause with proper indentation
  const indented = indentGraphQL(whereClause, 4);

  return `query {\n  ${tableName}(\n    where: ${indented}\n  ) {\n    id\n  }\n}`;
}

/**
 * Generate the where clause object as a formatted string (recursive).
 */
export function generateGraphQLWhere(group: QueryGroup): string | null {
  const conditions: string[] = [];

  for (const child of group.children) {
    if (child.type === "group") {
      const nested = generateGraphQLWhere(child);
      if (nested) {
        conditions.push(nested);
      }
    } else {
      if (child.disabled) continue;
      const filter = ruleToGraphQL(child);
      if (filter) {
        conditions.push(filter);
      }
    }
  }

  if (conditions.length === 0) return null;

  const combinator = group.combinator === "AND" ? "_and" : "_or";
  const inner = conditions.join(", ");

  if (group.negated) {
    return `{ _not: { ${combinator}: [${inner}] } }`;
  }

  // Simplify: if only one condition, unwrap
  if (conditions.length === 1) {
    return conditions[0];
  }

  return `{ ${combinator}: [${inner}] }`;
}

/**
 * Convert a single rule into a GraphQL filter fragment.
 */
function ruleToGraphQL(rule: QueryRule): string | null {
  if (!rule.field || !rule.operator) return null;

  const field = rule.field;
  const op = rule.operator;

  // Null check operators
  if (op === "is_null") return `{ ${field}: { _is_null: true } }`;
  if (op === "is_not_null") return `{ ${field}: { _is_null: false } }`;

  // All other operators require a value
  if (rule.value === null || rule.value === undefined) return null;
  if (typeof rule.value === "string" && rule.value.trim() === "") return null;

  return formatGraphQLCondition(field, op, rule.value);
}

/**
 * Format a GraphQL condition for a specific operator and value.
 */
function formatGraphQLCondition(
  field: string,
  operator: OperatorType,
  value: unknown
): string | null {
  switch (operator) {
    case "equals":
      return `{ ${field}: { _eq: ${formatGQLValue(value)} } }`;

    case "not_equals":
      return `{ ${field}: { _neq: ${formatGQLValue(value)} } }`;

    case "contains":
      return `{ ${field}: { _ilike: ${formatGQLValue(`%${value}%`)} } }`;

    case "not_contains":
      return `{ ${field}: { _nilike: ${formatGQLValue(`%${value}%`)} } }`;

    case "starts_with":
      return `{ ${field}: { _ilike: ${formatGQLValue(`${value}%`)} } }`;

    case "ends_with":
      return `{ ${field}: { _ilike: ${formatGQLValue(`%${value}`)} } }`;

    case "greater_than":
      return `{ ${field}: { _gt: ${formatGQLValue(value)} } }`;

    case "greater_than_or_equal":
      return `{ ${field}: { _gte: ${formatGQLValue(value)} } }`;

    case "less_than":
      return `{ ${field}: { _lt: ${formatGQLValue(value)} } }`;

    case "less_than_or_equal":
      return `{ ${field}: { _lte: ${formatGQLValue(value)} } }`;

    case "in_array": {
      if (!Array.isArray(value) || value.length === 0) return null;
      const items = value.map((v) => formatGQLValue(v)).join(", ");
      return `{ ${field}: { _in: [${items}] } }`;
    }

    case "not_in_array": {
      if (!Array.isArray(value) || value.length === 0) return null;
      const items = value.map((v) => formatGQLValue(v)).join(", ");
      return `{ ${field}: { _nin: [${items}] } }`;
    }

    case "between": {
      if (!Array.isArray(value) || value.length !== 2) return null;
      return `{ _and: [{ ${field}: { _gte: ${formatGQLValue(value[0])} } }, { ${field}: { _lte: ${formatGQLValue(value[1])} } }] }`;
    }

    case "regex":
      return `{ ${field}: { _regex: ${formatGQLValue(value)} } }`;

    default:
      return null;
  }
}

/**
 * Format a value for GraphQL embedding.
 * Numbers and booleans pass through; strings get double-quoted.
 */
function formatGQLValue(value: unknown): string {
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  // String — use JSON.stringify for proper escaping
  return JSON.stringify(String(value));
}

/**
 * Add consistent indentation to a GraphQL string.
 */
function indentGraphQL(str: string, spaces: number): string {
  const indent = " ".repeat(spaces);
  return str
    .split("\n")
    .map((line, i) => (i === 0 ? line : indent + line))
    .join("\n");
}
