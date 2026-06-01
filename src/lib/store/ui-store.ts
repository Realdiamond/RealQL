/**
 * UI Store — ephemeral UI state.
 *
 * Controls sidebar visibility, preview format selection,
 * and any other transient UI flags. Not persisted.
 */

import { create } from "zustand";
import type { QueryOutputFormat } from "@/lib/types";

export type AllowedHistoryTab = "history" | "presets";

interface UIState {
  sidebarOpen: boolean;
  previewFormat: QueryOutputFormat;
  shortcutsDialogOpen: boolean;
  historySidebarOpen: boolean;
  activeHistoryTab?: AllowedHistoryTab;
  savePresetDialogOpen: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setPreviewFormat: (format: QueryOutputFormat) => void;
  cyclePreviewFormat: () => void;
  setShortcutsDialogOpen: (open: boolean) => void;
  setHistorySidebarOpen: (open: boolean) => void;
  setActiveHistoryTab: (tab: AllowedHistoryTab) => void;
  setSavePresetDialogOpen: (open: boolean) => void;
}

const FORMAT_CYCLE: QueryOutputFormat[] = ["sql", "mongodb", "graphql", "json"];

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  previewFormat: "sql",
  shortcutsDialogOpen: false,
  historySidebarOpen: false,
  savePresetDialogOpen: false,

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

  setHistorySidebarOpen: (open) => {
    set({ historySidebarOpen: open });
  },

  setActiveHistoryTab: (tab) => {
    set({ activeHistoryTab: tab });
  },

  setSavePresetDialogOpen: (open) => {
    set({ savePresetDialogOpen: open });
  },
}));
