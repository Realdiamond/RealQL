/**
 * UI Store — ephemeral UI state.
 *
 * Controls sidebar visibility, preview format selection,
 * and any other transient UI flags. Not persisted.
 */

import { create } from "zustand";
import type { QueryOutputFormat } from "@/lib/types";

interface UIState {
  sidebarOpen: boolean;
  previewFormat: QueryOutputFormat;
  shortcutsDialogOpen: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setPreviewFormat: (format: QueryOutputFormat) => void;
  cyclePreviewFormat: () => void;
  setShortcutsDialogOpen: (open: boolean) => void;
}

const FORMAT_CYCLE: QueryOutputFormat[] = ["sql", "mongodb", "graphql"];

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  previewFormat: "sql",
  shortcutsDialogOpen: false,

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },

  setPreviewFormat: (format) => {
    set({ previewFormat: format });
  },

  cyclePreviewFormat: () => {
    set((state) => {
      const currentIndex = FORMAT_CYCLE.indexOf(state.previewFormat);
      const nextIndex = (currentIndex + 1) % FORMAT_CYCLE.length;
      return { previewFormat: FORMAT_CYCLE[nextIndex] };
    });
  },

  setShortcutsDialogOpen: (open) => {
    set({ shortcutsDialogOpen: open });
  },
}));
