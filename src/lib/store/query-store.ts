/**
 * Query Store — manages the recursive query tree.
 *
 * This is the central store of the entire application.
 * It holds the root QueryGroup and exposes actions for
 * every mutation: add/remove/update rules and groups,
 * toggle combinators, collapse groups, undo/redo.
 *
 * Undo/redo is implemented via a snapshot stack.
 * Each mutating action pushes the previous state onto
 * the undo stack before applying the change.
 */

import { create } from "zustand";
import type { QueryGroup, QueryRule } from "@/lib/types";
import type { SchemaId } from "@/lib/schemas/registry";
import { generateId } from "@/lib/utils/id";
import {
  updateNode,
  removeNode,
  insertNode,
  moveNode,
  cloneNode,
  findNode,
  getMaxDepth,
} from "@/lib/engine/tree-utils";

const MAX_UNDO_STACK = 50;
const MAX_NESTING_DEPTH = 20;

function createEmptyRoot(): QueryGroup {
  return {
    id: generateId(),
    type: "group",
    combinator: "AND",
    children: [],
    collapsed: false,
  };
}

function createDefaultRule(): QueryRule {
  return {
    id: generateId(),
    type: "rule",
    field: "",
    operator: "equals",
    value: "",
  };
}

function createDefaultGroup(): QueryGroup {
  return {
    id: generateId(),
    type: "group",
    combinator: "AND",
    children: [createDefaultRule()],
    collapsed: false,
  };
}

interface QueryState {
  rootGroup: QueryGroup;
  activeSchemaId: SchemaId;

  // Undo/redo stacks
  undoStack: QueryGroup[];
  redoStack: QueryGroup[];

  // Actions
  addRule: (parentId: string) => void;
  addGroup: (parentId: string) => void;
  updateRule: (ruleId: string, updates: Partial<QueryRule>) => void;
  updateGroup: (groupId: string, updates: Partial<QueryGroup>) => void;
  removeNode: (nodeId: string) => void;
  moveNode: (nodeId: string, targetParentId: string, targetIndex: number) => void;
  toggleCombinator: (groupId: string) => void;
  toggleCollapse: (groupId: string) => void;
  duplicateNode: (nodeId: string) => void;
  setSchema: (schemaId: SchemaId) => void;
  resetQuery: () => void;
  loadQuery: (query: QueryGroup) => void;
  undo: () => void;
  redo: () => void;
}

function pushUndo(state: QueryState): { undoStack: QueryGroup[]; redoStack: QueryGroup[] } {
  const newStack = [state.rootGroup, ...state.undoStack].slice(0, MAX_UNDO_STACK);
  return { undoStack: newStack, redoStack: [] };
}

export const useQueryStore = create<QueryState>((set, get) => ({
  rootGroup: createEmptyRoot(),
  activeSchemaId: "users",
  undoStack: [],
  redoStack: [],

  addRule: (parentId) => {
    set((state) => ({
      ...pushUndo(state),
      rootGroup: insertNode(state.rootGroup, parentId, createDefaultRule()),
    }));
  },

  addGroup: (parentId) => {
    const state = get();
    const parentNode = findNode(state.rootGroup, parentId);
    if (!parentNode || parentNode.type !== "group") return;

    // Enforce max depth
    if (getMaxDepth(state.rootGroup) >= MAX_NESTING_DEPTH) return;

    set((state) => ({
      ...pushUndo(state),
      rootGroup: insertNode(state.rootGroup, parentId, createDefaultGroup()),
    }));
  },

  updateRule: (ruleId, updates) => {
    set((state) => ({
      ...pushUndo(state),
      rootGroup: updateNode(state.rootGroup, ruleId, updates),
    }));
  },

  updateGroup: (groupId, updates) => {
    set((state) => ({
      ...pushUndo(state),
      rootGroup: updateNode(state.rootGroup, groupId, updates),
    }));
  },

  removeNode: (nodeId) => {
    const state = get();
    // Don't remove the root group
    if (nodeId === state.rootGroup.id) return;

    set((state) => ({
      ...pushUndo(state),
      rootGroup: removeNode(state.rootGroup, nodeId),
    }));
  },

  moveNode: (nodeId, targetParentId, targetIndex) => {
    set((state) => ({
      ...pushUndo(state),
      rootGroup: moveNode(state.rootGroup, nodeId, targetParentId, targetIndex),
    }));
  },

  toggleCombinator: (groupId) => {
    set((state) => {
      const node = findNode(state.rootGroup, groupId);
      if (!node || node.type !== "group") return state;

      return {
        ...pushUndo(state),
        rootGroup: updateNode(state.rootGroup, groupId, {
          combinator: node.combinator === "AND" ? "OR" : "AND",
        }),
      };
    });
  },

  toggleCollapse: (groupId) => {
    set((state) => {
      const node = findNode(state.rootGroup, groupId);
      if (!node || node.type !== "group") return state;

      // Collapse doesn't push to undo stack (not a data change)
      return {
        rootGroup: updateNode(state.rootGroup, groupId, {
          collapsed: !node.collapsed,
        }),
      };
    });
  },

  duplicateNode: (nodeId) => {
    const state = get();
    const node = findNode(state.rootGroup, nodeId);
    if (!node) return;

    // Find parent so we can insert after the original
    const parent = findParentFromTree(state.rootGroup, nodeId);
    if (!parent) return;

    const clone = cloneNode(node, generateId);
    const originalIndex = parent.children.findIndex((c) => c.id === nodeId);

    set((state) => ({
      ...pushUndo(state),
      rootGroup: insertNode(
        state.rootGroup,
        parent.id,
        clone,
        originalIndex + 1
      ),
    }));
  },

  setSchema: (schemaId) => {
    set((state) => ({
      ...pushUndo(state),
      activeSchemaId: schemaId,
      rootGroup: createEmptyRoot(),
    }));
  },

  resetQuery: () => {
    set((state) => ({
      ...pushUndo(state),
      rootGroup: createEmptyRoot(),
    }));
  },

  loadQuery: (query) => {
    set((state) => ({
      ...pushUndo(state),
      rootGroup: query,
    }));
  },

  undo: () => {
    set((state) => {
      if (state.undoStack.length === 0) return state;

      const [previous, ...rest] = state.undoStack;
      return {
        rootGroup: previous,
        undoStack: rest,
        redoStack: [state.rootGroup, ...state.redoStack],
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.redoStack.length === 0) return state;

      const [next, ...rest] = state.redoStack;
      return {
        rootGroup: next,
        undoStack: [state.rootGroup, ...state.undoStack],
        redoStack: rest,
      };
    });
  },
}));

/** Helper: find parent of a node in the tree */
function findParentFromTree(
  root: QueryGroup,
  nodeId: string
): QueryGroup | undefined {
  for (const child of root.children) {
    if (child.id === nodeId) return root;
    if (child.type === "group") {
      const found = findParentFromTree(child, nodeId);
      if (found) return found;
    }
  }
  return undefined;
}

// Export helpers for testing
export { createEmptyRoot, createDefaultRule, createDefaultGroup };
