import { describe, it, expect } from "vitest";
import type { QueryGroup, QueryRule } from "@/lib/types";
import {
  isGroup,
  isRule,
  findNode,
  findParent,
  mapTree,
  updateNode,
  removeNode,
  insertNode,
  moveNode,
  cloneNode,
  countNodes,
  getMaxDepth,
  collectRules,
} from "@/lib/engine/tree-utils";

// --- Test fixtures ---

function makeRule(overrides: Partial<QueryRule> = {}): QueryRule {
  return {
    id: `rule-${Math.random().toString(36).slice(2, 8)}`,
    type: "rule",
    field: "name",
    operator: "equals",
    value: "test",
    ...overrides,
  };
}

function makeGroup(
  children: (QueryGroup | QueryRule)[] = [],
  overrides: Partial<QueryGroup> = {}
): QueryGroup {
  return {
    id: `group-${Math.random().toString(36).slice(2, 8)}`,
    type: "group",
    combinator: "AND",
    children,
    collapsed: false,
    ...overrides,
  };
}

// --- Tests ---

describe("isGroup / isRule", () => {
  it("correctly identifies a group node", () => {
    const group = makeGroup();
    expect(isGroup(group)).toBe(true);
    expect(isRule(group)).toBe(false);
  });

  it("correctly identifies a rule node", () => {
    const rule = makeRule();
    expect(isRule(rule)).toBe(true);
    expect(isGroup(rule)).toBe(false);
  });
});

describe("findNode", () => {
  it("finds the root node by ID", () => {
    const root = makeGroup([], { id: "root" });
    expect(findNode(root, "root")).toBe(root);
  });

  it("finds a direct child rule", () => {
    const rule = makeRule({ id: "r1" });
    const root = makeGroup([rule], { id: "root" });
    expect(findNode(root, "r1")).toBe(rule);
  });

  it("finds a deeply nested rule", () => {
    const deepRule = makeRule({ id: "deep" });
    const innerGroup = makeGroup([deepRule], { id: "inner" });
    const outerGroup = makeGroup([innerGroup], { id: "outer" });
    const root = makeGroup([outerGroup], { id: "root" });

    expect(findNode(root, "deep")).toBe(deepRule);
  });

  it("returns undefined for non-existent ID", () => {
    const root = makeGroup([makeRule({ id: "r1" })], { id: "root" });
    expect(findNode(root, "missing")).toBeUndefined();
  });
});

describe("findParent", () => {
  it("finds the parent of a direct child", () => {
    const rule = makeRule({ id: "r1" });
    const root = makeGroup([rule], { id: "root" });
    expect(findParent(root, "r1")).toBe(root);
  });

  it("finds the parent of a nested node", () => {
    const rule = makeRule({ id: "r1" });
    const inner = makeGroup([rule], { id: "inner" });
    const root = makeGroup([inner], { id: "root" });

    expect(findParent(root, "r1")?.id).toBe("inner");
  });

  it("returns undefined for the root node", () => {
    const root = makeGroup([], { id: "root" });
    expect(findParent(root, "root")).toBeUndefined();
  });
});

describe("updateNode", () => {
  it("updates a rule's field", () => {
    const rule = makeRule({ id: "r1", field: "name" });
    const root = makeGroup([rule], { id: "root" });

    const updated = updateNode(root, "r1", { field: "email" });

    expect(updated.children[0]).toEqual(
      expect.objectContaining({ id: "r1", field: "email" })
    );
  });

  it("preserves other children (structural sharing)", () => {
    const r1 = makeRule({ id: "r1" });
    const r2 = makeRule({ id: "r2" });
    const root = makeGroup([r1, r2], { id: "root" });

    const updated = updateNode(root, "r1", { field: "email" });

    // r2 should be the same reference
    expect(updated.children[1]).toBe(r2);
  });

  it("returns unchanged tree if node not found", () => {
    const root = makeGroup([makeRule({ id: "r1" })], { id: "root" });
    const result = updateNode(root, "missing", { field: "x" });
    expect(result).toBe(root);
  });
});

