"use client";

/**
 * QueryBuilder — root orchestrator.
 *
 * This is the main entry point. It composes the schema selector,
 * recursive query group, and will later include the preview panel
 * and results panel (PR 7 and PR 8).
 */

import { useQueryStore } from "@/lib/store/query-store";
import { QueryGroup } from "./QueryGroup";
import { SCHEMAS, type SchemaId, getSchema } from "@/lib/schemas/registry";
import { cn } from "@/lib/utils/cn";
import { Database, RotateCcw, Undo2, Redo2 } from "lucide-react";
import { useQueryValidation } from "@/hooks/use-query-validation";
import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { QueryDragOverlay } from "./dnd/DragOverlay";
import type { QueryNode } from "@/lib/types";
import { findNode, findParent } from "@/lib/engine/tree-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function QueryBuilder() {
  const {
    rootGroup,
    activeSchemaId,
    setSchema,
    resetQuery,
    undo,
    redo,
    undoStack,
    redoStack,
    moveNode,
  } = useQueryStore();

  // Resolve active schema fields for validation
  const schema = getSchema(activeSchemaId);
  const fields = schema?.fields ?? [];

  // Run debounced validation against the full query tree
  const validationErrors = useQueryValidation(rootGroup, fields);

  const [activeNode, setActiveNode] = useState<QueryNode | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch for UUIDs generated on the server vs client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // 5px movement required
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const node = findNode(rootGroup, event.active.id as string);
    if (node) setActiveNode(node);
  }, [rootGroup]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveNode(null);

    if (!over || active.id === over.id) return;

    const activeNodeId = active.id as string;
    const overNodeId = over.id as string;

    const targetParent = findParent(rootGroup, overNodeId);
    if (!targetParent) return;

    const activeParent = findParent(rootGroup, activeNodeId);
    const activeNodeData = findNode(rootGroup, activeNodeId);

    if (activeNodeData && activeNodeData.type === "group") {
      if (activeNodeData.id === targetParent.id || !!findNode(activeNodeData as import("@/lib/types").QueryGroup, targetParent.id)) {
        return;
      }
    }

    const overNodeIndex = targetParent.children.findIndex((c) => c.id === overNodeId);

    let newIndex = overNodeIndex;
    
    // If moving within the same group and moving left to right, 
    // the target index is shifted because the item is removed first.
    if (activeParent?.id === targetParent.id) {
      const oldIndex = activeParent.children.findIndex((c) => c.id === activeNodeId);
      if (oldIndex < overNodeIndex) {
        newIndex = Math.max(0, overNodeIndex - 1);
      }
    }

    moveNode(activeNodeId, targetParent.id, newIndex);
  }, [rootGroup, moveNode]);

  return (
    <div className="flex flex-col h-full">
      {/* Schema selector + global actions */}
      <div
        className={cn(
          "flex items-center justify-between gap-4",
          "px-4 py-3",
          "border-b border-[var(--border)]",
          "bg-[var(--surface)]"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[var(--gray-500)]">
            <Database className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Data Source
            </span>
          </div>
          <Select
            value={activeSchemaId}
            onValueChange={(val) => {
              if (SCHEMAS.some((s) => s.id === val)) {
                setSchema(val as SchemaId);
              }
            }}
          >
            <SelectTrigger
              className={cn(
                "h-8 w-auto px-3 text-sm font-medium",
                "bg-[var(--surface)] border border-[var(--border)]",
                "text-[var(--foreground)]"
              )}
              aria-label="Select data source"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              side="bottom"
              align="start"
              sideOffset={4}
              alignItemWithTrigger={false}
            >
              {SCHEMAS.map((schema) => (
                <SelectItem key={schema.id} value={schema.id}>
                  {schema.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={undo}
            disabled={undoStack.length === 0}
            className={cn(
              "inline-flex items-center justify-center",
              "h-8 w-8 rounded-md",
              "text-[var(--gray-400)] hover:text-[var(--foreground)]",
              "hover:bg-[var(--surface-secondary)]",
              "transition-colors duration-150",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
            aria-label="Undo"
            title="Undo (⌘Z)"
          >
            <Undo2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={redo}
            disabled={redoStack.length === 0}
            className={cn(
              "inline-flex items-center justify-center",
              "h-8 w-8 rounded-md",
              "text-[var(--gray-400)] hover:text-[var(--foreground)]",
              "hover:bg-[var(--surface-secondary)]",
              "transition-colors duration-150",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
            aria-label="Redo"
            title="Redo (⌘⇧Z)"
          >
            <Redo2 className="h-4 w-4" />
          </button>

          <div className="w-px h-5 bg-[var(--border)] mx-1" />

          <button
            type="button"
            onClick={resetQuery}
            className={cn(
              "inline-flex items-center gap-1.5",
              "px-2.5 py-1.5 rounded-md text-xs font-medium",
              "text-[var(--gray-500)] hover:text-[var(--color-error)]",
              "hover:bg-[var(--color-error)]/10",
              "transition-colors duration-150"
            )}
            aria-label="Reset query"
            title="Reset query"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Query tree */}
      <div className="flex-1 overflow-y-auto p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <QueryGroup group={rootGroup} depth={0} isRoot validationErrors={validationErrors} />
          <QueryDragOverlay activeNode={activeNode} />
        </DndContext>
      </div>
    </div>
  );
}
