"use client";

/**
 * SortableGroup — drag-and-drop wrapper for a nested QueryGroup.
 *
 * Uses a render-prop pattern to avoid a circular module dependency:
 *   SortableGroup does NOT import QueryGroup.
 *   QueryGroup imports SortableGroup and provides its own QueryGroup
 *   children via the render prop.
 *
 * The render prop receives (dragHandleRef, dragHandleProps) so the
 * GroupToolbar's GripVertical icon can be wired as the drag activator.
 */

import type React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils/cn";

type DragHandleProps = React.HTMLAttributes<HTMLElement>;
type SetHandleRef = (element: HTMLElement | null) => void;

interface SortableGroupProps {
  id: string;
  /** Render prop receives the drag-handle ref setter and event listeners */
  children: (handleRef: SetHandleRef, handleProps: DragHandleProps) => React.ReactNode;
}

export function SortableGroup({ id, children }: SortableGroupProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { type: "group" },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(isDragging && "opacity-40")}
    >
      {children(setActivatorNodeRef, { ...attributes, ...listeners })}
    </div>
  );
}
