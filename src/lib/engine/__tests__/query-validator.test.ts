/**
 * Unit tests for the query validation engine.
 *
 * Covers all 10 validation rules defined in the spec:
 *  1. Empty field
 *  2. Empty operator
 *  3. Empty value
 *  4. Invalid operator for type
 *  5. Invalid value type
 *  6. Empty group
 *  7. Invalid between range
 *  8. Invalid regex
 *  9. Invalid date
 * 10. Depth warning
 */

import { describe, it, expect } from "vitest";
import {
  validateQuery,
  validateRule,
  getErrorsForNode,
  hasBlockingErrors,
  getFieldError,
} from "../query-validator";
import type { QueryGroup, QueryRule } from "@/lib/types";
import type { SchemaField } from "@/lib/types";

// Test schema fields matching the users schema structure
const testFields: SchemaField[] = [
  { name: "name", label: "Name", type: "string" },
  { name: "age", label: "Age", type: "number" },
  { name: "email", label: "Email", type: "string" },
  {
    name: "status",
    label: "Status",
    type: "enum",
    enumValues: ["active", "inactive", "suspended"],
  },
  { name: "createdAt", label: "Created At", type: "date" },
  { name: "isVerified", label: "Verified", type: "boolean" },
];

function makeRule(overrides: Partial<QueryRule> = {}): QueryRule {
  return {
    id: "rule-1",
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
    id: "group-1",
    type: "group",
    combinator: "AND",
    collapsed: false,
    children,
    ...overrides,
  };
}

// -----------------------------------------------------------
// Rule 1: Empty field
// -----------------------------------------------------------
describe("Rule 1: Empty field", () => {
  it("should error when field is empty", () => {
    const rule = makeRule({ field: "" });
    const errors = validateRule(rule, testFields);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe("Select a field");
    expect(errors[0].severity).toBe("error");
  });

  it("should not error when field is set", () => {
    const rule = makeRule({ field: "name" });
    const errors = validateRule(rule, testFields);
    const fieldErrors = errors.filter((e) => e.field === "field");
    expect(fieldErrors).toHaveLength(0);
  });
});

// -----------------------------------------------------------
// Rule 2: Empty operator
// -----------------------------------------------------------
describe("Rule 2: Empty operator", () => {
  it("should error when operator is empty", () => {
    const rule = makeRule({ operator: "" as QueryRule["operator"] });
    const errors = validateRule(rule, testFields);
    expect(errors.some((e) => e.message === "Select an operator")).toBe(true);
  });
});

// -----------------------------------------------------------
// Rule 3: Empty value
// -----------------------------------------------------------
describe("Rule 3: Empty value", () => {
  it("should error when value is empty string", () => {
    const rule = makeRule({ value: "" });
    const errors = validateRule(rule, testFields);
    expect(errors.some((e) => e.message === "Enter a value")).toBe(true);
  });

  it("should error when value is null", () => {
    const rule = makeRule({ value: null });
    const errors = validateRule(rule, testFields);
    expect(errors.some((e) => e.message === "Enter a value")).toBe(true);
  });

  it("should error when value is empty array", () => {
    const rule = makeRule({ operator: "in_array", value: [] });
    const errors = validateRule(rule, testFields);
    expect(errors.some((e) => e.message === "Enter a value")).toBe(true);
  });

  it("should NOT error for is_null operator even with empty value", () => {
    const rule = makeRule({ operator: "is_null", value: null });
    const errors = validateRule(rule, testFields);
    expect(errors.filter((e) => e.field === "value")).toHaveLength(0);
  });

  it("should NOT error for is_not_null operator even with empty value", () => {
    const rule = makeRule({ operator: "is_not_null", value: null });
    const errors = validateRule(rule, testFields);
    expect(errors.filter((e) => e.field === "value")).toHaveLength(0);
  });
});

// -----------------------------------------------------------
// Rule 4: Invalid operator for field type
// -----------------------------------------------------------
describe("Rule 4: Invalid operator for field type", () => {
  it("should error when using 'contains' on a number field", () => {
    const rule = makeRule({ field: "age", operator: "contains", value: "5" });
    const errors = validateRule(rule, testFields);
    expect(
      errors.some((e) => e.message.includes("not valid for number fields"))
    ).toBe(true);
  });

  it("should error when using 'greater_than' on a string field", () => {
    const rule = makeRule({
      field: "name",
      operator: "greater_than",
      value: "5",
    });
    const errors = validateRule(rule, testFields);
    expect(
      errors.some((e) => e.message.includes("not valid for string fields"))
    ).toBe(true);
  });

  it("should NOT error when using 'equals' on a string field", () => {
    const rule = makeRule({ field: "name", operator: "equals", value: "test" });
    const errors = validateRule(rule, testFields);
    expect(errors.filter((e) => e.field === "operator")).toHaveLength(0);
  });
});

