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
import { motion, AnimatePresence } from "framer-motion";
import { GroupToolbar } from "./GroupToolbar";
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
import React from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableRule } from "./dnd/SortableRule";
import { SortableGroup } from "./dnd/SortableGroup";

interface QueryGroupProps {
  group: QueryGroupType;
  depth?: number;
  isRoot?: boolean;
  validationErrors?: ValidationError[];
  dragHandleRef?: (element: HTMLElement | null) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

export function QueryGroup({
  group,
  depth = 0,
  isRoot = false,
  validationErrors = [],
  dragHandleRef,
  dragHandleProps,
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
      <motion.div
        layout
        className={cn(
          "rounded-lg",
          depth > 0 && "bg-[var(--surface-secondary)]/30",
          isRoot && "bg-transparent",
          hasErrors && "ring-1 ring-[var(--color-error)]/30"
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
          dragHandleRef={dragHandleRef}
          dragHandleProps={dragHandleProps}
        />

        {/* Children — hidden when collapsed */}
        {!group.collapsed && (
          <motion.div layout className="flex flex-col gap-2 px-3 pb-3">
            {group.children.length === 0 ? (
              <EmptyGroupState onAddRule={() => addRule(group.id)} />
            ) : (
              <SortableContext items={group.children.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                <AnimatePresence initial={false}>
                {group.children.map((child) => {
                  if (child.type === "group") {
                    // RECURSIVE: render another QueryGroup
                    return (
                      <motion.div
                        key={child.id}
                        initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                        animate={{ opacity: 1, height: "auto", overflow: "visible" }}
                        exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                        transition={{ type: "spring", stiffness: 500, damping: 30, opacity: { duration: 0.2 } }}
                      >
                      <SortableGroup id={child.id}>
                        {(handleRef, handleProps) => (
                          <QueryGroup
                            group={child}
                            depth={depth + 1}
                            validationErrors={validationErrors}
                            dragHandleRef={handleRef}
                            dragHandleProps={handleProps}
                          />
                        )}
                      </SortableGroup>
                      </motion.div>
                    );
                  }

                  // Render a QueryRule
                  return (
                    <motion.div
                      key={child.id}
                      initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                      animate={{ opacity: 1, height: "auto", overflow: "visible" }}
                      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                      transition={{ type: "spring", stiffness: 500, damping: 30, opacity: { duration: 0.2 } }}
                    >
                    <SortableRule
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
                    </motion.div>
                  );
                })}
                </AnimatePresence>
              </SortableContext>
            )}
          </motion.div>
        )}

        {/* Group-level validation messages */}
        {groupErrors.length > 0 && (
          <div className="px-3 pb-2 pt-1">
            <ValidationMessage errors={groupErrors} />
          </div>
        )}
      </motion.div>
    </NestingIndicator>
  );
}

export const MemoizedQueryGroup = React.memo(QueryGroup);
