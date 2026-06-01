/**
 * Tests for json-validator — Zod-based query tree validation.
 */

import { describe, it, expect } from "vitest";
import { validateQueryJSON } from "../json-validator";

function validRule(overrides = {}) {
  return {
    id: "rule-1",
    type: "rule",
    field: "name",
    operator: "equals",
    value: "test",
    ...overrides,
  };
}

function validGroup(overrides = {}) {
  return {
    id: "group-1",
    type: "group",
    combinator: "AND",
    children: [validRule()],
    collapsed: false,
    ...overrides,
  };
}

describe("validateQueryJSON", () => {
  it("accepts a valid complete query tree", () => {
    const result = validateQueryJSON(validGroup());
    expect(result.success).toBe(true);
  });

  it("accepts a group with empty children", () => {
    const result = validateQueryJSON(validGroup({ children: [] }));
    expect(result.success).toBe(true);
  });

  it("accepts a rule with disabled: true", () => {
    const group = validGroup({
      children: [validRule({ disabled: true })],
    });
    const result = validateQueryJSON(group);
    expect(result.success).toBe(true);
  });

  it("accepts nested groups recursively", () => {
    const nested = validGroup({
      id: "group-2",
      children: [
        validGroup({
          id: "group-3",
          children: [validRule({ id: "rule-2" })],
        }),
      ],
    });
    const result = validateQueryJSON(nested);
    expect(result.success).toBe(true);
  });

  it("accepts OR combinator", () => {
    const result = validateQueryJSON(validGroup({ combinator: "OR" }));
    expect(result.success).toBe(true);
  });

  it("accepts all 18 valid operators", () => {
    const operators = [
      "equals", "not_equals", "contains", "not_contains",
      "starts_with", "ends_with", "greater_than", "greater_than_or_equal",
      "less_than", "less_than_or_equal", "in_array", "not_in_array",
      "between", "is_null", "is_not_null", "regex", "before", "after",
    ];
    for (const op of operators) {
      const result = validateQueryJSON(
        validGroup({ children: [validRule({ operator: op })] })
      );
      expect(result.success, `operator '${op}' should be valid`).toBe(true);
    }
  });

  // --- Rejection cases ---

  it("rejects null input", () => {
    const result = validateQueryJSON(null);
    expect(result.success).toBe(false);
    expect(result.error).toContain("empty");
  });

  it("rejects undefined input", () => {
    const result = validateQueryJSON(undefined);
    expect(result.success).toBe(false);
    expect(result.error).toContain("empty");
  });

  it("rejects a non-object input", () => {
    const result = validateQueryJSON("hello");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Expected a RealQL query export");
  });

  it("rejects an array input", () => {
    const result = validateQueryJSON([validGroup()]);
    expect(result.success).toBe(false);
    expect(result.error).toContain("array");
  });

  it("rejects a random object without type: group", () => {
    const result = validateQueryJSON({ foo: "bar" });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Expected a RealQL query export");
  });

  it("rejects an invalid operator string", () => {
    const group = validGroup({
      children: [validRule({ operator: "fake_op" })],
    });
    const result = validateQueryJSON(group);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid");
    expect(result.error).toContain("operator");
  });

  it("rejects an invalid combinator", () => {
    const result = validateQueryJSON(validGroup({ combinator: "XOR" }));
    expect(result.success).toBe(false);
    expect(result.error).toContain("combinator");
  });

  it("rejects missing type field on a group", () => {
    const noType = validGroup();
    // @ts-expect-error Intentionally deleting required field for testing
    delete noType.type;
    const result = validateQueryJSON(noType);
    expect(result.success).toBe(false);
  });
});
