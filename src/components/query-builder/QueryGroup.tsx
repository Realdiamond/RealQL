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
import { ValidationMessage } from "./ValidationMessage";
import type {
  QueryGroup as QueryGroupType,
  QueryRule as QueryRuleType,
  ValidationError,
} from "@/lib/types";
import { useQueryStore } from "@/lib/store/query-store";
import { collectRules } from "@/lib/engine/tree-utils";
import { getSchema } from "@/lib/schemas/registry";
import { getErrorsForNode } from "@/lib/engine/query-validator";

interface QueryGroupProps {
  group: QueryGroupType;
  depth?: number;
  isRoot?: boolean;
  validationErrors?: ValidationError[];
}

export function QueryGroup({
  group,
  depth = 0,
  isRoot = false,
  validationErrors = [],
}: QueryGroupProps) {
  const addRule = useQueryStore((s) => s.addRule);
  const addGroup = useQueryStore((s) => s.addGroup);
  const removeNode = useQueryStore((s) => s.removeNode);
  const toggleCombinator = useQueryStore((s) => s.toggleCombinator);
  const toggleCollapse = useQueryStore((s) => s.toggleCollapse);
  const updateRule = useQueryStore((s) => s.updateRule);
  const duplicateNode = useQueryStore((s) => s.duplicateNode);
  const activeSchemaId = useQueryStore((s) => s.activeSchemaId);

  // Resolve schema fields for the active data source
  const schema = getSchema(activeSchemaId);
  const fields = schema?.fields ?? [];

  const totalRules = collectRules(group).length;

  // Get validation errors specific to this group
  const groupErrors = getErrorsForNode(validationErrors, group.id);
  const hasErrors = groupErrors.some((e) => e.severity === "error");

  return (
    <NestingIndicator depth={depth}>
      <div
        className={cn(
          "rounded-lg",
          depth > 0 && "bg-[var(--surface-secondary)]/30",
          isRoot && "bg-transparent",
          hasErrors && "ring-1 ring-[var(--error)]/30"
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
                      validationErrors={validationErrors}
                    />
                  );
                }

                // Render a QueryRule
                return (
                  <QueryRule
                    key={child.id}
                    rule={child as QueryRuleType}
                    depth={depth}
                    fields={fields}
                    validationErrors={validationErrors}
                    onUpdate={(updates) =>
                      updateRule(child.id, updates)
                    }
                    onDelete={() => removeNode(child.id)}
                    onDuplicate={() => duplicateNode(child.id)}
                  />
                );
              })
            )}

          {/* Group-level validation messages */}
          {groupErrors.length > 0 && (
            <div className="px-3 pb-2">
              <ValidationMessage errors={groupErrors} />
            </div>
          )}
        </div>
        )}
      </div>
    </NestingIndicator>
  );
}
