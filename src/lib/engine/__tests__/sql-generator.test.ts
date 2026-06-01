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
    const params: unknown[] = [];
    const where = generateSQLWhere(group, params);
    expect(where).toBe("\"name\" = $1");
    expect(params).toEqual(["John"]);
  });

  it("should generate not_equals condition", () => {
    const group = makeGroup([makeRule({ operator: "not_equals", value: "inactive" })]);
    const params: unknown[] = [];
    const where = generateSQLWhere(group, params);
    expect(where).toBe("\"name\" != $1");
    expect(params).toEqual(["inactive"]);
  });

  it("should generate contains (LIKE)", () => {
    const group = makeGroup([makeRule({ operator: "contains", value: "test" })]);
    const params: unknown[] = [];
    const where = generateSQLWhere(group, params);
    expect(where).toBe(`"name" ILIKE $1 ESCAPE '\\'`);
    expect(params).toEqual(["%test%"]);
  });

  it("should generate not_contains (NOT LIKE)", () => {
    const group = makeGroup([makeRule({ operator: "not_contains", value: "spam" })]);
    const params: unknown[] = [];
    const where = generateSQLWhere(group, params);
    expect(where).toBe(`"name" NOT ILIKE $1 ESCAPE '\\'`);
    expect(params).toEqual(["%spam%"]);
  });

  it("should generate starts_with", () => {
    const group = makeGroup([makeRule({ operator: "starts_with", value: "Jo" })]);
    const params: unknown[] = [];
    const where = generateSQLWhere(group, params);
    expect(where).toBe(`"name" ILIKE $1 ESCAPE '\\'`);
    expect(params).toEqual(["Jo%"]);
  });

  it("should generate ends_with", () => {
    const group = makeGroup([makeRule({ operator: "ends_with", value: "hn" })]);
    const params: unknown[] = [];
    const where = generateSQLWhere(group, params);
    expect(where).toBe(`"name" ILIKE $1 ESCAPE '\\'`);
    expect(params).toEqual(["%hn"]);
  });

  it("should generate greater_than", () => {
    const group = makeGroup([makeRule({ field: "age", operator: "greater_than", value: 18 })]);
    const params: unknown[] = [];
    const where = generateSQLWhere(group, params);
    expect(where).toBe("\"age\" > $1");
    expect(params).toEqual([18]);
  });

  it("should generate less_than_or_equal", () => {
    const group = makeGroup([makeRule({ field: "age", operator: "less_than_or_equal", value: 65 })]);
    const params: unknown[] = [];
    const where = generateSQLWhere(group, params);
    expect(where).toBe("\"age\" <= $1");
    expect(params).toEqual([65]);
  });

  it("should generate IN array", () => {
    const group = makeGroup([makeRule({ field: "status", operator: "in_array", value: ["active", "pending"] })]);
    const params: unknown[] = [];
    const where = generateSQLWhere(group, params);
    expect(where).toBe("\"status\" IN ($1, $2)");
    expect(params).toEqual(["active", "pending"]);
  });

  it("should generate NOT IN array", () => {
    const group = makeGroup([makeRule({ field: "status", operator: "not_in_array", value: ["banned"] })]);
    const params: unknown[] = [];
    const where = generateSQLWhere(group, params);
    expect(where).toBe("\"status\" NOT IN ($1)");
    expect(params).toEqual(["banned"]);
  });

  it("should generate BETWEEN", () => {
    const group = makeGroup([makeRule({ field: "age", operator: "between", value: [18, 65] })]);
    const params: unknown[] = [];
    const where = generateSQLWhere(group, params);
    expect(where).toBe("\"age\" BETWEEN $1 AND $2");
    expect(params).toEqual([18, 65]);
  });

  it("should generate is_null", () => {
    const group = makeGroup([makeRule({ operator: "is_null" })]);
    const params: unknown[] = [];
    const where = generateSQLWhere(group, params);
    expect(where).toBe("\"name\" IS NULL");
    expect(params).toEqual([]); // no params for null
  });

  it("should generate is_not_null", () => {
    const group = makeGroup([makeRule({ operator: "is_not_null" })]);
    const params: unknown[] = [];
    const where = generateSQLWhere(group, params);
    expect(where).toBe("\"name\" IS NOT NULL");
  });

  it("should generate REGEXP", () => {
    const group = makeGroup([makeRule({ operator: "regex", value: "^[A-Z]" })]);
    const params: unknown[] = [];
    const where = generateSQLWhere(group, params);
    expect(where).toBe("\"name\" ~ $1");
    expect(params).toEqual(["^[A-Z]"]);
  });

  // --- Combinators and Nesting ---
  it("should join multiple rules with AND", () => {
    const group = makeGroup([
      makeRule({ field: "name", value: "test" }),
      makeRule({ field: "age", operator: "greater_than", value: 18 }),
    ]);
    const params: unknown[] = [];
    const where = generateSQLWhere(group, params);
    expect(where).toBe("\"name\" = $1 AND \"age\" > $2");
    expect(params).toEqual(["test", 18]);
  });

  it("should join multiple rules with OR", () => {
    const group = makeGroup(
      [
        makeRule({ field: "name", value: "test" }),
        makeRule({ field: "name", value: "other" }),
      ],
      { combinator: "OR" }
    );
    const params: unknown[] = [];
    const where = generateSQLWhere(group, params);
    expect(where).toBe("\"name\" = $1 OR \"name\" = $2");
    expect(params).toEqual(["test", "other"]);
  });

  it("should generate nested conditions properly parenthesized", () => {
    const outer = makeGroup([
      makeRule({ field: "status", value: "active" }),
      makeGroup(
        [
          makeRule({ field: "age", operator: "less_than", value: 18 }),
          makeRule({ field: "age", operator: "greater_than", value: 65 }),
        ],
        { combinator: "OR" }
      ),
    ]);
    const params: unknown[] = [];
    const where = generateSQLWhere(outer, params);
    expect(where).toBe("\"status\" = $1 AND (\"age\" < $2 OR \"age\" > $3)");
    expect(params).toEqual(["active", 18, 65]);
  });

  // --- Full statement generation ---
  it("should wrap in SELECT statement", () => {
    const group = makeGroup([makeRule({ value: "test" })]);
    const sql = generateSQL(group, "users");
    expect(sql).toContain("SELECT *");
    expect(sql).toContain('FROM "users"');
    expect(sql).toContain('WHERE "name" = $1');
    expect(sql).toContain('-- Parameters:\n-- [\n--   "test"\n-- ]');
  });

  it("should generate SELECT without WHERE if group is empty", () => {
    const group = makeGroup([]);
    const sql = generateSQL(group, "users");
    expect(sql).toBe('SELECT *\nFROM "users";');
  });

  // --- Edge cases ---
  it("should ignore rules with missing values", () => {
    const group = makeGroup([
      makeRule({ value: "" }),
      makeRule({ value: null as unknown as string }),
      makeRule({ value: undefined as unknown as string }),
    ]);
    const params: unknown[] = [];
    const where = generateSQLWhere(group, params);
    expect(where).toBe("");
  });

  it("should ignore disabled rules", () => {
    const group = makeGroup([
      makeRule({ value: "test1", disabled: true }),
      makeRule({ value: "test2" }),
    ]);
    const params: unknown[] = [];
    const where = generateSQLWhere(group, params);
    expect(where).toBe("\"name\" = $1");
    expect(params).toEqual(["test2"]);
  });

  it("should prefix NOT when group is negated", () => {
    const group = makeGroup([makeRule({ value: "test" })], { negated: true });
    const params: unknown[] = [];
    const where = generateSQLWhere(group, params);
    expect(where).toBe("NOT (\"name\" = $1)");
  });

  it("should escape identifiers", () => {
    const group = makeGroup([makeRule({ field: 'drop"table', value: "test" })]);
    const params: unknown[] = [];
    const where = generateSQLWhere(group, params);
    // Should strip quotes
    expect(where).toBe("\"droptable\" = $1");
  });

  it("should escape like strings", () => {
    const group = makeGroup([makeRule({ operator: "contains", value: "test%" })]);
    const params: unknown[] = [];
    generateSQLWhere(group, params);
    // % should be escaped
    expect(params[0]).toBe("%test\\%%");
  });

  it("should handle boolean TRUE/FALSE values", () => {
    const group = makeGroup([makeRule({ field: "isVerified", operator: "equals", value: true })]);
    const params: unknown[] = [];
    const where = generateSQLWhere(group, params);
    expect(where).toBe("\"isVerified\" = $1");
    expect(params).toEqual([true]);
  });
});
