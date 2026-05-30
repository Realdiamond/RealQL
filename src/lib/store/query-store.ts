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
  getNodeDepth,
} from "@/lib/engine/tree-utils";

const MAX_UNDO_STACK = 50;
const MAX_NESTING_DEPTH = 20;

interface HistorySnapshot {
  rootGroup: QueryGroup;
  activeSchemaId: SchemaId;
}

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
  undoStack: HistorySnapshot[];
  redoStack: HistorySnapshot[];

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

function pushUndo(state: QueryState): { undoStack: HistorySnapshot[]; redoStack: HistorySnapshot[] } {
  const snapshot: HistorySnapshot = { rootGroup: state.rootGroup, activeSchemaId: state.activeSchemaId };
  const newStack = [snapshot, ...state.undoStack].slice(0, MAX_UNDO_STACK);
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

    // Enforce max depth by target parent + new subtree
    const parentDepth = getNodeDepth(state.rootGroup, parentId);
    if (parentDepth === -1) return;
    
    const newGroup = createDefaultGroup();
    const subtreeDepth = getMaxDepth(newGroup); // 1
    
    if (parentDepth + subtreeDepth > MAX_NESTING_DEPTH) return;

    set((state) => ({
      ...pushUndo(state),
      rootGroup: insertNode(state.rootGroup, parentId, newGroup),
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
    const state = get();
    const node = findNode(state.rootGroup, nodeId);
    if (!node) return;

    const targetDepth = getNodeDepth(state.rootGroup, targetParentId);
    if (targetDepth === -1) return;

    // A group has >= 1 depth. A rule alone isn't nested, so it adds 0 depth structure
    const subtreeDepth = node.type === "group" ? getMaxDepth(node as QueryGroup) : 0;
    
    if (targetDepth + subtreeDepth > MAX_NESTING_DEPTH) return;

    set((state) => {
      const newRoot = moveNode(state.rootGroup, nodeId, targetParentId, targetIndex);
      if (newRoot === state.rootGroup) return state; // Move rejected
      
      return {
        ...pushUndo(state),
        rootGroup: newRoot,
      };
    });
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
    const state = get();
    if (state.activeSchemaId === schemaId) return;

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
      const currentSnapshot: HistorySnapshot = { rootGroup: state.rootGroup, activeSchemaId: state.activeSchemaId };
      return {
        rootGroup: previous.rootGroup,
        activeSchemaId: previous.activeSchemaId,
        undoStack: rest,
        redoStack: [currentSnapshot, ...state.redoStack],
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.redoStack.length === 0) return state;

      const [next, ...rest] = state.redoStack;
      const currentSnapshot: HistorySnapshot = { rootGroup: state.rootGroup, activeSchemaId: state.activeSchemaId };
      return {
        rootGroup: next.rootGroup,
        activeSchemaId: next.activeSchemaId,
        undoStack: [currentSnapshot, ...state.undoStack],
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
