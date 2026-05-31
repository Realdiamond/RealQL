"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useQueryStore } from "@/lib/store/query-store";
import { useUIStore } from "@/lib/store/ui-store";

export function useKeyboardShortcuts() {
  const { theme, setTheme, systemTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      // Detect modifier key (Cmd on Mac, Ctrl on Windows)
      const isMod = e.metaKey || e.ctrlKey;

      if (!isMod) return;

      // Handle specific combos
      const key = e.key.toLowerCase();

      // mod+enter: Execute query (allowed even in inputs)
      if (key === "enter") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("execute-query"));
        return;
      }

      // If we are in an input, don't trigger other shortcuts
      if (isInput) return;

      switch (key) {
        case "z":
          e.preventDefault();
          if (e.shiftKey) {
            useQueryStore.getState().redo();
          } else {
            useQueryStore.getState().undo();
          }
          break;

        case "s": {
          e.preventDefault();
          useUIStore.getState().setSavePresetDialogOpen(true);
          break;
        }

        case "e":
          e.preventDefault();
          useUIStore.getState().cyclePreviewFormat();
          break;

        case "d": {
          e.preventDefault();
          const currentTheme = resolvedTheme || (theme === "system" ? systemTheme : theme) || "light";
          setTheme(currentTheme === "dark" ? "light" : "dark");
          break;
        }

        case "/": {
          e.preventDefault();
          const uiStore = useUIStore.getState();
          uiStore.setShortcutsDialogOpen(!uiStore.shortcutsDialogOpen);
          break;
        }

        case "g": {
          e.preventDefault();
          const queryStoreG = useQueryStore.getState();
          queryStoreG.addGroup(queryStoreG.rootGroup.id);
          break;
        }

        case "r": {
          e.preventDefault();
          const queryStoreR = useQueryStore.getState();
          queryStoreR.addRule(queryStoreR.rootGroup.id);
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [theme, systemTheme, resolvedTheme, setTheme]);
}
