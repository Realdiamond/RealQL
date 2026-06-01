"use client";

import { Layers, Keyboard, Clock } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useUIStore } from "@/lib/store/ui-store";

export function Header() {
  const setShortcutsDialogOpen = useUIStore((state) => state.setShortcutsDialogOpen);
  const setHistorySidebarOpen = useUIStore((state) => state.setHistorySidebarOpen);

  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-600 text-white">
          <Layers className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[15px] font-semibold tracking-tight text-[var(--foreground)]">
            RealQL
          </span>
          <span className="rounded-full bg-accent-100 px-2 py-0.5 text-[10px] font-medium text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">
            Beta
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setHistorySidebarOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--gray-500)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] transition-colors"
          title="History & Presets"
          aria-label="History & Presets"
        >
          <Clock className="h-[18px] w-[18px]" />
        </button>
        <button
          onClick={() => setShortcutsDialogOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--gray-500)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] transition-colors"
          title="Keyboard shortcuts (⌘ /)"
          aria-label="Keyboard shortcuts"
        >
          <Keyboard className="h-[18px] w-[18px]" />
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
