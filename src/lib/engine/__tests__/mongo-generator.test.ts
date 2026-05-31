/**
 * Unit tests for the MongoDB query generator.
 *
 * Covers all 16 operators, nested groups, empty states,
 * value coercion, negation, and disabled rules.
 */

import { describe, it, expect } from "vitest";
import { generateMongoDB, generateMongoFilter } from "../mongo-generator";
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

describe("MongoDB Generator", () => {
  // --- Basic operators ---
  it("should generate $eq for equals", () => {
    const group = makeGroup([makeRule({ value: "John" })]);
    const filter = generateMongoFilter(group);
    expect(filter).toEqual({ name: { $eq: "John" } });
  });

  it("should generate $ne for not_equals", () => {
    const group = makeGroup([makeRule({ operator: "not_equals", value: "inactive" })]);
    const filter = generateMongoFilter(group);
    expect(filter).toEqual({ name: { $ne: "inactive" } });
  });

  it("should generate $regex for contains", () => {
    const group = makeGroup([makeRule({ operator: "contains", value: "test" })]);
    const filter = generateMongoFilter(group);
    expect(filter).toEqual({ name: { $regex: "test", $options: "i" } });
  });

  it("should generate $not/$regex for not_contains", () => {
    const group = makeGroup([makeRule({ operator: "not_contains", value: "spam" })]);
    const filter = generateMongoFilter(group);
    expect(filter).toEqual({ name: { $not: /spam/i } });
  });

  it("should generate starts_with regex", () => {
    const group = makeGroup([makeRule({ operator: "starts_with", value: "Jo" })]);
    const filter = generateMongoFilter(group);
    expect(filter).toEqual({ name: { $regex: "^Jo", $options: "i" } });
  });

  it("should generate ends_with regex", () => {
    const group = makeGroup([makeRule({ operator: "ends_with", value: "hn" })]);
    const filter = generateMongoFilter(group);
    expect(filter).toEqual({ name: { $regex: "hn$", $options: "i" } });
  });

  it("should generate $gt for greater_than", () => {
    const group = makeGroup([makeRule({ field: "age", operator: "greater_than", value: 18 })]);
    const filter = generateMongoFilter(group);
    expect(filter).toEqual({ age: { $gt: 18 } });
  });

  it("should generate $lt for less_than", () => {
    const group = makeGroup([makeRule({ field: "age", operator: "less_than", value: 18 })]);
    const filter = generateMongoFilter(group);
    expect(filter).toEqual({ age: { $lt: 18 } });
  });

  it("should generate $gte for greater_than_or_equal", () => {
    const group = makeGroup([makeRule({ field: "age", operator: "greater_than_or_equal", value: 18 })]);
    const filter = generateMongoFilter(group);
    expect(filter).toEqual({ age: { $gte: 18 } });
  });

  it("should generate $lte for less_than_or_equal", () => {
    const group = makeGroup([makeRule({ field: "age", operator: "less_than_or_equal", value: 65 })]);
    const filter = generateMongoFilter(group);
    expect(filter).toEqual({ age: { $lte: 65 } });
  });

  it("should generate $in for in_array", () => {
    const group = makeGroup([makeRule({ field: "status", operator: "in_array", value: ["active", "pending"] })]);
    const filter = generateMongoFilter(group);
    expect(filter).toEqual({ status: { $in: ["active", "pending"] } });
  });

  it("should generate $nin for not_in_array", () => {
    const group = makeGroup([makeRule({ field: "status", operator: "not_in_array", value: ["banned"] })]);
    const filter = generateMongoFilter(group);
    expect(filter).toEqual({ status: { $nin: ["banned"] } });
  });

  it("should generate $gte/$lte for between", () => {
    const group = makeGroup([makeRule({ field: "age", operator: "between", value: [18, 65] })]);
    const filter = generateMongoFilter(group);
    expect(filter).toEqual({ age: { $gte: 18, $lte: 65 } });
  });

  it("should generate $eq null for is_null", () => {
    const group = makeGroup([makeRule({ field: "email", operator: "is_null", value: null })]);
    const filter = generateMongoFilter(group);
    expect(filter).toEqual({ email: { $eq: null } });
  });

  it("should generate $ne null for is_not_null", () => {
    const group = makeGroup([makeRule({ field: "email", operator: "is_not_null", value: null })]);
    const filter = generateMongoFilter(group);
    expect(filter).toEqual({ email: { $ne: null } });
  });

  it("should generate $regex for regex operator", () => {
    const group = makeGroup([makeRule({ operator: "regex", value: "^[A-Z]" })]);
    const filter = generateMongoFilter(group);
    expect(filter).toEqual({ name: { $regex: "^[A-Z]" } });
  });

  // --- Combinators ---
  it("should use $and for AND combinator with multiple rules", () => {
    const group = makeGroup([
      makeRule({ id: "r1", field: "name", value: "A" }),
      makeRule({ id: "r2", field: "age", operator: "greater_than", value: 18 }),
    ], { combinator: "AND" });
    const filter = generateMongoFilter(group);
    expect(filter).toHaveProperty("$and");
  });

  it("should use $or for OR combinator", () => {
    const group = makeGroup([
      makeRule({ id: "r1", value: "A" }),
      makeRule({ id: "r2", value: "B" }),
    ], { combinator: "OR" });
    const filter = generateMongoFilter(group);
    expect(filter).toHaveProperty("$or");
  });

  it("should unwrap single-condition groups", () => {
    const group = makeGroup([makeRule({ value: "only" })]);
    const filter = generateMongoFilter(group);
    // Single condition should not be wrapped in $and
    expect(filter).not.toHaveProperty("$and");
    expect(filter).toEqual({ name: { $eq: "only" } });
  });

  // --- Nesting ---
  it("should handle nested groups", () => {
    const inner = makeGroup([
      makeRule({ id: "r1", value: "A" }),
      makeRule({ id: "r2", value: "B" }),
    ], { id: "inner", combinator: "OR" });
    const outer = makeGroup([inner, makeRule({ id: "r3", field: "age", operator: "greater_than", value: 18 })]);
    const filter = generateMongoFilter(outer);
    expect(filter).toHaveProperty("$and");
  });

  // --- Empty state ---
  it("should return empty object for empty group", () => {
    const group = makeGroup([]);
    const filter = generateMongoFilter(group);
    expect(filter).toEqual({});
  });

  // --- JSON output ---
  it("should produce valid JSON string", () => {
    const group = makeGroup([makeRule({ value: "test" })]);
    const json = generateMongoDB(group);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  // --- Value coercion ---
  it("should coerce numeric strings to numbers", () => {
    const group = makeGroup([makeRule({ field: "age", operator: "equals", value: "25" })]);
    const filter = generateMongoFilter(group);
    expect(filter).toEqual({ age: { $eq: 25 } });
  });

  // --- Disabled rules ---
  it("should skip disabled rules", () => {
    const group = makeGroup([
      makeRule({ id: "r1", value: "skip", disabled: true }),
      makeRule({ id: "r2", field: "age", operator: "greater_than", value: 18 }),
    ]);
    const filter = generateMongoFilter(group);
    expect(JSON.stringify(filter)).not.toContain("skip");
  });

  // --- Negation ---
  it("should wrap negated groups with $nor", () => {
    const group = makeGroup([
      makeRule({ id: "r1", value: "A" }),
      makeRule({ id: "r2", value: "B" }),
    ], { negated: true });
    const filter = generateMongoFilter(group);
    expect(filter).toHaveProperty("$nor");
  });
});
