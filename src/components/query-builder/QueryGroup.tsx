"use client";

/**
 * QueryGroup — THE recursive component.
 *
 * Renders a group of conditions with a toolbar and nesting indicator.
 * Each child that is also a group renders another QueryGroup — this
 * is what makes it recursive and supports unlimited nesting depth.
 *
 * This is the most important component in the entire application.
 */

import { cn } from "@/lib/utils/cn";
import { GroupToolbar } from "./GroupToolbar";
import { QueryRule } from "./QueryRule";
import { NestingIndicator } from "./NestingIndicator";
import { EmptyGroupState } from "./EmptyGroupState";
import type {
  QueryGroup as QueryGroupType,
  QueryRule as QueryRuleType,
} from "@/lib/types";
import { useQueryStore } from "@/lib/store/query-store";
import { collectRules } from "@/lib/engine/tree-utils";

interface QueryGroupProps {
  group: QueryGroupType;
  depth?: number;
  isRoot?: boolean;
}

export function QueryGroup({
  group,
  depth = 0,
  isRoot = false,
}: QueryGroupProps) {
  const {
    addRule,
    addGroup,
    removeNode,
    toggleCombinator,
    toggleCollapse,
    updateRule,
    duplicateNode,
  } = useQueryStore();

  const totalRules = collectRules(group).length;

  return (
    <NestingIndicator depth={depth}>
      <div
        className={cn(
          "rounded-lg",
          depth > 0 && "bg-[var(--surface-secondary)]/30",
          isRoot && "bg-transparent"
        )}
        data-group-id={group.id}
        data-depth={depth}
      >
        {/* Group header */}
        <GroupToolbar
          groupId={group.id}
          combinator={group.combinator}
          collapsed={group.collapsed}
          isRoot={isRoot}
          depth={depth}
          childCount={totalRules}
          onToggleCombinator={() => toggleCombinator(group.id)}
          onToggleCollapse={() => toggleCollapse(group.id)}
          onAddRule={() => addRule(group.id)}
          onAddGroup={() => addGroup(group.id)}
          onDelete={() => removeNode(group.id)}
        />

        {/* Children — hidden when collapsed */}
        {!group.collapsed && (
          <div className="flex flex-col gap-2 px-3 pb-3">
            {group.children.length === 0 ? (
              <EmptyGroupState onAddRule={() => addRule(group.id)} />
            ) : (
              group.children.map((child) => {
                if (child.type === "group") {
                  // RECURSIVE: render another QueryGroup
                  return (
                    <QueryGroup
                      key={child.id}
                      group={child}
                      depth={depth + 1}
                    />
                  );
                }

                // Render a QueryRule
                return (
                  <QueryRule
                    key={child.id}
                    rule={child as QueryRuleType}
                    depth={depth}
                    onUpdate={(updates) =>
                      updateRule(child.id, updates)
                    }
                    onDelete={() => removeNode(child.id)}
                    onDuplicate={() => duplicateNode(child.id)}
                  />
                );
              })
            )}
          </div>
        )}
      </div>
    </NestingIndicator>
  );
}
