"use client";

/**
 * QueryDragOverlay — floating ghost card shown while dragging.
 *
 * Renders a compact, styled preview of the active dragged node.
 * Uses DnD Kit's DragOverlay portal (body-level, above everything).
 *
 * For rules: shows field + operator + value.
 * For groups: shows combinator + condition count.
 */

import {
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DropAnimation,
} from "@dnd-kit/core";
import { GripVertical, Filter, Layers } from "lucide-react";
import type { QueryNode } from "@/lib/types";

interface QueryDragOverlayProps {
  activeNode: QueryNode | null;
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: { opacity: "0.4" },
    },
  }),
};

export function QueryDragOverlay({ activeNode }: QueryDragOverlayProps) {
  return (
    <DragOverlay dropAnimation={dropAnimation}>
      {activeNode ? <DragGhost node={activeNode} /> : null}
    </DragOverlay>
  );
}

function DragGhost({ node }: { node: QueryNode }) {
  return (
    <div
      className={[
        "flex items-center gap-2 px-3 py-2 rounded-lg border shadow-xl",
        "bg-[var(--surface)] border-[var(--accent-400)]/50",
        "ring-2 ring-[var(--accent-400)]/20",
        "cursor-grabbing select-none",
        "max-w-xs",
      ].join(" ")}
    >
      <GripVertical size={14} className="text-[var(--gray-400)] shrink-0" />

      {node.type === "rule" ? (
        <>
          <Filter size={13} className="text-[var(--accent-500)] shrink-0" />
          <span className="truncate text-xs font-medium">
            {node.field ? (
              <>
                <span className="text-[var(--foreground)]">{node.field}</span>
                {" "}
                <span className="text-[var(--gray-500)]">
                  {node.operator.replace(/_/g, " ")}
                </span>
                {node.value !== null && node.value !== undefined && node.value !== "" && (
                  <>
                    {" "}
                    <span className="font-mono text-[var(--accent-600)]">
                      {Array.isArray(node.value)
                        ? `[${node.value.join(", ")}]`
                        : String(node.value)}
                    </span>
                  </>
                )}
              </>
            ) : (
              <span className="text-[var(--gray-400)] italic">Empty rule</span>
            )}
          </span>
        </>
      ) : (
        <>
          <Layers size={13} className="text-[var(--accent-500)] shrink-0" />
          <span className="text-xs font-medium">
            <span
              className={
                node.combinator === "AND"
                  ? "text-[var(--indigo-500)]"
                  : "text-[var(--color-warning)]"
              }
            >
              {node.combinator}
            </span>
            {" "}
            <span className="text-[var(--gray-500)]">
              group &middot; {node.children.length}{" "}
              {node.children.length === 1 ? "condition" : "conditions"}
            </span>
          </span>
        </>
      )}
    </div>
  );
}
