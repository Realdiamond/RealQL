import type { QueryGroup, QueryRule } from "@/lib/types";
import { getSchema, type SchemaId } from "@/lib/schemas/registry";

/**
 * Generates a human-readable explanation of the query tree.
 * E.g., "Find all users where name equals 'John' and age is greater than 18"
 */
export function generateHumanLanguage(
  root: QueryGroup,
  schemaId: string
): string {
  const schema = getSchema(schemaId as SchemaId);
  const target = schema ? schema.name : "records";

  const conditions = generateGroupLanguage(root);

  if (!conditions) {
    return `Find all ${target}.`;
  }

  return `Find all ${target} where ${conditions}.`;
}

function generateGroupLanguage(group: QueryGroup): string {
  if (!group || !group.children || group.children.length === 0) return "";

  const clauses: string[] = [];

  for (const child of group.children) {
    if (child.type === "rule" && child.disabled) continue;

    if (child.type === "group") {
      const nested = generateGroupLanguage(child);
      if (nested) {
        clauses.push(`(${nested})`);
      }
    } else {
      const ruleLang = generateRuleLanguage(child);
      if (ruleLang) {
        clauses.push(ruleLang);
      }
    }
  }

  if (clauses.length === 0) return "";

  const joiner = group.combinator === "AND" ? " and " : " or ";
  let result = clauses.join(joiner);

  if (group.negated) {
    result = `it is not true that ${result}`;
  }

  return result;
}

function generateRuleLanguage(rule: QueryRule): string | null {
  if (!rule.field || !rule.operator) return null;

  const field = rule.field;

  if (rule.operator === "is_null") return `${field} is empty`;
  if (rule.operator === "is_not_null") return `${field} is not empty`;

  if (rule.value === null || rule.value === undefined) return null;
  if (typeof rule.value === "string" && rule.value.trim() === "") return null;

  const valStr = Array.isArray(rule.value)
    ? rule.value.map(v => `'${v}'`).join(" and ")
    : `'${rule.value}'`;

  switch (rule.operator) {
    case "equals":
      return `${field} is ${valStr}`;
    case "not_equals":
      return `${field} is not ${valStr}`;
    case "contains":
      return `${field} contains ${valStr}`;
    case "not_contains":
      return `${field} does not contain ${valStr}`;
    case "starts_with":
      return `${field} starts with ${valStr}`;
    case "ends_with":
      return `${field} ends with ${valStr}`;
    case "greater_than":
    case "after":
      return `${field} is greater than ${valStr}`;
    case "less_than":
    case "before":
      return `${field} is less than ${valStr}`;
    case "greater_than_or_equal":
      return `${field} is greater than or equal to ${valStr}`;
    case "less_than_or_equal":
      return `${field} is less than or equal to ${valStr}`;
    case "in_array":
      return `${field} is one of [${valStr.replace(/ and /g, ", ")}]`;
    case "not_in_array":
      return `${field} is not one of [${valStr.replace(/ and /g, ", ")}]`;
    case "between":
      return `${field} is between ${valStr}`;
    case "regex":
      return `${field} matches regex ${valStr}`;
    default:
      return `${field} ${rule.operator} ${valStr}`;
  }
}