// -----------------------------------------------------------
// Rule 5: Invalid value type
// -----------------------------------------------------------
describe("Rule 5: Invalid value type", () => {
  it("should error when number field has non-numeric value", () => {
    const rule = makeRule({ field: "age", operator: "equals", value: "abc" });
    const errors = validateRule(rule, testFields);
    expect(errors.some((e) => e.message === "Expected a number")).toBe(true);
  });

  it("should NOT error when number field has numeric string", () => {
    const rule = makeRule({ field: "age", operator: "equals", value: "25" });
    const errors = validateRule(rule, testFields);
    expect(errors.filter((e) => e.message === "Expected a number")).toHaveLength(
      0
    );
  });

  it("should skip validation completely if the rule is disabled", () => {
    // This rule is totally broken (empty field, empty value)
    const rule = makeRule({ field: "", operator: "equals", value: "", disabled: true });
    const errors = validateRule(rule, testFields);
    // But it should have 0 errors because it's disabled
    expect(errors).toHaveLength(0);
  });

  it("should NOT error when number field has actual number value", () => {
    const rule = makeRule({ field: "age", operator: "equals", value: 25 });
    const errors = validateRule(rule, testFields);
    expect(errors.filter((e) => e.message === "Expected a number")).toHaveLength(
      0
    );
  });
});

// -----------------------------------------------------------
// Rule 6: Empty group
// -----------------------------------------------------------
describe("Rule 6: Empty group", () => {
  it("should error when group has no children", () => {
    const group = makeGroup([]);
    const errors = validateQuery(group, testFields);
    expect(
      errors.some(
        (e) => e.message === "Group must have at least one condition"
      )
    ).toBe(true);
  });

  it("should NOT error when group has children", () => {
    const group = makeGroup([makeRule()]);
    const errors = validateQuery(group, testFields);
    expect(
      errors.filter(
        (e) => e.message === "Group must have at least one condition"
      )
    ).toHaveLength(0);
  });
});

// -----------------------------------------------------------
// Rule 7: Invalid between range
// -----------------------------------------------------------
describe("Rule 7: Invalid between range", () => {
  it("should error when max is less than min (numbers)", () => {
    const rule = makeRule({
      field: "age",
      operator: "between",
      value: [50, 20],
    });
    const errors = validateRule(rule, testFields);
    expect(
      errors.some((e) => e.message === "Max must be greater than min")
    ).toBe(true);
  });

  it("should error when max equals min (numbers)", () => {
    const rule = makeRule({
      field: "age",
      operator: "between",
      value: [30, 30],
    });
    const errors = validateRule(rule, testFields);
    expect(
      errors.some((e) => e.message === "Max must be greater than min")
    ).toBe(true);
  });

  it("should NOT error when max is greater than min", () => {
    const rule = makeRule({
      field: "age",
      operator: "between",
      value: [20, 50],
    });
    const errors = validateRule(rule, testFields);
    expect(
      errors.filter((e) => e.message === "Max must be greater than min")
    ).toHaveLength(0);
  });

  it("should error when max date is before min date", () => {
    const rule = makeRule({
      field: "createdAt",
      operator: "between",
      value: ["2025-12-01", "2025-01-01"],
    });
    const errors = validateRule(rule, testFields);
    expect(
      errors.some((e) => e.message === "Max must be greater than min")
    ).toBe(true);
  });
});

// -----------------------------------------------------------
// Rule 8: Invalid regex
// -----------------------------------------------------------
describe("Rule 8: Invalid regex", () => {
  it("should error when regex pattern is invalid", () => {
    const rule = makeRule({
      field: "name",
      operator: "regex",
      value: "[invalid(",
    });
    const errors = validateRule(rule, testFields);
    expect(
      errors.some((e) => e.message === "Invalid regular expression pattern")
    ).toBe(true);
  });

  it("should NOT error when regex pattern is valid", () => {
    const rule = makeRule({
      field: "name",
      operator: "regex",
      value: "^[A-Z].*$",
    });
    const errors = validateRule(rule, testFields);
    expect(
      errors.filter(
        (e) => e.message === "Invalid regular expression pattern"
      )
    ).toHaveLength(0);
  });
});

// -----------------------------------------------------------
// Rule 9: Invalid date
// -----------------------------------------------------------
describe("Rule 9: Invalid date", () => {
  it("should error when date string is invalid format", () => {
    const rule = makeRule({
      field: "createdAt",
      operator: "equals",
      value: "not-a-date",
    });
    const errors = validateRule(rule, testFields);
    expect(errors.some((e) => e.message === "Invalid date format")).toBe(true);
  });

  it("should error when date has invalid month", () => {
    const rule = makeRule({
      field: "createdAt",
      operator: "equals",
      value: "2025-13-01",
    });
    const errors = validateRule(rule, testFields);
    expect(errors.some((e) => e.message === "Invalid date format")).toBe(true);
  });

  it("should NOT error for a valid date", () => {
    const rule = makeRule({
      field: "createdAt",
      operator: "equals",
      value: "2025-06-15",
    });
    const errors = validateRule(rule, testFields);
    expect(
      errors.filter((e) => e.message === "Invalid date format")
    ).toHaveLength(0);
  });
});

