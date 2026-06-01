"use client";

/**
 * ImportExportActions — Export and Import buttons for query JSON.
 *
 * Export: Downloads the current query tree as a JSON file with
 * the naming format realql-query-{schemaId}-{timestamp}.json.
 *
 * Import: Opens a file picker, reads the JSON, validates it
 * through the Zod schema, sanitizes it, and loads it into
 * the query builder. Shows inline error messages for bad files.
 */

import { useRef, useState } from "react";
import { Download, Upload, AlertCircle, X } from "lucide-react";
import { useQueryStore } from "@/lib/store/query-store";
import { useUIStore } from "@/lib/store/ui-store";
import { validateQueryJSON } from "@/lib/utils/json-validator";
import { sanitizeQueryTree } from "@/lib/utils/sanitize";
import { cn } from "@/lib/utils/cn";
import type { QueryGroup } from "@/lib/types";

export function ImportExportActions() {
  const rootGroup = useQueryStore((s) => s.rootGroup);
  const activeSchemaId = useQueryStore((s) => s.activeSchemaId);
  const loadQuery = useQueryStore((s) => s.loadQuery);
  const setHistorySidebarOpen = useUIStore((s) => s.setHistorySidebarOpen);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  /**
   * Export the active query tree as a downloadable JSON file.
   */
  function handleExport() {
    const exportData = {
      version: 1,
      schemaId: activeSchemaId,
      exportedAt: new Date().toISOString(),
      query: rootGroup,
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const timestamp = Date.now();
    const filename = `realql-query-${activeSchemaId}-${timestamp}.json`;

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Trigger the hidden file input.
   */
  function handleImportClick() {
    setImportError(null);
    fileInputRef.current?.click();
  }

  /**
   * Handle the file selection and validate/load the query.
   */
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be re-selected
    e.target.value = "";

    // Check file extension
    if (!file.name.endsWith(".json")) {
      setImportError("Invalid file format. Please select a .json file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text !== "string") {
        setImportError("Could not read the file.");
        return;
      }

      // Try parsing JSON
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        setImportError("Invalid JSON syntax. The file is not valid JSON.");
        return;
      }

      // Support both wrapped format { query: ... } and raw QueryGroup
      let queryData: unknown;
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        !Array.isArray(parsed) &&
        "query" in parsed
      ) {
        queryData = (parsed as Record<string, unknown>).query;
      } else {
        queryData = parsed;
      }

      // Validate through Zod
      const validation = validateQueryJSON(queryData);
      if (!validation.success) {
        setImportError(validation.error ?? "Invalid query file.");
        return;
      }

      // Sanitize (strip extra fields, regenerate IDs)
      const sanitized = sanitizeQueryTree(queryData as QueryGroup);

      // Load into the query builder
      loadQuery(sanitized);
      setImportError(null);
      setHistorySidebarOpen(false);
    };

    reader.onerror = () => {
      setImportError("Failed to read the file. Please try again.");
    };

    reader.readAsText(file);
  }

  return (
    <div className="border-t border-[var(--border)] p-3 space-y-2">
      {/* Error banner */}
      {importError && (
        <div
          className={cn(
            "flex items-start gap-2 rounded-lg p-2.5",
            "bg-[var(--color-error)]/10 border border-[var(--color-error)]/20",
            "text-[11px] text-[var(--color-error)]"
          )}
          role="alert"
        >
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span className="flex-1 leading-relaxed">{importError}</span>
          <button
            type="button"
            onClick={() => setImportError(null)}
            className="shrink-0 rounded p-0.5 hover:bg-[var(--color-error)]/20 transition-colors"
            aria-label="Dismiss error"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleExport}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5",
            "rounded-md px-3 py-2 text-xs font-medium",
            "border border-[var(--border)]",
            "text-[var(--foreground)] bg-[var(--surface)]",
            "hover:bg-[var(--surface-hover)]",
            "transition-colors duration-150"
          )}
        >
          <Download size={14} />
          Export JSON
        </button>

        <button
          type="button"
          onClick={handleImportClick}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5",
            "rounded-md px-3 py-2 text-xs font-medium",
            "border border-[var(--border)]",
            "text-[var(--foreground)] bg-[var(--surface)]",
            "hover:bg-[var(--surface-hover)]",
            "transition-colors duration-150"
          )}
        >
          <Upload size={14} />
          Import JSON
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
