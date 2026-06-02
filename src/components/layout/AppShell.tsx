"use client";

import { type ReactNode } from "react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog";
import { HistorySidebar } from "@/components/query-history/HistorySidebar";
import { SavePresetDialog } from "@/components/query-history/SavePresetDialog";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  // Mount global keyboard shortcuts listener
  useKeyboardShortcuts();

  return (
    <>
      <div className="flex flex-col w-full h-[calc(100vh-3.5rem)] overflow-hidden">
        {children}
      </div>
      <KeyboardShortcutsDialog />
      <SavePresetDialog />
      <HistorySidebar />
    </>
  );
}
