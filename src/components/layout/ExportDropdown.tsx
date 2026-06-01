"use client";

import { useState, useRef, useEffect } from "react";
import { Download, Code, Database, FileJson, ChevronDown } from "lucide-react";
import { useQueryStore } from "@/lib/store/query-store";
import { exportJSON, exportText, exportCSV } from "@/lib/utils/export-utils";
import { generateQuery } from "@/lib/engine/query-generator";
import { getSchema } from "@/lib/schemas/registry";
import type { SchemaId } from "@/lib/schemas/registry";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

export function ExportDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { rootGroup, activeSchemaId, latestResult } = useQueryStore(
    useShallow((state) => ({
      rootGroup: state.rootGroup,
      activeSchemaId: state.activeSchemaId,
      latestResult: state.latestResult,
    }))
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleExportPreset = () => {
    const payload = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      schemaId: activeSchemaId,
      rootGroup,
    };
    exportJSON(payload, `realql-preset-${Date.now()}.json`);
    setIsOpen(false);
    toast.success("Preset exported successfully");
  };

  const handleExportCode = () => {
    // Generate SQL by default for code export
    const schema = getSchema(activeSchemaId as SchemaId);
    const tableName = schema?.name ?? activeSchemaId;
    const fields = schema?.fields ?? [];
    
    const output = generateQuery(rootGroup, "sql", tableName, fields);
    exportText(output.query, `realql-query-${Date.now()}.sql`);
    setIsOpen(false);
    toast.success("SQL code exported successfully");
  };

  const handleExportResults = () => {
    if (!latestResult || latestResult.matchedCount === 0 || !latestResult.data) {
      toast.error("No results to export. Execute the query first.");
      return;
    }
    exportCSV(latestResult.data, `realql-results-${Date.now()}.csv`);
    setIsOpen(false);
    toast.success("Results exported as CSV");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface-secondary)] px-3 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-tertiary)] transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
        Export
        <ChevronDown className="h-3.5 w-3.5 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-56 rounded-md border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg z-50">
          <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--gray-500)]">
            Export Options
          </div>
          <button
            onClick={handleExportPreset}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors"
          >
            <FileJson className="h-3.5 w-3.5 text-blue-500" />
            <span>RealQL Preset (.json)</span>
          </button>
          <button
            onClick={handleExportCode}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors"
          >
            <Code className="h-3.5 w-3.5 text-green-500" />
            <span>SQL Query (.sql)</span>
          </button>
          <button
            onClick={handleExportResults}
            disabled={!latestResult || latestResult.matchedCount === 0}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--surface-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Database className="h-3.5 w-3.5 text-purple-500" />
            <span>Query Results (.csv)</span>
          </button>
        </div>
      )}
    </div>
  );
}
