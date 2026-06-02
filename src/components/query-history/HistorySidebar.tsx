"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Bookmark, Trash2, Play, Download } from "lucide-react";
import { exportJSON } from "@/lib/utils/export-utils";
import { useUIStore } from "@/lib/store/ui-store";
import { useQueryHistoryStore, type SavedQuery } from "@/lib/store/query-history-store";
import { useQueryStore } from "@/lib/store/query-store";
import { cn } from "@/lib/utils/cn";
import type { QueryGroup } from "@/lib/types";
import type { SchemaId } from "@/lib/schemas/registry";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function HistorySidebar() {
  const open = useUIStore((state) => state.historySidebarOpen);
  const setOpen = useUIStore((state) => state.setHistorySidebarOpen);
  const setSavePresetDialogOpen = useUIStore((state) => state.setSavePresetDialogOpen);
  
  const history = useQueryHistoryStore((state) => state.history);
  const presets = useQueryHistoryStore((state) => state.presets);
  const deletePreset = useQueryHistoryStore((state) => state.deletePreset);
  const clearHistory = useQueryHistoryStore((state) => state.clearHistory);
  
  const { loadQuery, setSchema, rootGroup } = useQueryStore();

  const [clearHistoryModalOpen, setClearHistoryModalOpen] = useState(false);
  const [pendingLoadItem, setPendingLoadItem] = useState<SavedQuery | null>(null);

  const activeTab = useUIStore((state) => state.activeHistoryTab || "history");
  const setActiveTab = useUIStore((state) => state.setActiveHistoryTab);

  // Prevent background scroll and handle focus trap when open
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const previouslyFocused = document.activeElement as HTMLElement;

      // Focus first element slightly after mount
      requestAnimationFrame(() => {
        const focusable = sidebarRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable && focusable.length > 0) {
          (focusable[0] as HTMLElement).focus();
        }
      });

      const handleTab = (e: KeyboardEvent) => {
        if (e.key === "Tab" && sidebarRef.current) {
          const focusable = sidebarRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;
          const first = focusable[0] as HTMLElement;
          const last = focusable[focusable.length - 1] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === first) {
              last.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === last) {
              first.focus();
              e.preventDefault();
            }
          }
        }
      };

      window.addEventListener("keydown", handleTab);

      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleTab);
        if (previouslyFocused) {
          previouslyFocused.focus();
        }
      };
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  function executeLoad(query: SavedQuery) {
    if (query.activeSchemaId) {
      setSchema(query.activeSchemaId as SchemaId);
    }
    loadQuery(query.rootGroup);
    setOpen(false);
    setPendingLoadItem(null);
  }

  function handleLoad(query: SavedQuery) {
    if (rootGroup.children.length > 0) {
      setPendingLoadItem(query);
    } else {
      executeLoad(query);
    }
  }

  function handleExportHistoryLog() {
    exportJSON(history, `realql-history-log-${Date.now()}.json`);
  }

  function handleExportHistoryItem(item: SavedQuery) {
    const payload = {
      version: "1.0",
      timestamp: new Date(item.timestamp).toISOString(),
      schemaId: item.activeSchemaId,
      rootGroup: item.rootGroup,
    };
    exportJSON(payload, `realql-preset-${item.timestamp}.json`);
  }

  function handleExportHistoryLog() {
    exportJSON(history, `realql-history-log-${Date.now()}.json`);
  }

  function formatTime(ts: number) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(ts));
  }
  
  function formatDate(ts: number) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(ts));
  }

  function summarizeQuery(group: QueryGroup): string {
    let rulesCount = 0;
    let groupsCount = 0;

    function walk(g: QueryGroup) {
      groupsCount++;
      for (const child of g.children) {
        if (child.type === "group") {
          walk(child);
        } else {
          rulesCount++;
        }
      }
    }
    walk(group);
    // Subtract 1 from groupsCount because we don't count the root group as a nested group
    groupsCount--;

    if (rulesCount === 0) return "Empty Query";
    
    const parts = [];
    parts.push(`${rulesCount} rule${rulesCount === 1 ? "" : "s"}`);
    if (groupsCount > 0) {
      parts.push(`${groupsCount} group${groupsCount === 1 ? "" : "s"}`);
    }
    return parts.join(", ");
  }

  return (
    <>
      <AnimatePresence>
        {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm dark:bg-black/40"
          />

          {/* Sidebar */}
          <motion.div
            ref={sidebarRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-sidebar-title"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <h2 id="history-sidebar-title" className="text-sm font-semibold text-[var(--foreground)]">
                Query History & Presets
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close history sidebar"
                className="rounded-md p-1.5 text-[var(--gray-500)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div role="tablist" className="flex border-b border-[var(--border)] px-4 pt-2">
              <button
                role="tab"
                aria-selected={activeTab === "history"}
                onClick={() => setActiveTab("history")}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
                  activeTab === "history"
                    ? "text-[var(--accent-600)] dark:text-[var(--accent-400)]"
                    : "text-[var(--gray-500)] hover:text-[var(--foreground)]"
                )}
              >
                <Clock size={14} />
                History
                {activeTab === "history" && (
                  <motion.div
                    layoutId="history-tab-indicator"
                    className="absolute -bottom-px left-0 right-0 h-0.5 bg-[var(--accent-500)]"
                  />
                )}
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "presets"}
                onClick={() => setActiveTab("presets")}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
                  activeTab === "presets"
                    ? "text-[var(--accent-600)] dark:text-[var(--accent-400)]"
                    : "text-[var(--gray-500)] hover:text-[var(--foreground)]"
                )}
              >
                <Bookmark size={14} />
                Presets
                {activeTab === "presets" && (
                  <motion.div
                    layoutId="history-tab-indicator"
                    className="absolute -bottom-px left-0 right-0 h-0.5 bg-[var(--accent-500)]"
                  />
                )}
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-2">
              {activeTab === "history" && (
                <div className="space-y-1">
                  {history.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[var(--gray-400)]">
                      <Clock size={24} className="mx-auto mb-2 opacity-50" />
                      No history yet. Execute a query to save it.
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between px-2 py-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--gray-400)]">
                          Recent Executions
                        </span>
                        <button
                          onClick={() => setClearHistoryModalOpen(true)}
                          className="text-[10px] font-medium text-[var(--gray-500)] hover:text-[var(--danger)]"
                        >
                          Clear All
                        </button>
                      </div>
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="group flex flex-col gap-1 rounded-lg border border-transparent p-3 hover:border-[var(--border)] hover:bg-[var(--surface-hover)] hover:shadow-sm transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-[var(--foreground)]">
                              {summarizeQuery(item.rootGroup)}
                            </span>
                            <span className="text-[10px] text-[var(--gray-400)]">
                              {formatTime(item.timestamp)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-[var(--gray-500)]">
                              {formatDate(item.timestamp)}
                            </span>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSavePresetDialogOpen(true, item.rootGroup, item.activeSchemaId);
                                }}
                                className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium bg-[var(--surface)] border border-[var(--border)] text-[var(--gray-600)] hover:bg-[var(--surface-tertiary)] transition-colors"
                                title="Save to Presets"
                                aria-label="Save to Presets"
                              >
                                <Bookmark size={10} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExportHistoryItem(item);
                                }}
                                className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium bg-[var(--surface)] border border-[var(--border)] text-[var(--gray-600)] hover:bg-[var(--surface-tertiary)] transition-colors"
                                title="Export as Preset"
                                aria-label="Export as Preset"
                              >
                                <Download size={10} />
                              </button>
                              <button
                                onClick={() => handleLoad(item)}
                                className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium bg-[var(--accent-100)] text-[var(--accent-700)] dark:bg-[var(--accent-900)]/40 dark:text-[var(--accent-300)] hover:bg-[var(--accent-200)] transition-colors"
                              >
                                <Play size={10} /> Load Query
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {activeTab === "presets" && (
                <div className="space-y-1">
                  {presets.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[var(--gray-400)]">
                      <Bookmark size={24} className="mx-auto mb-2 opacity-50" />
                      No saved presets. Save a preset using ⌘ S.
                    </div>
                  ) : (
                    <>
                      <div className="px-2 py-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--gray-400)]">
                          Saved Presets
                        </span>
                      </div>
                      {presets.map((item) => (
                        <div
                          key={item.id}
                          className="group flex flex-col gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm hover:border-[var(--accent-300)] dark:hover:border-[var(--accent-700)] transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-[var(--foreground)]">
                              {item.name || "Untitled Preset"}
                            </span>
                            <button
                              onClick={() => deletePreset(item.id)}
                              className="text-[var(--gray-400)] hover:text-[var(--danger)] transition-colors"
                              title="Delete preset"
                              aria-label="Delete preset"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="text-[11px] text-[var(--gray-500)] mt-0.5">
                            {summarizeQuery(item.rootGroup)}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-[var(--gray-400)]">
                              Saved {formatDate(item.timestamp)}
                            </span>
                            <button
                              onClick={() => handleLoad(item)}
                              className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium bg-[var(--accent-100)] text-[var(--accent-700)] dark:bg-[var(--accent-900)]/40 dark:text-[var(--accent-300)] hover:bg-[var(--accent-200)] transition-colors"
                            >
                              <Play size={10} /> Load Preset
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* Export History Log footer */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-secondary)]">
              <button
                onClick={handleExportHistoryLog}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--surface)] border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-tertiary)] hover:border-[var(--gray-300)] transition-colors"
                title="Download your entire execution history as a JSON file"
              >
                <Download className="h-4 w-4" />
                Export History Log
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

      <Dialog open={clearHistoryModalOpen} onOpenChange={setClearHistoryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clear History?</DialogTitle>
            <DialogDescription>
              This will permanently delete your entire execution history. Your saved presets will not be affected. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <button
              onClick={() => setClearHistoryModalOpen(false)}
              className="rounded-md px-4 py-2 text-sm font-medium text-[var(--gray-500)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                clearHistory();
                setClearHistoryModalOpen(false);
              }}
              className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-600 transition-colors"
            >
              Clear History
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!pendingLoadItem} onOpenChange={(open) => !open && setPendingLoadItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Overwrite Current Query?</DialogTitle>
            <DialogDescription>
              Loading this preset will replace your current query and clear all unsaved changes. Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <button
              onClick={() => setPendingLoadItem(null)}
              className="rounded-md px-4 py-2 text-sm font-medium text-[var(--gray-500)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (pendingLoadItem) executeLoad(pendingLoadItem);
              }}
              className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-600 transition-colors"
            >
              Overwrite
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