// -----------------------------------------------------------
// Rule 10: Depth warning
// -----------------------------------------------------------
describe("Rule 10: Depth warning", () => {
  it("should warn when nesting exceeds 5 levels", () => {
    // Build a chain of nested groups 7 levels deep
    let innerGroup = makeGroup([makeRule({ id: "deep-rule" })], {
      id: "group-7",
    });
    for (let i = 6; i >= 1; i--) {
      innerGroup = makeGroup([innerGroup], { id: `group-${i}` });
    }

    const errors = validateQuery(innerGroup, testFields);
    const depthWarnings = errors.filter(
      (e) =>
        e.message.includes("Nesting exceeds") && e.severity === "warning"
    );
    expect(depthWarnings.length).toBeGreaterThan(0);
  });

  it("should NOT warn for 5 or fewer levels", () => {
    // 3-level nesting: root -> child group -> rule
    const innerGroup = makeGroup(
      [makeRule({ id: "inner-rule" })],
      { id: "inner-group" }
    );
    const rootGroup = makeGroup([innerGroup], { id: "root" });

    const errors = validateQuery(rootGroup, testFields);
    const depthWarnings = errors.filter((e) =>
      e.message.includes("Nesting exceeds")
    );
    expect(depthWarnings).toHaveLength(0);
  });
});

// -----------------------------------------------------------
// Recursive validation
// -----------------------------------------------------------
describe("Recursive validation", () => {
  it("should validate rules inside nested groups", () => {
    const nestedRule = makeRule({ id: "nested-rule", field: "", value: "" });
    const innerGroup = makeGroup([nestedRule], { id: "inner" });
    const rootGroup = makeGroup([innerGroup], { id: "root" });

    const errors = validateQuery(rootGroup, testFields);
    const ruleErrors = errors.filter((e) => e.nodeId === "nested-rule");
    expect(ruleErrors.length).toBeGreaterThan(0);
    expect(ruleErrors[0].message).toBe("Select a field");
  });

  it("should collect errors from multiple levels", () => {
    const rule1 = makeRule({ id: "r1", field: "name", value: "valid" });
    const rule2 = makeRule({ id: "r2", field: "", value: "" }); // invalid
    const innerGroup = makeGroup([rule2], { id: "inner" });
    const rootGroup = makeGroup([rule1, innerGroup], { id: "root" });

    const errors = validateQuery(rootGroup, testFields);
    expect(errors.some((e) => e.nodeId === "r2")).toBe(true);
  });
});

// -----------------------------------------------------------
// Helper functions
// -----------------------------------------------------------
describe("Helper: getErrorsForNode", () => {
  it("should filter errors by node ID", () => {
    const errors = [
      { nodeId: "a", field: "value", message: "err1", severity: "error" as const },
      { nodeId: "b", field: "value", message: "err2", severity: "error" as const },
      { nodeId: "a", field: "field", message: "err3", severity: "warning" as const },
    ];
    const nodeAErrors = getErrorsForNode(errors, "a");
    expect(nodeAErrors).toHaveLength(2);
  });
});

describe("Helper: hasBlockingErrors", () => {
  it("should return true when errors exist", () => {
    const errors = [
      { nodeId: "a", field: "value", message: "err", severity: "error" as const },
    ];
    expect(hasBlockingErrors(errors)).toBe(true);
  });

  it("should return false when only warnings exist", () => {
    const errors = [
      { nodeId: "a", field: "value", message: "warn", severity: "warning" as const },
    ];
    expect(hasBlockingErrors(errors)).toBe(false);
  });

  it("should return false for empty array", () => {
    expect(hasBlockingErrors([])).toBe(false);
  });
});

describe("Helper: getFieldError", () => {
  it("should find error for a specific field in a node", () => {
    const errors = [
      { nodeId: "a", field: "value", message: "err1", severity: "error" as const },
      { nodeId: "a", field: "operator", message: "err2", severity: "error" as const },
    ];
    const err = getFieldError(errors, "a", "operator");
    expect(err?.message).toBe("err2");
  });

  it("should return undefined when no match", () => {
    const errors = [
      { nodeId: "a", field: "value", message: "err1", severity: "error" as const },
    ];
    expect(getFieldError(errors, "a", "field")).toBeUndefined();
  });
});

// -----------------------------------------------------------
// Valid query — no errors
// -----------------------------------------------------------
describe("Valid query", () => {
  it("should return no errors for a fully valid query", () => {
    const rule1 = makeRule({
      id: "r1",
      field: "name",
      operator: "contains",
      value: "John",
    });
    const rule2 = makeRule({
      id: "r2",
      field: "age",
      operator: "greater_than",
      value: 18,
    });
    const rule3 = makeRule({
      id: "r3",
      field: "status",
      operator: "equals",
      value: "active",
    });

    const group = makeGroup([rule1, rule2, rule3], { id: "root" });
    const errors = validateQuery(group, testFields);
    expect(errors).toHaveLength(0);
  });
});
