/**
 * Result types for query execution output.
 */

export interface ExecutionResult {
  data: Record<string, unknown>[];
  totalCount: number;
  matchedCount: number;
  executionTimeMs: number;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SortState {
  column: string;
  direction: "asc" | "desc";
}
