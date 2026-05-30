/**
 * Recursive tree utilities for the query tree.
 *
 * These pure functions operate on the QueryNode tree immutably.
 * Every mutation returns a new tree — the original is never modified.
 * Only the branch containing the changed node is reconstructed
 * (structural sharing for unchanged siblings).
 */

import type { QueryNode, QueryGroup, QueryRule } from "@/lib/types";

/** Type guard: is a node a group? */
export function isGroup(node: QueryNode): node is QueryGroup {
  return node.type === "group";
}

/** Type guard: is a node a rule? */
export function isRule(node: QueryNode): node is QueryRule {
  return node.type === "rule";
}

/**
 * Find a node by ID anywhere in the tree.
 * Returns the node or undefined if not found.
 */
export function findNode(
  root: QueryGroup,
  nodeId: string
): QueryNode | undefined {
  if (root.id === nodeId) return root;

  for (const child of root.children) {
    if (child.id === nodeId) return child;
    if (isGroup(child)) {
      const found = findNode(child, nodeId);
      if (found) return found;
    }
  }

  return undefined;
}

/**
 * Find the parent group of a node by ID.
 * Returns the parent group or undefined if nodeId is the root.
 */
export function findParent(
  root: QueryGroup,
  nodeId: string
): QueryGroup | undefined {
  for (const child of root.children) {
    if (child.id === nodeId) return root;
    if (isGroup(child)) {
      const found = findParent(child, nodeId);
      if (found) return found;
    }
  }

  return undefined;
}

/**
 * Map over the tree, transforming nodes that match.
 * Returns a new tree with only the changed branch reconstructed.
 *
 * The callback receives each node. Return the node unchanged
 * to keep it, or return a modified copy.
 */
export function mapTree(
  group: QueryGroup,
  fn: (node: QueryNode) => QueryNode
): QueryGroup {
  const mappedSelf = fn(group) as QueryGroup;

  const mappedChildren = mappedSelf.children.map((child) => {
    if (isGroup(child)) {
      return mapTree(child, fn);
    }
    return fn(child);
  });

  // Only create new object if children actually changed
  const childrenChanged = mappedChildren.some(
    (c, i) => c !== mappedSelf.children[i]
  );

  if (!childrenChanged && mappedSelf === group) {
    return group;
  }

  return {
    ...mappedSelf,
    children: childrenChanged ? mappedChildren : mappedSelf.children,
  };
}

/**
 * Update a specific node by ID. Only reconstructs the branch
 * containing that node — siblings and other branches are shared.
 */
export function updateNode(
  root: QueryGroup,
  nodeId: string,
  updates: Partial<QueryNode>
): QueryGroup {
  return mapTree(root, (node) => {
    if (node.id === nodeId) {
      return { ...node, ...updates } as QueryNode;
    }
    return node;
  });
}

/**
 * Remove a node by ID from anywhere in the tree.
 * Returns a new tree without that node.
 */
export function removeNode(root: QueryGroup, nodeId: string): QueryGroup {
  const newChildren = root.children
    .filter((child) => child.id !== nodeId)
    .map((child) => {
      if (isGroup(child)) {
        return removeNode(child, nodeId);
      }
      return child;
    });

  const childrenChanged =
    newChildren.length !== root.children.length ||
    newChildren.some((c, i) => c !== root.children[i]);

  if (!childrenChanged) return root;

  return { ...root, children: newChildren };
}

/**
 * Insert a node as a child of the group with the given parentId.
 * Inserts at the end by default, or at a specific index.
 */
export function insertNode(
  root: QueryGroup,
  parentId: string,
  node: QueryNode,
  index?: number
): QueryGroup {
  return mapTree(root, (current) => {
    if (current.id === parentId && isGroup(current)) {
      const newChildren = [...current.children];
      const insertAt = index ?? newChildren.length;
      newChildren.splice(insertAt, 0, node);
      return { ...current, children: newChildren };
    }
    return current;
  });
}

/**
 * Move a node from one position to another within the tree.
 * Used by drag-and-drop reordering.
 */
export function moveNode(
  root: QueryGroup,
  nodeId: string,
  targetParentId: string,
  targetIndex: number
): QueryGroup {
  // Find the node first
  const node = findNode(root, nodeId);
  if (!node) return root;

  // Remove from current position
  const withoutNode = removeNode(root, nodeId);

  // Insert at new position
  return insertNode(withoutNode, targetParentId, node, targetIndex);
}

/**
 * Deep clone a node, generating new IDs for the clone and all descendants.
 * Used for duplicating rules or groups.
 */
export function cloneNode(
  node: QueryNode,
  generateId: () => string
): QueryNode {
  if (isRule(node)) {
    return { ...node, id: generateId() };
  }

  return {
    ...node,
    id: generateId(),
    children: node.children.map((child) => cloneNode(child, generateId)),
  };
}

/**
 * Count total nodes (rules + groups) in the tree.
 */
export function countNodes(root: QueryGroup): number {
  let count = 1; // Count the root itself
  for (const child of root.children) {
    if (isGroup(child)) {
      count += countNodes(child);
    } else {
      count += 1;
    }
  }
  return count;
}

/**
 * Get the maximum nesting depth of the tree.
 * A flat group with only rules has depth 1.
 */
export function getMaxDepth(root: QueryGroup): number {
  let maxChildDepth = 0;
  for (const child of root.children) {
    if (isGroup(child)) {
      const childDepth = getMaxDepth(child);
      if (childDepth > maxChildDepth) {
        maxChildDepth = childDepth;
      }
    }
  }
  return 1 + maxChildDepth;
}

/**
 * Collect all rule nodes from the tree (flattened).
 */
export function collectRules(root: QueryGroup): QueryRule[] {
  const rules: QueryRule[] = [];
  for (const child of root.children) {
    if (isRule(child)) {
      rules.push(child);
    } else {
      rules.push(...collectRules(child));
    }
  }
  return rules;
}