describe("removeNode", () => {
  it("removes a direct child rule", () => {
    const r1 = makeRule({ id: "r1" });
    const r2 = makeRule({ id: "r2" });
    const root = makeGroup([r1, r2], { id: "root" });

    const result = removeNode(root, "r1");

    expect(result.children).toHaveLength(1);
    expect(result.children[0].id).toBe("r2");
  });

  it("removes a deeply nested rule", () => {
    const deep = makeRule({ id: "deep" });
    const inner = makeGroup([deep, makeRule({ id: "keep" })], { id: "inner" });
    const root = makeGroup([inner], { id: "root" });

    const result = removeNode(root, "deep");

    const innerResult = result.children[0] as QueryGroup;
    expect(innerResult.children).toHaveLength(1);
    expect(innerResult.children[0].id).toBe("keep");
  });

  it("removes a nested group entirely", () => {
    const inner = makeGroup([makeRule({ id: "r1" })], { id: "inner" });
    const root = makeGroup([inner, makeRule({ id: "r2" })], { id: "root" });

    const result = removeNode(root, "inner");

    expect(result.children).toHaveLength(1);
    expect(result.children[0].id).toBe("r2");
  });

  it("returns unchanged tree if node not found", () => {
    const root = makeGroup([makeRule({ id: "r1" })], { id: "root" });
    const result = removeNode(root, "missing");
    expect(result).toBe(root);
  });
});

describe("insertNode", () => {
  it("inserts a rule at the end of a group", () => {
    const r1 = makeRule({ id: "r1" });
    const root = makeGroup([r1], { id: "root" });
    const newRule = makeRule({ id: "r2" });

    const result = insertNode(root, "root", newRule);

    expect(result.children).toHaveLength(2);
    expect(result.children[1].id).toBe("r2");
  });

  it("inserts at a specific index", () => {
    const r1 = makeRule({ id: "r1" });
    const r3 = makeRule({ id: "r3" });
    const root = makeGroup([r1, r3], { id: "root" });
    const r2 = makeRule({ id: "r2" });

    const result = insertNode(root, "root", r2, 1);

    expect(result.children).toHaveLength(3);
    expect(result.children[0].id).toBe("r1");
    expect(result.children[1].id).toBe("r2");
    expect(result.children[2].id).toBe("r3");
  });

  it("inserts into a nested group", () => {
    const inner = makeGroup([], { id: "inner" });
    const root = makeGroup([inner], { id: "root" });
    const newRule = makeRule({ id: "r1" });

    const result = insertNode(root, "inner", newRule);

    const innerResult = result.children[0] as QueryGroup;
    expect(innerResult.children).toHaveLength(1);
    expect(innerResult.children[0].id).toBe("r1");
  });
});

describe("moveNode", () => {
  it("moves a rule from one group to another", () => {
    const r1 = makeRule({ id: "r1" });
    const r2 = makeRule({ id: "r2" });
    const groupA = makeGroup([r1, r2], { id: "groupA" });
    const groupB = makeGroup([], { id: "groupB" });
    const root = makeGroup([groupA, groupB], { id: "root" });

    const result = moveNode(root, "r2", "groupB", 0);

    const resultA = result.children[0] as QueryGroup;
    const resultB = result.children[1] as QueryGroup;

    expect(resultA.children).toHaveLength(1);
    expect(resultB.children).toHaveLength(1);
    expect(resultB.children[0].id).toBe("r2");
  });

  it("returns unchanged tree if node not found", () => {
    const root = makeGroup([makeRule({ id: "r1" })], { id: "root" });
    const result = moveNode(root, "missing", "root", 0);
    expect(result).toBe(root);
  });

  it("returns unchanged tree if targetParentId is invalid", () => {
    const root = makeGroup([makeRule({ id: "r1" })], { id: "root" });
    const result = moveNode(root, "r1", "missingParent", 0);
    expect(result).toBe(root);
  });

  it("returns unchanged tree if target is a descendant of the moved node", () => {
    const childGroup = makeGroup([], { id: "child" });
    const parentGroup = makeGroup([childGroup], { id: "parent" });
    const root = makeGroup([parentGroup], { id: "root" });

    // Try to move parentGroup into childGroup
    const result = moveNode(root, "parent", "child", 0);
    expect(result).toBe(root);
  });
});

