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

import { useState, useCallback, useRef } from "react";
import { useQueryStore } from "@/lib/store/query-store";
import { useShallow } from "zustand/react/shallow";
import { getSchemaData } from "@/lib/schemas/registry";
import { executeQuery } from "@/lib/engine/query-executor";
import type { ExecutionResult, PaginationState, SortState } from "@/lib/types";
import type { SchemaId } from "@/lib/schemas/registry";
import { ResultsToolbar } from "./ResultsToolbar";
import { ResultsTable } from "./ResultsTable";
import { ResultsPagination } from "./ResultsPagination";
import { ResultsLoadingState } from "./ResultsLoadingState";
import { ResultsEmptyState } from "./ResultsEmptyState";
import { TableProperties } from "lucide-react";

const DEFAULT_PAGE_SIZE = 25;
const SIMULATED_DELAY_MS = 600;

export function QueryResultsPanel() {
  const { rootGroup, activeSchemaId } = useQueryStore(
    useShallow((state) => ({
      rootGroup: state.rootGroup,
      activeSchemaId: state.activeSchemaId,
    }))
  );

  const [isLoading, setIsLoading] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [sort, setSort] = useState<SortState | null>(null);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);

  // Track the latest execution to discard stale responses
  const executionIdRef = useRef(0);

  const handleExecute = useCallback(() => {
    const thisExecution = ++executionIdRef.current;

    setIsLoading(true);
    setHasExecuted(true);
    setSort(null);
    setCurrentPage(1);

    // Simulate network/DB latency for realism
    setTimeout(() => {
      // Discard if a newer execution started
      if (thisExecution !== executionIdRef.current) return;

      const dataset = getSchemaData(activeSchemaId as SchemaId);
      const executionResult = executeQuery(rootGroup, dataset);

      setResult(executionResult);
      setIsLoading(false);
    }, SIMULATED_DELAY_MS);
  }, [rootGroup, activeSchemaId]);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  // Compute pagination
  const pagination: PaginationState = {
    page: currentPage,
    pageSize,
    totalPages: result ? Math.max(1, Math.ceil(result.matchedCount / pageSize)) : 1,
  };

  // Slice data for current page
  const startIdx = (currentPage - 1) * pageSize;
  const pageData = result ? result.data.slice(startIdx, startIdx + pageSize) : [];

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
        matchedCount={result?.matchedCount ?? null}
        totalCount={result?.totalCount ?? null}
        executionTimeMs={result?.executionTimeMs ?? null}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Content area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {isLoading ? (
          <ResultsLoadingState />
        ) : !hasExecuted || !result ? (
          <ResultsEmptyState hasExecuted={hasExecuted} />
        ) : result.matchedCount === 0 ? (
          <ResultsEmptyState hasExecuted={true} />
        ) : (
          <>
            <ResultsTable
              data={pageData}
              sort={sort}
              onSortChange={setSort}
            />
            <ResultsPagination
              pagination={pagination}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
