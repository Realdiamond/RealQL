/**
 * QueryResultsPanel — orchestrates the query execution results view.
 *
 * Manages execution state (loading, results, pagination, sorting),
 * coordinates the executor engine with the toolbar and table,
 * and renders the appropriate state (loading, empty, results).
 *
 * Uses a simulated delay to mimic real database latency.
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useQueryStore } from "@/lib/store/query-store";
import { useShallow } from "zustand/react/shallow";
import { useQueryHistoryStore } from "@/lib/store/query-history-store";
import { getSchemaData, getSchema } from "@/lib/schemas/registry";
import { executeQuery } from "@/lib/engine/query-executor";
import { toast } from "sonner";
import type { PaginationState, SortState } from "@/lib/types";
import type { SchemaId } from "@/lib/schemas/registry";
import { ResultsToolbar } from "./ResultsToolbar";
import { ResultsTable, sortRows } from "./ResultsTable";
import { ResultsCards } from "./ResultsCards";
import { ResultsPagination } from "./ResultsPagination";
import { ResultsLoadingState } from "./ResultsLoadingState";
import { ResultsEmptyState } from "./ResultsEmptyState";
import { TableProperties } from "lucide-react";

const DEFAULT_PAGE_SIZE = 25;
const SIMULATED_DELAY_MS = 600;

export function QueryResultsPanel() {
  const { rootGroup, activeSchemaId, latestResult, setLatestResult } = useQueryStore(
    useShallow((state) => ({
      rootGroup: state.rootGroup,
      activeSchemaId: state.activeSchemaId,
      latestResult: state.latestResult,
      setLatestResult: state.setLatestResult,
    }))
  );

  const addHistory = useQueryHistoryStore((state) => state.addHistory);

  const [isLoading, setIsLoading] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(false);
  const [sort, setSort] = useState<SortState | null>(null);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Track the latest execution to discard stale responses
  const executionIdRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleExecute = useCallback(() => {
    const thisExecution = ++executionIdRef.current;

    setIsLoading(true);
    setHasExecuted(true);
    setSort(null);
    setCurrentPage(1);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Simulate network/DB latency for realism
    timeoutRef.current = setTimeout(() => {
      // Discard if a newer execution started
      if (thisExecution !== executionIdRef.current) return;

      const dataset = getSchemaData(activeSchemaId as SchemaId);
      const executionResult = executeQuery(rootGroup, dataset);

      setLatestResult(executionResult);
      addHistory(rootGroup, activeSchemaId);
      setIsLoading(false);
      
      toast.success(`Executed query returning ${executionResult.matchedCount} results`);
    }, SIMULATED_DELAY_MS);
  }, [rootGroup, activeSchemaId, addHistory, setLatestResult]);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  // Listen for global execute shortcut
  useEffect(() => {
    const onExecuteShortcut = () => handleExecute();
    window.addEventListener("execute-query", onExecuteShortcut);
    return () => window.removeEventListener("execute-query", onExecuteShortcut);
  }, [handleExecute]);

  // Compute pagination
  const pagination: PaginationState = {
    page: currentPage,
    pageSize,
    totalPages: latestResult ? Math.max(1, Math.ceil(latestResult.matchedCount / pageSize)) : 1,
  };

  // Sort and paginate data
  const displayData = latestResult?.data
    ? sortRows(latestResult.data, sort).slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      )
    : [];

  const schema = getSchema(activeSchemaId as SchemaId);

  return (
    <div className="flex flex-col h-full">
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border)]">
        <TableProperties size={14} className="text-[var(--accent-500)]" />
        <h2 className="text-xs font-semibold text-[var(--foreground)] tracking-tight">
          Results
        </h2>
      </div>

      {/* Toolbar: Execute + stats */}
      <ResultsToolbar
        onExecute={handleExecute}
        isLoading={isLoading}
        matchedCount={latestResult?.matchedCount ?? null}
        totalCount={latestResult?.totalCount ?? null}
        executionTimeMs={latestResult?.executionTimeMs ?? null}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExportCSV={
          latestResult?.data && latestResult.matchedCount > 0
            ? () => {
                import("@/lib/utils/export-utils").then(({ exportCSV }) => {
                  exportCSV(latestResult.data, `realql-results-${Date.now()}.csv`);
                  toast.success("Results exported as CSV");
                });
              }
            : undefined
        }
      />

      {/* Content area */}
      <div className="flex-1 min-h-0 flex flex-col">
        {!hasExecuted && !latestResult ? (
          <ResultsEmptyState hasExecuted={hasExecuted} />
        ) : isLoading ? (
          <ResultsLoadingState />
        ) : viewMode === "table" ? (
          <ResultsTable
            data={displayData}
            sort={sort}
            onSortChange={setSort}
          />
        ) : (
          <ResultsCards data={displayData} fields={schema?.fields ?? []} />
        )}
      </div>

      {latestResult && latestResult.matchedCount > 0 && !isLoading && (
        <ResultsPagination
          pagination={pagination}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
