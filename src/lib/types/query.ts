/**
 * Core query tree type definitions.
 *
 * The query is modeled as a recursive tree where each node is either
 * a QueryGroup (container with AND/OR combinator) or a QueryRule
 * (leaf with field/operator/value).
 */

export type QueryNode = QueryGroup | QueryRule;

export interface QueryGroup {
  id: string;
  type: "group";
  combinator: "AND" | "OR";
  children: QueryNode[];
  collapsed: boolean;
  negated?: boolean;
}

export interface QueryRule {
  id: string;
  type: "rule";
  field: string;
  operator: OperatorType;
  value: RuleValue;
  disabled?: boolean;
}

export type OperatorType =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "greater_than"
  | "greater_than_or_equal"
  | "less_than"
  | "less_than_or_equal"
  | "in_array"
  | "not_in_array"
  | "between"
  | "is_null"
  | "is_not_null"
  | "regex";

export type RuleValue =
  | string
  | number
  | boolean
  | string[]
  | [string, string]
  | [number, number]
  | null;

export interface ValidationError {
  nodeId: string;
  field: string;
  message: string;
  severity: "error" | "warning";
}

export type QueryOutputFormat = "sql" | "mongodb" | "graphql";

export interface QueryOutput {
  format: QueryOutputFormat;
  query: string;
  isValid: boolean;
  errors: ValidationError[];
}

export interface QueryHistoryEntry {
  id: string;
  name: string;
  query: QueryGroup;
  schemaId: string;
  timestamp: number;
  resultCount?: number;
}

export interface QueryPreset {
  id: string;
  name: string;
  description: string;
  query: QueryGroup;
  schemaId: string;
  createdAt: number;
}
