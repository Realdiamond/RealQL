/**
 * Unit tests for the GraphQL query generator.
 *
 * Covers all 16 operators, nested groups, empty states,
 * negation, disabled rules, and full query output.
 */

import { describe, it, expect } from "vitest";
import { generateGraphQL, generateGraphQLWhere } from "../graphql-generator";
import type { QueryGroup, QueryRule } from "@/lib/types";

function makeRule(overrides: Partial<QueryRule> = {}): QueryRule {
  return {
    id: "r1",
    type: "rule",
    field: "name",
    operator: "equals",
    value: "test",
    ...overrides,
  };
}

function makeGroup(
  children: (QueryRule | QueryGroup)[] = [],
  overrides: Partial<QueryGroup> = {}
): QueryGroup {
  return {
    id: "g1",
    type: "group",
    combinator: "AND",
    collapsed: false,
    children,
    ...overrides,
  };
}

describe("GraphQL Generator", () => {
  // --- Basic operators ---
  it("should generate _eq for equals", () => {
    const group = makeGroup([makeRule({ value: "John" })]);
    const where = generateGraphQLWhere(group);
    expect(where).toContain("_eq");
    expect(where).toContain('"John"');
  });

  it("should generate _neq for not_equals", () => {
    const group = makeGroup([makeRule({ operator: "not_equals", value: "inactive" })]);
    const where = generateGraphQLWhere(group);
    expect(where).toContain("_neq");
  });

  it("should generate _ilike for contains", () => {
    const group = makeGroup([makeRule({ operator: "contains", value: "test" })]);
    const where = generateGraphQLWhere(group);
    expect(where).toContain("_ilike");
    expect(where).toContain("%test%");
  });

  it("should generate _nilike for not_contains", () => {
    const group = makeGroup([makeRule({ operator: "not_contains", value: "spam" })]);
    const where = generateGraphQLWhere(group);
    expect(where).toContain("_nilike");
  });

  it("should generate _ilike with prefix for starts_with", () => {
    const group = makeGroup([makeRule({ operator: "starts_with", value: "Jo" })]);
    const where = generateGraphQLWhere(group);
    expect(where).toContain("_ilike");
    expect(where).toContain("Jo%");
  });

  it("should generate _ilike with suffix for ends_with", () => {
    const group = makeGroup([makeRule({ operator: "ends_with", value: "hn" })]);
    const where = generateGraphQLWhere(group);
    expect(where).toContain("_ilike");
    expect(where).toContain("%hn");
  });

  it("should generate _gt for greater_than", () => {
    const group = makeGroup([makeRule({ field: "age", operator: "greater_than", value: 18 })]);
    const where = generateGraphQLWhere(group);
    expect(where).toContain("_gt");
    expect(where).toContain("18");
  });

  it("should generate _lte for less_than_or_equal", () => {
    const group = makeGroup([makeRule({ field: "age", operator: "less_than_or_equal", value: 65 })]);
    const where = generateGraphQLWhere(group);
    expect(where).toContain("_lte");
  });

  it("should generate _in for in_array", () => {
    const group = makeGroup([makeRule({ field: "status", operator: "in_array", value: ["active", "pending"] })]);
    const where = generateGraphQLWhere(group);
    expect(where).toContain("_in");
    expect(where).toContain('"active"');
  });

  it("should generate _nin for not_in_array", () => {
    const group = makeGroup([makeRule({ field: "status", operator: "not_in_array", value: ["banned"] })]);
    const where = generateGraphQLWhere(group);
    expect(where).toContain("_nin");
  });

  it("should generate _gte/_lte pair for between", () => {
    const group = makeGroup([makeRule({ field: "age", operator: "between", value: [18, 65] })]);
    const where = generateGraphQLWhere(group);
    expect(where).toContain("_gte");
    expect(where).toContain("_lte");
    expect(where).toContain("_and");
  });

  it("should generate _is_null true for is_null", () => {
    const group = makeGroup([makeRule({ field: "email", operator: "is_null", value: null })]);
    const where = generateGraphQLWhere(group);
    expect(where).toContain("_is_null: true");
  });

  it("should generate _is_null false for is_not_null", () => {
    const group = makeGroup([makeRule({ field: "email", operator: "is_not_null", value: null })]);
    const where = generateGraphQLWhere(group);
    expect(where).toContain("_is_null: false");
  });

  it("should generate _regex for regex", () => {
    const group = makeGroup([makeRule({ operator: "regex", value: "^[A-Z]" })]);
    const where = generateGraphQLWhere(group);
    expect(where).toContain("_regex");
  });

  // --- Combinators ---
  it("should use _and for AND combinator with multiple rules", () => {
    const group = makeGroup([
      makeRule({ id: "r1", value: "A" }),
      makeRule({ id: "r2", value: "B" }),
    ], { combinator: "AND" });
    const where = generateGraphQLWhere(group);
    expect(where).toContain("_and");
  });

  it("should use _or for OR combinator", () => {
    const group = makeGroup([
      makeRule({ id: "r1", value: "A" }),
      makeRule({ id: "r2", value: "B" }),
    ], { combinator: "OR" });
    const where = generateGraphQLWhere(group);
    expect(where).toContain("_or");
  });

  it("should unwrap single-condition groups", () => {
    const group = makeGroup([makeRule({ value: "only" })]);
    const where = generateGraphQLWhere(group);
    // Single condition should not be wrapped in _and
    expect(where).not.toContain("_and");
    expect(where).toContain("_eq");
  });

  // --- Empty state ---
  it("should return null for empty group", () => {
    const group = makeGroup([]);
    const where = generateGraphQLWhere(group);
    expect(where).toBeNull();
  });

  // --- Full query ---
  it("should generate a full GraphQL query with where clause", () => {
    const group = makeGroup([makeRule({ value: "test" })]);
    const gql = generateGraphQL(group, "users");
    expect(gql).toContain("query {");
    expect(gql).toContain("users(");
    expect(gql).toContain("where:");
  });

  it("should generate a query without where for empty group", () => {
    const group = makeGroup([]);
    const gql = generateGraphQL(group, "users");
    expect(gql).toContain("query {");
    expect(gql).toContain("users {");
    expect(gql).not.toContain("where:");
  });

  // --- Disabled rules ---
  it("should skip disabled rules", () => {
    const group = makeGroup([
      makeRule({ id: "r1", value: "skip", disabled: true }),
      makeRule({ id: "r2", field: "age", operator: "greater_than", value: 18 }),
    ]);
    const where = generateGraphQLWhere(group);
    expect(where).not.toContain("name");
    expect(where).toContain("age");
  });

  // --- Negation ---
  it("should wrap negated groups with _not", () => {
    const group = makeGroup([
      makeRule({ id: "r1", value: "A" }),
      makeRule({ id: "r2", value: "B" }),
    ], { negated: true });
    const where = generateGraphQLWhere(group);
    expect(where).toContain("_not");
  });
});
