import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QueryGroup } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export interface SavedQuery {
  id: string;
  name?: string;
  timestamp: number;
  activeSchemaId?: string;
  rootGroup: QueryGroup;
}

interface QueryHistoryState {
  history: SavedQuery[];
  presets: SavedQuery[];
  addHistory: (rootGroup: QueryGroup, activeSchemaId: string) => void;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
  savePreset: (name: string, rootGroup: QueryGroup, activeSchemaId: string) => void;
  deletePreset: (id: string) => void;
}

const MAX_HISTORY_ITEMS = 50;

export const useQueryHistoryStore = create<QueryHistoryState>()(
  persist(
    (set) => ({
      history: [],
      presets: [],

      addHistory: (rootGroup, activeSchemaId) =>
        set((state) => {
          const newItem: SavedQuery = {
            id: uuidv4(),
            timestamp: Date.now(),
            activeSchemaId,
            rootGroup: structuredClone(rootGroup),
          };
          const newHistory = [newItem, ...state.history].slice(0, MAX_HISTORY_ITEMS);
          return { history: newHistory };
        }),

      clearHistory: () => set({ history: [] }),
      
      deleteHistoryItem: (id) =>
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        })),

      savePreset: (name, rootGroup, activeSchemaId) =>
        set((state) => {
          const existingIdx = state.presets.findIndex(p => p.name === name);
          const newItem: SavedQuery = {
            id: existingIdx >= 0 ? state.presets[existingIdx].id : uuidv4(),
            name,
            timestamp: Date.now(),
            activeSchemaId,
            rootGroup: structuredClone(rootGroup),
          };
          
          let newPresets = [...state.presets];
          if (existingIdx >= 0) {
            newPresets.splice(existingIdx, 1);
          }
          newPresets.unshift(newItem);
          
          if (newPresets.length > MAX_HISTORY_ITEMS) {
            newPresets = newPresets.slice(0, MAX_HISTORY_ITEMS);
          }

          return { presets: newPresets };
        }),

      deletePreset: (id) =>
        set((state) => ({
          presets: state.presets.filter((item) => item.id !== id),
        })),
    }),
    {
      name: "realql-history-storage",
    }
  )
);
