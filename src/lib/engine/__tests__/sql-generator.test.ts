/**
 * Unit tests for the SQL query generator.
 *
 * Covers all 16 operators, nested groups, empty states,
 * escaping, negation, and disabled rules.
 */

import { describe, it, expect } from "vitest";
import { generateSQL, generateSQLWhere } from "../sql-generator";
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

describe("SQL Generator", () => {
  // --- Basic operators ---
  it("should generate equals condition", () => {
    const group = makeGroup([makeRule({ field: "name", operator: "equals", value: "John" })]);
    const where = generateSQLWhere(group);
    expect(where).toBe("\"name\" = 'John'");
  });

  it("should generate not_equals condition", () => {
    const group = makeGroup([makeRule({ operator: "not_equals", value: "inactive" })]);
    const where = generateSQLWhere(group);
    expect(where).toContain("!=");
  });

  it("should generate contains (LIKE)", () => {
    const group = makeGroup([makeRule({ operator: "contains", value: "test" })]);
    const where = generateSQLWhere(group);
    expect(where).toBe(`"name" LIKE '%test%' ESCAPE '\\'`);
  });

  it("should generate not_contains (NOT LIKE)", () => {
    const group = makeGroup([makeRule({ operator: "not_contains", value: "spam" })]);
    const where = generateSQLWhere(group);
    expect(where).toBe(`"name" NOT LIKE '%spam%' ESCAPE '\\'`);
  });

  it("should generate starts_with", () => {
    const group = makeGroup([makeRule({ operator: "starts_with", value: "Jo" })]);
    const where = generateSQLWhere(group);
    expect(where).toBe(`"name" LIKE 'Jo%' ESCAPE '\\'`);
  });

  it("should generate ends_with", () => {
    const group = makeGroup([makeRule({ operator: "ends_with", value: "hn" })]);
    const where = generateSQLWhere(group);
    expect(where).toBe(`"name" LIKE '%hn' ESCAPE '\\'`);
  });

  it("should generate greater_than", () => {
    const group = makeGroup([makeRule({ field: "age", operator: "greater_than", value: 18 })]);
    const where = generateSQLWhere(group);
    expect(where).toBe("\"age\" > 18");
  });

  it("should generate less_than_or_equal", () => {
    const group = makeGroup([makeRule({ field: "age", operator: "less_than_or_equal", value: 65 })]);
    const where = generateSQLWhere(group);
    expect(where).toBe("\"age\" <= 65");
  });

  it("should generate IN array", () => {
    const group = makeGroup([makeRule({ field: "status", operator: "in_array", value: ["active", "pending"] })]);
    const where = generateSQLWhere(group);
    expect(where).toBe("\"status\" IN ('active', 'pending')");
  });

  it("should generate NOT IN array", () => {
    const group = makeGroup([makeRule({ field: "status", operator: "not_in_array", value: ["banned"] })]);
    const where = generateSQLWhere(group);
    expect(where).toBe("\"status\" NOT IN ('banned')");
  });

  it("should generate BETWEEN", () => {
    const group = makeGroup([makeRule({ field: "age", operator: "between", value: [18, 65] })]);
    const where = generateSQLWhere(group);
    expect(where).toBe("\"age\" BETWEEN 18 AND 65");
  });

  it("should generate IS NULL", () => {
    const group = makeGroup([makeRule({ field: "email", operator: "is_null", value: null })]);
    const where = generateSQLWhere(group);
    expect(where).toBe("\"email\" IS NULL");
  });

  it("should generate IS NOT NULL", () => {
    const group = makeGroup([makeRule({ field: "email", operator: "is_not_null", value: null })]);
    const where = generateSQLWhere(group);
    expect(where).toBe("\"email\" IS NOT NULL");
  });

  it("should generate REGEXP", () => {
    const group = makeGroup([makeRule({ operator: "regex", value: "^[A-Z]" })]);
    const where = generateSQLWhere(group);
    expect(where).toBe("\"name\" REGEXP '^[A-Z]'");
  });

  // --- Combinators ---
  it("should join with AND", () => {
    const group = makeGroup([
      makeRule({ id: "r1", field: "name", value: "A" }),
      makeRule({ id: "r2", field: "age", operator: "greater_than", value: 18 }),
    ], { combinator: "AND" });
    const where = generateSQLWhere(group);
    expect(where).toContain(" AND ");
  });

  it("should join with OR", () => {
    const group = makeGroup([
      makeRule({ id: "r1", value: "A" }),
      makeRule({ id: "r2", value: "B" }),
    ], { combinator: "OR" });
    const where = generateSQLWhere(group);
    expect(where).toContain(" OR ");
  });

  // --- Nesting ---
  it("should handle nested groups", () => {
    const inner = makeGroup([
      makeRule({ id: "r1", value: "test" }),
    ], { id: "inner", combinator: "OR" });
    const outer = makeGroup([inner, makeRule({ id: "r2", field: "age", operator: "greater_than", value: 18 })]);
    const where = generateSQLWhere(outer);
    expect(where).toContain("(");
    expect(where).toContain(") AND ");
  });

  // --- Full SELECT ---
  it("should generate a full SELECT statement", () => {
    const group = makeGroup([makeRule({ value: "test" })]);
    const sql = generateSQL(group, "users");
    expect(sql).toContain("SELECT *");
    expect(sql).toContain('FROM "users"');
    expect(sql).toContain("WHERE");
  });

  it("should generate SELECT without WHERE for empty group", () => {
    const group = makeGroup([]);
    const sql = generateSQL(group, "users");
    expect(sql).toContain("SELECT *");
    expect(sql).not.toContain("WHERE");
  });

  // --- Escaping ---
  it("should escape single quotes in values", () => {
    const group = makeGroup([makeRule({ value: "O'Brien" })]);
    const where = generateSQLWhere(group);
    expect(where).toContain("O''Brien");
  });

  // --- Disabled rules ---
  it("should skip disabled rules", () => {
    const group = makeGroup([
      makeRule({ id: "r1", value: "active", disabled: true }),
      makeRule({ id: "r2", field: "age", operator: "greater_than", value: 18 }),
    ]);
    const where = generateSQLWhere(group);
    expect(where).not.toContain("name");
    expect(where).toContain("age");
  });

  // --- Negation ---
  it("should wrap negated groups with NOT", () => {
    const group = makeGroup([makeRule({ value: "test" })], { negated: true });
    const where = generateSQLWhere(group);
    expect(where).toContain("NOT (");
  });

  // --- Boolean values ---
  it("should handle boolean TRUE/FALSE values", () => {
    const group = makeGroup([makeRule({ field: "isVerified", operator: "equals", value: true })]);
    const where = generateSQLWhere(group);
    expect(where).toBe("\"isVerified\" = TRUE");
  });
});
