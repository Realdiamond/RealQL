/**
 * History Store — manages query history and saved presets.
 *
 * Both history entries and presets are persisted to localStorage.
 * History is auto-saved on every query execution.
 * Presets are manually named and saved by the user.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QueryGroup, QueryHistoryEntry, QueryPreset } from "@/lib/types";
import type { SchemaId } from "@/lib/schemas/registry";
import { generateId } from "@/lib/utils/id";

const MAX_HISTORY_ENTRIES = 50;

interface HistoryState {
  entries: QueryHistoryEntry[];
  presets: QueryPreset[];

  // History actions
  addEntry: (query: QueryGroup, schemaId: SchemaId, resultCount?: number) => void;
  clearHistory: () => void;
  removeEntry: (entryId: string) => void;

  // Preset actions
  savePreset: (name: string, description: string, query: QueryGroup, schemaId: SchemaId) => void;
  deletePreset: (presetId: string) => void;
  updatePreset: (presetId: string, updates: Partial<QueryPreset>) => void;

  // Import/Export
  exportPresets: () => string;
  importPresets: (json: string) => boolean;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      entries: [],
      presets: [],

      addEntry: (query, schemaId, resultCount) => {
        const entry: QueryHistoryEntry = {
          id: generateId(),
          name: `Query at ${new Date().toLocaleTimeString()}`,
          query,
          schemaId,
          timestamp: Date.now(),
          resultCount,
        };

        set((state) => ({
          entries: [entry, ...state.entries].slice(0, MAX_HISTORY_ENTRIES),
        }));
      },

      clearHistory: () => {
        set({ entries: [] });
      },

      removeEntry: (entryId) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== entryId),
        }));
      },

      savePreset: (name, description, query, schemaId) => {
        const preset: QueryPreset = {
          id: generateId(),
          name,
          description,
          query,
          schemaId,
          createdAt: Date.now(),
        };

        set((state) => ({
          presets: [preset, ...state.presets],
        }));
      },

      deletePreset: (presetId) => {
        set((state) => ({
          presets: state.presets.filter((p) => p.id !== presetId),
        }));
      },

      updatePreset: (presetId, updates) => {
        set((state) => ({
          presets: state.presets.map((p) =>
            p.id === presetId ? { ...p, ...updates } : p
          ),
        }));
      },

      exportPresets: () => {
        const { presets } = get();
        return JSON.stringify(presets, null, 2);
      },

      importPresets: (json) => {
        try {
          const parsed = JSON.parse(json);
          if (!Array.isArray(parsed)) return false;

          // Strict validation: check presence and types without using 'any'
          const valid = parsed.every((item: unknown) => {
            if (typeof item !== "object" || item === null) return false;
            const obj = item as Record<string, unknown>;
            return (
              typeof obj.id === "string" &&
              typeof obj.name === "string" &&
              typeof obj.description === "string" &&
              typeof obj.schemaId === "string" &&
              typeof obj.query === "object" &&
              obj.query !== null &&
              (typeof obj.createdAt === "number" ||
                (typeof obj.createdAt === "string" &&
                  !isNaN(new Date(obj.createdAt).getTime())))
            );
          });

          if (!valid) return false;

          // Normalize createdAt
          const normalized = parsed.map((item: unknown) => {
            const obj = item as Record<string, unknown>;
            return {
              ...obj,
              createdAt:
                typeof obj.createdAt === "number"
                  ? obj.createdAt
                  : new Date(obj.createdAt as string).getTime(),
            };
          }) as QueryPreset[];

          set((state) => ({
            presets: [...normalized, ...state.presets],
          }));

          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "realql-history",
      partialize: (state) => ({
        entries: state.entries,
        presets: state.presets,
      }),
    }
  )
);
