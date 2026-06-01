/**
 * Sanitize — post-validation cleanup for imported query trees.
 *
 * After Zod validates the structure, this module strips any
 * unexpected fields and regenerates all node IDs with fresh
 * values to avoid collisions with existing nodes in the store.
 */

import type { QueryGroup, QueryNode, QueryRule } from "@/lib/types";
import { generateId } from "@/lib/utils/id";

/**
 * Sanitize an imported query group.
 * - Strips unknown fields (only keeps known QueryGroup/QueryRule properties)
 * - Regenerates all IDs with fresh nanoid values
 */
export function sanitizeQueryTree(group: QueryGroup): QueryGroup {
  return sanitizeGroup(group);
}

function sanitizeGroup(group: QueryGroup): QueryGroup {
  return {
    id: generateId(),
    type: "group",
    combinator: group.combinator,
    children: (group.children ?? []).map(sanitizeNode),
    collapsed: group.collapsed ?? false,
    ...(group.negated !== undefined && { negated: group.negated }),
  };
}

function sanitizeRule(rule: QueryRule): QueryRule {
  return {
    id: generateId(),
    type: "rule",
    field: rule.field ?? "",
    operator: rule.operator ?? "equals",
    value: rule.value ?? "",
    ...(rule.disabled !== undefined && { disabled: rule.disabled }),
  };
}

function sanitizeNode(node: QueryNode): QueryNode {
  if (node.type === "group") {
    return sanitizeGroup(node as QueryGroup);
  }
  return sanitizeRule(node as QueryRule);
}