describe("cloneNode", () => {
  let idCounter = 0;
  const mockGenerateId = () => `clone-${++idCounter}`;

  it("clones a rule with a new ID", () => {
    idCounter = 0;
    const rule = makeRule({ id: "original" });
    const clone = cloneNode(rule, mockGenerateId);

    expect(clone.id).toBe("clone-1");
    expect(clone.type).toBe("rule");
    expect((clone as QueryRule).field).toBe(rule.field);
  });

  it("clones a group with new IDs for all descendants", () => {
    idCounter = 0;
    const group = makeGroup(
      [makeRule({ id: "r1" }), makeRule({ id: "r2" })],
      { id: "g1" }
    );

    const clone = cloneNode(group, mockGenerateId) as QueryGroup;

    expect(clone.id).toBe("clone-1");
    expect(clone.children[0].id).toBe("clone-2");
    expect(clone.children[1].id).toBe("clone-3");
    // Originals unchanged
    expect(group.id).toBe("g1");
  });

  it("deeply clones nested groups", () => {
    idCounter = 0;
    const inner = makeGroup([makeRule({ id: "r1" })], { id: "inner" });
    const outer = makeGroup([inner], { id: "outer" });

    const clone = cloneNode(outer, mockGenerateId) as QueryGroup;
    const clonedInner = clone.children[0] as QueryGroup;

    expect(clone.id).toBe("clone-1");
    expect(clonedInner.id).toBe("clone-2");
    expect(clonedInner.children[0].id).toBe("clone-3");
  });
});

describe("countNodes", () => {
  it("counts a single empty group as 1", () => {
    expect(countNodes(makeGroup())).toBe(1);
  });

  it("counts rules and groups", () => {
    const root = makeGroup([
      makeRule(),
      makeRule(),
      makeGroup([makeRule()]),
    ]);
    // root(1) + 2 rules + inner group(1) + inner rule(1) = 5
    expect(countNodes(root)).toBe(5);
  });
});

describe("getMaxDepth", () => {
  it("returns 1 for a flat group", () => {
    const root = makeGroup([makeRule(), makeRule()]);
    expect(getMaxDepth(root)).toBe(1);
  });

  it("returns correct depth for nested groups", () => {
    const root = makeGroup([
      makeGroup([
        makeGroup([makeRule()]),
      ]),
    ]);
    // root → child → grandchild = depth 3
    expect(getMaxDepth(root)).toBe(3);
  });

  it("returns max of multiple branches", () => {
    const root = makeGroup([
      makeGroup([makeRule()]), // depth 2
      makeGroup([makeGroup([makeRule()])]), // depth 3
    ]);
    expect(getMaxDepth(root)).toBe(3);
  });
});

describe("collectRules", () => {
  it("returns empty array for group with no rules", () => {
    expect(collectRules(makeGroup())).toEqual([]);
  });

  it("collects all rules from flat group", () => {
    const r1 = makeRule({ id: "r1" });
    const r2 = makeRule({ id: "r2" });
    const root = makeGroup([r1, r2]);

    const rules = collectRules(root);
    expect(rules).toHaveLength(2);
    expect(rules[0].id).toBe("r1");
    expect(rules[1].id).toBe("r2");
  });

  it("collects rules from deeply nested groups", () => {
    const r1 = makeRule({ id: "r1" });
    const r2 = makeRule({ id: "r2" });
    const r3 = makeRule({ id: "r3" });
    const root = makeGroup([r1, makeGroup([r2, makeGroup([r3])])]);

    const rules = collectRules(root);
    expect(rules).toHaveLength(3);
    expect(rules.map((r) => r.id)).toEqual(["r1", "r2", "r3"]);
  });
});

describe("mapTree", () => {
  it("transforms matching nodes", () => {
    const r1 = makeRule({ id: "r1", field: "name" });
    const r2 = makeRule({ id: "r2", field: "age" });
    const root = makeGroup([r1, r2], { id: "root" });

    const result = mapTree(root, (node) => {
      if (node.type === "rule" && node.id === "r1") {
        return { ...node, field: "email" };
      }
      return node;
    });

    expect((result.children[0] as QueryRule).field).toBe("email");
    expect((result.children[1] as QueryRule).field).toBe("age");
  });

  it("returns same reference when nothing changes", () => {
    const root = makeGroup([makeRule({ id: "r1" })], { id: "root" });

    const result = mapTree(root, (node) => node);

    expect(result).toBe(root);
  });
});
