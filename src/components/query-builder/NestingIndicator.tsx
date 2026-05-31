"use client";

/**
 * NestingIndicator — visual depth indicator.
 *
 * Renders a colored left border that shifts hue per depth level.
 * This is our unique design differentiator — makes nesting
 * visually traceable without being flashy.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface NestingIndicatorProps {
  depth: number;
  children: ReactNode;
}

/**
 * Depth-to-color mapping using our design tokens.
 * Each nesting level gets a distinct but harmonious hue.
 */
const DEPTH_COLORS = [
  "var(--depth-0)",
  "var(--depth-1)",
  "var(--depth-2)",
  "var(--depth-3)",
  "var(--depth-4)",
  "var(--depth-5)",
];

function getDepthColor(depth: number): string {
  return DEPTH_COLORS[depth % DEPTH_COLORS.length];
}

export function NestingIndicator({ depth, children }: NestingIndicatorProps) {
  return (
    <div
      className={cn(
        "relative",
        depth > 0 && "ml-4"
      )}
      style={{
        borderLeftWidth: depth > 0 ? "2px" : undefined,
        borderLeftStyle: depth > 0 ? "solid" : undefined,
        borderLeftColor: depth > 0 ? getDepthColor(depth) : undefined,
      }}
    >
      {children}
    </div>
  );
}
