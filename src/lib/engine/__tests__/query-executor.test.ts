/**
 * Unit tests for the query execution engine.
 *
 * Covers all 16 operators, AND/OR combinators, nested groups,
 * negation, disabled rules, empty states, and edge cases.
 */

import { describe, it, expect } from "vitest";
import { executeQuery } from "../query-executor";
import type { QueryGroup, QueryRule } from "@/lib/types";

// ── Test Helpers ───────────────────────────────────────────────

function makeRule(overrides: Partial<QueryRule> = {}): QueryRule {
  return {
    id: "r1",
    type: "rule",
    field: "name",
    operator: "equals",
    value: "Alice",
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

const SAMPLE_DATA = [
  { name: "Alice", age: 30, email: "alice@example.com", status: "active", isVerified: true, createdAt: "2024-01-15" },
  { name: "Bob", age: 25, email: "bob@example.com", status: "inactive", isVerified: false, createdAt: "2024-03-20" },
  { name: "Charlie", age: 35, email: "charlie@test.com", status: "active", isVerified: true, createdAt: "2023-06-10" },
  { name: "Diana", age: 28, email: null, status: "pending", isVerified: false, createdAt: "2024-07-01" },
  { name: "Eve", age: 40, email: "eve@example.com", status: "active", isVerified: true, createdAt: "2022-11-30" },
];

// ── Tests ──────────────────────────────────────────────────────

describe("Query Executor", () => {
  // --- Result shape ---
  it("should return correct result shape", () => {
    const group = makeGroup([makeRule()]);
    const result = executeQuery(group, SAMPLE_DATA);

    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("totalCount", 5);
    expect(result).toHaveProperty("matchedCount");
    expect(result).toHaveProperty("executionTimeMs");
    expect(typeof result.executionTimeMs).toBe("number");
    expect(Array.isArray(result.data)).toBe(true);
  });

  // --- Empty group ---
  it("should return match-all for an empty group", () => {
    const group = makeGroup([]);
    const result = executeQuery(group, SAMPLE_DATA);
    expect(result.matchedCount).toBe(5);
    expect(result.data).toHaveLength(5);
    expect(result.totalCount).toBe(5);
  });

  // --- Equals ---
  it("should filter with equals operator", () => {
    const group = makeGroup([makeRule({ field: "name", operator: "equals", value: "Alice" })]);
    const result = executeQuery(group, SAMPLE_DATA);
    expect(result.matchedCount).toBe(1);
    expect(result.data[0].name).toBe("Alice");
  });

  it("should handle equals with numeric coercion", () => {
    const group = makeGroup([makeRule({ field: "age", operator: "equals", value: "30" })]);
    const result = executeQuery(group, SAMPLE_DATA);
    expect(result.matchedCount).toBe(1);
    expect(result.data[0].name).toBe("Alice");
  });

  // --- Not Equals ---
  it("should filter with not_equals operator", () => {
    const group = makeGroup([makeRule({ field: "status", operator: "not_equals", value: "active" })]);
    const result = executeQuery(group, SAMPLE_DATA);
    expect(result.matchedCount).toBe(2); // Bob (inactive), Diana (pending)
  });

  // --- Contains ---
  it("should filter with contains operator (case-insensitive)", () => {
    const group = makeGroup([makeRule({ field: "name", operator: "contains", value: "li" })]);
    const result = executeQuery(group, SAMPLE_DATA);
    expect(result.matchedCount).toBe(2); // Alice, Charlie
  });

  // --- Not Contains ---
  it("should filter with not_contains operator", () => {
    const group = makeGroup([makeRule({ field: "email", operator: "not_contains", value: "example" })]);
    const result = executeQuery(group, SAMPLE_DATA);
    // Charlie (test.com) and Diana (null -> "")
    expect(result.matchedCount).toBe(2);
  });

  // --- Starts With ---
  it("should filter with starts_with operator", () => {
    const group = makeGroup([makeRule({ field: "name", operator: "starts_with", value: "Al" })]);
    const result = executeQuery(group, SAMPLE_DATA);
    expect(result.matchedCount).toBe(1);
    expect(result.data[0].name).toBe("Alice");
  });

  // --- Ends With ---
  it("should filter with ends_with operator", () => {
    const group = makeGroup([makeRule({ field: "name", operator: "ends_with", value: "e" })]);
    const result = executeQuery(group, SAMPLE_DATA);
    // Alice, Charlie, Eve
    expect(result.matchedCount).toBe(3);
  });

  // --- Greater Than ---
  it("should filter with greater_than operator", () => {
    const group = makeGroup([makeRule({ field: "age", operator: "greater_than", value: 30 })]);
    const result = executeQuery(group, SAMPLE_DATA);
    expect(result.matchedCount).toBe(2); // Charlie (35), Eve (40)
  });

  // --- Greater Than Or Equal ---
  it("should filter with greater_than_or_equal operator", () => {
    const group = makeGroup([makeRule({ field: "age", operator: "greater_than_or_equal", value: 30 })]);
    const result = executeQuery(group, SAMPLE_DATA);
    expect(result.matchedCount).toBe(3); // Alice (30), Charlie (35), Eve (40)
  });

  // --- Less Than ---
  it("should filter with less_than operator", () => {
    const group = makeGroup([makeRule({ field: "age", operator: "less_than", value: 30 })]);
    const result = executeQuery(group, SAMPLE_DATA);
    expect(result.matchedCount).toBe(2); // Bob (25), Diana (28)
  });

  // --- Less Than Or Equal ---
  it("should filter with less_than_or_equal operator", () => {
    const group = makeGroup([makeRule({ field: "age", operator: "less_than_or_equal", value: 28 })]);
    const result = executeQuery(group, SAMPLE_DATA);
    expect(result.matchedCount).toBe(2); // Bob (25), Diana (28)
  });

  // --- In Array ---
  it("should filter with in_array operator", () => {
    const group = makeGroup([makeRule({ field: "status", operator: "in_array", value: ["active", "pending"] })]);
    const result = executeQuery(group, SAMPLE_DATA);
    expect(result.matchedCount).toBe(4); // Alice, Charlie, Diana, Eve
  });

  // --- Not In Array ---
  it("should filter with not_in_array operator", () => {
    const group = makeGroup([makeRule({ field: "status", operator: "not_in_array", value: ["active"] })]);
    const result = executeQuery(group, SAMPLE_DATA);
    expect(result.matchedCount).toBe(2); // Bob, Diana
  });

  // --- Between ---
  it("should filter with between operator (inclusive)", () => {
    const group = makeGroup([makeRule({ field: "age", operator: "between", value: [25, 30] })]);
    const result = executeQuery(group, SAMPLE_DATA);
    expect(result.matchedCount).toBe(3); // Bob (25), Diana (28), Alice (30)
  });

  it("should filter with between on date fields", () => {
    const group = makeGroup([makeRule({ field: "createdAt", operator: "between", value: ["2024-01-01", "2024-12-31"] })]);
    const result = executeQuery(group, SAMPLE_DATA);
    // Alice (2024-01-15), Bob (2024-03-20), Diana (2024-07-01)
    expect(result.matchedCount).toBe(3);
  });

  // --- Is Null ---
  it("should filter with is_null operator", () => {
    const group = makeGroup([makeRule({ field: "email", operator: "is_null", value: null })]);
    const result = executeQuery(group, SAMPLE_DATA);
    expect(result.matchedCount).toBe(1); // Diana
  });

  // --- Is Not Null ---
  it("should filter with is_not_null operator", () => {
    const group = makeGroup([makeRule({ field: "email", operator: "is_not_null", value: null })]);
    const result = executeQuery(group, SAMPLE_DATA);
    expect(result.matchedCount).toBe(4);
  });

  // --- Regex ---
  it("should filter with regex operator", () => {
    const group = makeGroup([makeRule({ field: "name", operator: "regex", value: "^[A-C]" })]);
    const result = executeQuery(group, SAMPLE_DATA);
    // Alice, Bob, Charlie
    expect(result.matchedCount).toBe(3);
  });

  it("should handle invalid regex gracefully", () => {
    const group = makeGroup([makeRule({ field: "name", operator: "regex", value: "[invalid" })]);
    const result = executeQuery(group, SAMPLE_DATA);
    // Invalid regex should pass all rows
    expect(result.matchedCount).toBe(5);
  });

  // --- AND combinator ---
  it("should combine rules with AND", () => {
    const group = makeGroup([
      makeRule({ id: "r1", field: "status", operator: "equals", value: "active" }),
      makeRule({ id: "r2", field: "age", operator: "greater_than", value: 30 }),
    ], { combinator: "AND" });
    const result = executeQuery(group, SAMPLE_DATA);
    expect(result.matchedCount).toBe(2); // Charlie (35, active), Eve (40, active)
  });

  // --- OR combinator ---
  it("should combine rules with OR", () => {
    const group = makeGroup([
      makeRule({ id: "r1", field: "name", operator: "equals", value: "Alice" }),
      makeRule({ id: "r2", field: "name", operator: "equals", value: "Bob" }),
    ], { combinator: "OR" });
    const result = executeQuery(group, SAMPLE_DATA);
    expect(result.matchedCount).toBe(2);
  });

  // --- Nested groups ---
  it("should handle nested groups", () => {
    // (status = active) AND (age > 30 OR isVerified = false)
    const inner = makeGroup([
      makeRule({ id: "r2", field: "age", operator: "greater_than", value: 30 }),
      makeRule({ id: "r3", field: "isVerified", operator: "equals", value: false }),
    ], { id: "inner", combinator: "OR" });

    const outer = makeGroup([
      makeRule({ id: "r1", field: "status", operator: "equals", value: "active" }),
      inner,
    ], { combinator: "AND" });

    const result = executeQuery(outer, SAMPLE_DATA);
    // Active: Alice(30,true), Charlie(35,true), Eve(40,true)
    // Inner matches: age>30 => Charlie,Eve; isVerified=false => none of the active ones
    // So: Charlie (35>30) and Eve (40>30) = 2
    expect(result.matchedCount).toBe(2);
  });

  // --- Negation ---
  it("should handle negated groups", () => {
    const group = makeGroup([
      makeRule({ field: "status", operator: "equals", value: "active" }),
    ], { negated: true });
    const result = executeQuery(group, SAMPLE_DATA);
    // NOT (status = active): Bob, Diana
    expect(result.matchedCount).toBe(2);
  });

  // --- Disabled rules ---
  it("should skip disabled rules (treat as true)", () => {
    const group = makeGroup([
      makeRule({ id: "r1", field: "status", operator: "equals", value: "active" }),
      makeRule({ id: "r2", field: "age", operator: "greater_than", value: 100, disabled: true }),
    ], { combinator: "AND" });
    const result = executeQuery(group, SAMPLE_DATA);
    // The disabled rule passes everything, so only status=active matters
    expect(result.matchedCount).toBe(3);
  });

  // --- Boolean fields ---
  it("should handle boolean field comparisons", () => {
    const group = makeGroup([makeRule({ field: "isVerified", operator: "equals", value: true })]);
    const result = executeQuery(group, SAMPLE_DATA);
    expect(result.matchedCount).toBe(3); // Alice, Charlie, Eve
  });

  // --- Empty dataset ---
  it("should return zero matches for empty dataset", () => {
    const group = makeGroup([makeRule()]);
    const result = executeQuery(group, []);
    expect(result.matchedCount).toBe(0);
    expect(result.totalCount).toBe(0);
    expect(result.data).toHaveLength(0);
  });

  // --- Rules with no field ---
  it("should pass rules with empty field", () => {
    const group = makeGroup([makeRule({ field: "" })]);
    const result = executeQuery(group, SAMPLE_DATA);
    expect(result.matchedCount).toBe(5); // No field = pass all
  });
});
