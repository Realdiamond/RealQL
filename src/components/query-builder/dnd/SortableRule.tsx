"use client";

/**
 * SortableRule — drag-and-drop wrapper for a QueryRule row.
 *
 * Uses DnD Kit's useSortable hook. The drag is activated only when
 * the user grabs the GripVertical handle (setActivatorNodeRef), so
 * clicking inputs/selects inside the rule never starts a drag.
 *
 * Passes dragHandleRef + dragHandleProps to QueryRule so the
 * existing GripVertical icon becomes the true drag handle.
 */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils/cn";
import { QueryRule } from "../QueryRule";
import type {
  QueryRule as QueryRuleType,
  SchemaField,
  ValidationError,
} from "@/lib/types";

interface SortableRuleProps {
  rule: QueryRuleType;
  depth: number;
  fields: SchemaField[];
  validationErrors?: ValidationError[];
  onUpdate: (updates: Partial<QueryRuleType>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function SortableRule({ rule, ...ruleProps }: SortableRuleProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: rule.id,
    data: { type: "rule" },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "relative",
        isDragging && "opacity-40 z-10"
      )}
    >
      <QueryRule
        {...ruleProps}
        rule={rule}
        dragHandleRef={setActivatorNodeRef}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
