"use client";

/**
 * QueryPreviewPanel — live query output preview.
 *
 * Reads the current query tree from the Zustand store, generates
 * output in the selected format (SQL/MongoDB/GraphQL), and renders
 * it in a syntax-highlighted CodeBlock. Updates in real time as
 * the user modifies the query.
 */

import { useState, useMemo } from "react";
import { Code2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useQueryStore } from "@/lib/store/query-store";
import { useShallow } from "zustand/react/shallow";
import { getSchema } from "@/lib/schemas/registry";
import { generateQuery } from "@/lib/engine/query-generator";
import { PreviewFormatTabs } from "./PreviewFormatTabs";
import { CodeBlock } from "./CodeBlock";
import type { QueryOutputFormat } from "@/lib/types";

export function QueryPreviewPanel() {
  const { rootGroup, activeSchemaId } = useQueryStore(
    useShallow((state) => ({
      rootGroup: state.rootGroup,
      activeSchemaId: state.activeSchemaId,
    }))
  );
  const [activeFormat, setActiveFormat] = useState<QueryOutputFormat>("sql");

  // Generate query output whenever tree or format changes
  const output = useMemo(() => {
    const schema = getSchema(activeSchemaId);
    const tableName = schema?.name ?? activeSchemaId;
    const fields = schema?.fields ?? [];
    return generateQuery(rootGroup, activeFormat, tableName, fields);
  }, [rootGroup, activeFormat, activeSchemaId]);

  const errorCount = output.errors.filter((e) => e.severity === "error").length;
  const warningCount = output.errors.filter(
    (e) => e.severity === "warning"
  ).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header with format tabs */}
      <div
        className={cn(
          "flex items-center justify-between gap-3",
          "px-4 py-3",
          "border-b border-[var(--border)]",
          "bg-[var(--surface)]"
        )}
      >
        <div className="flex items-center gap-2 text-[var(--gray-500)]">
          <Code2 className="h-4 w-4" aria-hidden="true" />
          <span className="text-xs font-medium uppercase tracking-wider">
            Preview
          </span>
        </div>
        <PreviewFormatTabs
          activeFormat={activeFormat}
          onChange={setActiveFormat}
        />
      </div>

      {/* Query output */}
      <div className="flex-1 overflow-y-auto p-4">
        <CodeBlock code={output.query} format={activeFormat} />

        {/* Validation status bar */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className={cn(
            errorCount > 0 || warningCount > 0
              ? "flex items-center gap-2 mt-3 px-3 py-2 rounded-md text-xs"
              : "sr-only",
            errorCount > 0
              ? "bg-[var(--error)]/10 text-[var(--error)]"
              : warningCount > 0
                ? "bg-[var(--warning)]/10 text-[var(--warning)]"
                : ""
          )}
        >
          {errorCount > 0 || warningCount > 0 ? (
            <>
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                {errorCount > 0 && (
                  <>
                    {errorCount} error{errorCount !== 1 ? "s" : ""}
                  </>
                )}
                {errorCount > 0 && warningCount > 0 && ", "}
                {warningCount > 0 && (
                  <>
                    {warningCount} warning{warningCount !== 1 ? "s" : ""}
                  </>
                )}
                {" — "}
                {errorCount > 0
                  ? "fix errors before executing"
                  : "review warnings"}
              </span>
            </>
          ) : (
            "No errors or warnings"
          )}
        </div>
      </div>
    </div>
  );
}
