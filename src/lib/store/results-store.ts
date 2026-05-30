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
    set({
      status: "success",
      result,
      error: null,
      pagination: {
        page: 1,
        pageSize: 20,
        totalPages: Math.ceil(result.matchedCount / 20),
      },
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
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
  },

  setPageSize: (pageSize) => {
    set((state) => ({
      pagination: {
        ...state.pagination,
        pageSize,
        page: 1,
        totalPages: state.result
          ? Math.ceil(state.result.matchedCount / pageSize)
          : 0,
      },
    }));
  },

  setSort: (sort) => {
    set({ sort });
  },
}));
