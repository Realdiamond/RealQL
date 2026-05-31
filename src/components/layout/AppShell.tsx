"use client";

import { type ReactNode } from "react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  // Mount global keyboard shortcuts listener
  useKeyboardShortcuts();

  return (
    <>
      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
        {children}
      </div>
      <KeyboardShortcutsDialog />
    </>
  );
}
