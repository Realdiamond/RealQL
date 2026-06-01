/**
 * Tests for sanitize — post-validation cleanup for imported query trees.
 */

import { describe, it, expect } from "vitest";
import { sanitizeQueryTree } from "../sanitize";
import type { QueryGroup } from "@/lib/types";

function makeGroup(overrides: Partial<QueryGroup> = {}): QueryGroup {
  return {
    id: "original-group-id",
    type: "group",
    combinator: "AND",
    children: [],
    collapsed: false,
    ...overrides,
  };
}

describe("sanitizeQueryTree", () => {
  it("regenerates the root group ID", () => {
    const input = makeGroup();
    const result = sanitizeQueryTree(input);
    expect(result.id).not.toBe("original-group-id");
    expect(result.id.length).toBeGreaterThan(0);
  });

  it("regenerates all nested IDs recursively", () => {
    const input = makeGroup({
      children: [
        {
          id: "nested-group",
          type: "group",
          combinator: "OR",
          children: [
            {
              id: "nested-rule",
              type: "rule",
              field: "name",
              operator: "equals",
              value: "test",
            },
          ],
          collapsed: true,
        },
      ],
    });

    const result = sanitizeQueryTree(input);
    expect(result.id).not.toBe("original-group-id");

    const nestedGroup = result.children[0] as QueryGroup;
    expect(nestedGroup.id).not.toBe("nested-group");
    expect(nestedGroup.combinator).toBe("OR");
    expect(nestedGroup.collapsed).toBe(true);

    const nestedRule = nestedGroup.children[0];
    expect(nestedRule.id).not.toBe("nested-rule");
    expect(nestedRule.type).toBe("rule");
  });

  it("preserves known fields on rules", () => {
    const input = makeGroup({
      children: [
        {
          id: "r1",
          type: "rule",
          field: "age",
          operator: "greater_than",
          value: "25",
          disabled: true,
        },
      ],
    });

    const result = sanitizeQueryTree(input);
    const rule = result.children[0] as { field: string; operator: string; value: string; disabled: boolean };
    expect(rule.field).toBe("age");
    expect(rule.operator).toBe("greater_than");
    expect(rule.value).toBe("25");
    expect(rule.disabled).toBe(true);
  });

  it("strips extra fields that are not part of the schema", () => {
    const input = {
      ...makeGroup(),
      extraField: "should be removed",
      hackAttempt: "<script>alert('xss')</script>",
    } as unknown as QueryGroup;

    const result = sanitizeQueryTree(input);
    expect("extraField" in result).toBe(false);
    expect("hackAttempt" in result).toBe(false);
  });

  it("handles empty children array cleanly", () => {
    const input = makeGroup({ children: [] });
    const result = sanitizeQueryTree(input);
    expect(result.children).toEqual([]);
    expect(result.type).toBe("group");
  });
});
