/**
 * Results Store — manages query execution results.
 *
 * Tracks the execution lifecycle: idle → loading → success/error.
 * Holds the filtered data, pagination state, and sort state.
 */

import { create } from "zustand";
import type { ExecutionResult, PaginationState, SortState } from "@/lib/types";

type ExecutionStatus = "idle" | "loading" | "success" | "error";

interface ResultsState {
  status: ExecutionStatus;
  result: ExecutionResult | null;
  error: string | null;
  pagination: PaginationState;
  sort: SortState | null;

  // Actions
  setLoading: () => void;
  setResult: (result: ExecutionResult) => void;
  setError: (error: string) => void;
  resetResults: () => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSort: (sort: SortState | null) => void;
}

export const useResultsStore = create<ResultsState>((set) => ({
  status: "idle",
  result: null,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    totalPages: 0,
  },
  sort: null,

  setLoading: () => {
    set({ status: "loading", error: null });
  },

  setResult: (result) => {
    set((state) => {
      const pageSize = Math.max(1, state.pagination.pageSize || 20);
      return {
        status: "success",
        result,
        error: null,
        pagination: {
          page: 1,
          pageSize,
          totalPages: Math.max(1, Math.ceil(result.matchedCount / pageSize)),
        },
      };
    });
  },

  setError: (error) => {
    set({ status: "error", error, result: null });
  },

  resetResults: () => {
    set({
      status: "idle",
      result: null,
      error: null,
      pagination: { page: 1, pageSize: 20, totalPages: 0 },
      sort: null,
    });
  },

  setPage: (page) => {
    set((state) => {
      const safeTotalPages = Math.max(1, state.pagination.totalPages || 1);
      const clampedPage = Math.min(Math.max(1, page), safeTotalPages);
      return {
        pagination: { ...state.pagination, page: clampedPage },
      };
    });
  },

  setPageSize: (pageSize) => {
    set((state) => {
      const safePageSize = Math.max(1, pageSize);
      return {
        pagination: {
          ...state.pagination,
          pageSize: safePageSize,
          page: 1,
          totalPages: state.result
            ? Math.max(1, Math.ceil(state.result.matchedCount / safePageSize))
            : 0,
        },
      };
    });
  },

  setSort: (sort) => {
    set({ sort });
  },
}));
