"use client";

import * as React from "react";
import { useUIStore } from "@/lib/store/ui-store";
import { useQueryStore } from "@/lib/store/query-store";
import { useQueryHistoryStore } from "@/lib/store/query-history-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils/cn";

export function SavePresetDialog() {
  const { open, setOpen } = useUIStore(
    useShallow((state) => ({
      open: state.savePresetDialogOpen,
      setOpen: state.setSavePresetDialogOpen,
    }))
  );

  const rootGroup = useQueryStore((state) => state.rootGroup);
  const savePreset = useQueryHistoryStore((state) => state.savePreset);
  
  const [name, setName] = React.useState("");

  // Reset name when dialog opens
  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName("");
    }
  }, [open]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    
    savePreset(name.trim(), rootGroup);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save as Preset</DialogTitle>
          <DialogDescription>
            Save the current query configuration to quickly load it later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="preset-name" className="text-sm font-medium text-[var(--foreground)]">
              Preset Name
            </label>
            <input
              id="preset-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., High-value active users"
              autoFocus
              className={cn(
                "w-full rounded-md px-3 py-2 text-sm",
                "bg-[var(--surface-hover)] text-[var(--foreground)]",
                "border border-[var(--border)]",
                "focus:outline-none focus:ring-2 focus:ring-[var(--accent-500)] focus:border-transparent",
                "transition-all"
              )}
            />
          </div>
          
          <DialogFooter className="mt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-4 py-2 text-sm font-medium text-[var(--gray-500)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="rounded-md bg-[var(--accent-500)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--accent-600)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save Preset
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
