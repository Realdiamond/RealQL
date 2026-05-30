import { describe, it, expect, beforeEach } from "vitest";
import { useQueryStore } from "@/lib/store/query-store";
import type { QueryGroup, QueryRule } from "@/lib/types";

// Reset store before each test
beforeEach(() => {
  useQueryStore.setState({
    rootGroup: {
      id: "root",
      type: "group",
      combinator: "AND",
      children: [],
      collapsed: false,
    },
    activeSchemaId: "users",
    undoStack: [],
    redoStack: [],
  });
});

function getState() {
  return useQueryStore.getState();
}

describe("queryStore — addRule", () => {
  it("adds a rule to the root group", () => {
    getState().addRule("root");

    const { rootGroup } = getState();
    expect(rootGroup.children).toHaveLength(1);
    expect(rootGroup.children[0].type).toBe("rule");
  });

  it("adds a rule to a nested group", () => {
    // Manually set up a nested group
    useQueryStore.setState({
      rootGroup: {
        id: "root",
        type: "group",
        combinator: "AND",
        children: [
          {
            id: "inner",
            type: "group",
            combinator: "OR",
            children: [],
            collapsed: false,
          },
        ],
        collapsed: false,
      },
    });

    getState().addRule("inner");

    const inner = getState().rootGroup.children[0] as QueryGroup;
    expect(inner.children).toHaveLength(1);
    expect(inner.children[0].type).toBe("rule");
  });

  it("pushes to undo stack", () => {
    getState().addRule("root");
    expect(getState().undoStack).toHaveLength(1);
  });
});

describe("queryStore — addGroup", () => {
  it("adds a group with a default rule inside", () => {
    getState().addGroup("root");

    const { rootGroup } = getState();
    expect(rootGroup.children).toHaveLength(1);

    const child = rootGroup.children[0] as QueryGroup;
    expect(child.type).toBe("group");
    expect(child.children).toHaveLength(1);
    expect(child.children[0].type).toBe("rule");
  });
});

describe("queryStore — updateRule", () => {
  it("updates a rule's field and operator", () => {
    getState().addRule("root");
    const ruleId = getState().rootGroup.children[0].id;

    getState().updateRule(ruleId, {
      field: "age",
      operator: "greater_than",
      value: 18,
    });

    const rule = getState().rootGroup.children[0] as QueryRule;
    expect(rule.field).toBe("age");
    expect(rule.operator).toBe("greater_than");
    expect(rule.value).toBe(18);
  });
});

describe("queryStore — removeNode", () => {
  it("removes a rule from the root group", () => {
    getState().addRule("root");
    getState().addRule("root");
    const ruleId = getState().rootGroup.children[0].id;

    getState().removeNode(ruleId);

    expect(getState().rootGroup.children).toHaveLength(1);
  });

  it("does not remove the root group", () => {
    getState().removeNode("root");
    expect(getState().rootGroup.id).toBe("root");
  });
});

describe("queryStore — toggleCombinator", () => {
  it("toggles AND to OR", () => {
    getState().toggleCombinator("root");
    expect(getState().rootGroup.combinator).toBe("OR");
  });

  it("toggles OR back to AND", () => {
    getState().toggleCombinator("root");
    getState().toggleCombinator("root");
    expect(getState().rootGroup.combinator).toBe("AND");
  });
});

describe("queryStore — toggleCollapse", () => {
  it("toggles collapsed state", () => {
    getState().toggleCollapse("root");
    expect(getState().rootGroup.collapsed).toBe(true);

    getState().toggleCollapse("root");
    expect(getState().rootGroup.collapsed).toBe(false);
  });

  it("does not push to undo stack (not a data change)", () => {
    getState().toggleCollapse("root");
    expect(getState().undoStack).toHaveLength(0);
  });
});

describe("queryStore — undo/redo", () => {
  it("undoes the last action", () => {
    getState().addRule("root");
    expect(getState().rootGroup.children).toHaveLength(1);

    getState().undo();
    expect(getState().rootGroup.children).toHaveLength(0);
  });

  it("redoes an undone action", () => {
    getState().addRule("root");
    getState().undo();
    expect(getState().rootGroup.children).toHaveLength(0);

    getState().redo();
    expect(getState().rootGroup.children).toHaveLength(1);
  });

  it("clears redo stack on new action", () => {
    getState().addRule("root");
    getState().undo();
    expect(getState().redoStack).toHaveLength(1);

    // New action should clear redo
    getState().addRule("root");
    expect(getState().redoStack).toHaveLength(0);
  });

  it("does nothing when undo stack is empty", () => {
    const before = getState().rootGroup;
    getState().undo();
    expect(getState().rootGroup).toBe(before);
  });

  it("does nothing when redo stack is empty", () => {
    const before = getState().rootGroup;
    getState().redo();
    expect(getState().rootGroup).toBe(before);
  });
});

describe("queryStore — setSchema", () => {
  it("changes the active schema and resets query", () => {
    getState().addRule("root");
    getState().setSchema("products");

    expect(getState().activeSchemaId).toBe("products");
    expect(getState().rootGroup.children).toHaveLength(0);
  });
});

describe("queryStore — resetQuery", () => {
  it("clears all children from root", () => {
    getState().addRule("root");
    getState().addRule("root");
    getState().resetQuery();

    expect(getState().rootGroup.children).toHaveLength(0);
  });

  it("pushes to undo stack", () => {
    getState().addRule("root");
    const stackBefore = getState().undoStack.length;

    getState().resetQuery();
    expect(getState().undoStack.length).toBe(stackBefore + 1);
  });
});

describe("queryStore — loadQuery", () => {
  it("loads an external query tree", () => {
    const externalQuery: QueryGroup = {
      id: "ext-root",
      type: "group",
      combinator: "OR",
      children: [
        {
          id: "ext-r1",
          type: "rule",
          field: "status",
          operator: "equals",
          value: "active",
        },
      ],
      collapsed: false,
    };

    getState().loadQuery(externalQuery);

    expect(getState().rootGroup.id).toBe("ext-root");
    expect(getState().rootGroup.combinator).toBe("OR");
    expect(getState().rootGroup.children).toHaveLength(1);
  });
});

describe("queryStore — duplicateNode", () => {
  it("duplicates a rule and places it after the original", () => {
    getState().addRule("root");
    const ruleId = getState().rootGroup.children[0].id;

    getState().duplicateNode(ruleId);

    const { children } = getState().rootGroup;
    expect(children).toHaveLength(2);
    expect(children[0].id).toBe(ruleId);
    expect(children[1].id).not.toBe(ruleId);
    expect(children[1].type).toBe("rule");
  });
});
