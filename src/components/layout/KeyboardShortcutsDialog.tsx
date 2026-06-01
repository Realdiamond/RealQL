"use client";

import * as React from "react";
import { useUIStore } from "@/lib/store/ui-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { KEYBOARD_SHORTCUTS } from "@/lib/constants/keyboard-shortcuts";
import { useShallow } from "zustand/react/shallow";

export function KeyboardShortcutsDialog() {
  const { open, setOpen } = useUIStore(
    useShallow((state) => ({
      open: state.shortcutsDialogOpen,
      setOpen: state.setShortcutsDialogOpen,
    }))
  );

  // Group shortcuts by category
  const queryShortcuts = KEYBOARD_SHORTCUTS.filter((s) => s.category === "query");
  const viewShortcuts = KEYBOARD_SHORTCUTS.filter((s) => s.category === "view");
  const generalShortcuts = KEYBOARD_SHORTCUTS.filter((s) => s.category === "general");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Work faster with these helpful global shortcuts.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-2">
          <ShortcutSection title="Query Builder" shortcuts={queryShortcuts} />
          <ShortcutSection title="View Options" shortcuts={viewShortcuts} />
          <ShortcutSection title="General" shortcuts={generalShortcuts} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShortcutSection({
  title,
  shortcuts,
}: {
  title: string;
  shortcuts: typeof KEYBOARD_SHORTCUTS;
}) {
  const [mounted, setMounted] = React.useState(false);
  const [isMac, setIsMac] = React.useState(true);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setIsMac(typeof window !== "undefined" && navigator.userAgent.includes("Mac"));
  }, []);

  if (shortcuts.length === 0) return null;
  if (!mounted) return null; // Prevent hydration mismatch flash

  const formatKey = (key: string) => {
    if (!isMac) {
      if (key === "⌘") return "Ctrl";
      if (key === "⇧") return "Shift";
      if (key === "⌥") return "Alt";
    }
    return key;
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-[var(--gray-500)] uppercase tracking-wider">
        {title}
      </h3>
      <div className="flex flex-col gap-2">
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.id}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-[var(--gray-700)] dark:text-[var(--gray-300)]">
              {shortcut.description}
            </span>
            <div className="flex items-center gap-1">
              {shortcut.label.split(" ").map((keyLabel, i) => (
                <kbd
                  key={i}
                  className="inline-flex min-w-[24px] items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-secondary)] px-1.5 py-0.5 text-xs font-mono text-[var(--foreground)] font-medium shadow-sm"
                >
                  {formatKey(keyLabel)}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
