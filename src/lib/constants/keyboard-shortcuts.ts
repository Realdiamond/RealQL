/**
 * Keyboard shortcut definitions.
 *
 * Each shortcut maps a key combo to an action identifier.
 * The hook reads this to wire global event listeners.
 */

export interface KeyboardShortcut {
  id: string;
  keys: string[];
  label: string;
  description: string;
  category: "query" | "view" | "general";
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  {
    id: "execute-query",
    keys: ["mod+Enter"],
    label: "⌘ Enter",
    description: "Execute query",
    category: "query",
  },
  {
    id: "save-preset",
    keys: ["mod+s"],
    label: "⌘ S",
    description: "Save as preset",
    category: "query",
  },
  {
    id: "undo",
    keys: ["mod+z"],
    label: "⌘ Z",
    description: "Undo",
    category: "query",
  },
  {
    id: "redo",
    keys: ["mod+shift+z"],
    label: "⌘ ⇧ Z",
    description: "Redo",
    category: "query",
  },
  {
    id: "cycle-preview",
    keys: ["mod+e"],
    label: "⌘ E",
    description: "Cycle preview format",
    category: "view",
  },
  {
    id: "toggle-theme",
    keys: ["mod+d"],
    label: "⌘ D",
    description: "Toggle dark/light mode",
    category: "view",
  },
  {
    id: "show-shortcuts",
    keys: ["mod+/"],
    label: "⌘ /",
    description: "Show keyboard shortcuts",
    category: "general",
  },
  {
    id: "add-group",
    keys: ["mod+g"],
    label: "⌘ G",
    description: "Add group to root",
    category: "query",
  },
  {
    id: "add-rule",
    keys: ["mod+r"],
    label: "⌘ R",
    description: "Add rule to root",
    category: "query",
  },
];
