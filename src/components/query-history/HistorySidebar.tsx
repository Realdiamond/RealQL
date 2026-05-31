"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Bookmark, Trash2, Play } from "lucide-react";
import { useUIStore } from "@/lib/store/ui-store";
import { useQueryHistoryStore, type SavedQuery } from "@/lib/store/query-history-store";
import { useQueryStore } from "@/lib/store/query-store";
import { cn } from "@/lib/utils/cn";
import type { QueryGroup } from "@/lib/types";

export function HistorySidebar() {
  const open = useUIStore((state) => state.historySidebarOpen);
  const setOpen = useUIStore((state) => state.setHistorySidebarOpen);
  
  const history = useQueryHistoryStore((state) => state.history);
  const presets = useQueryHistoryStore((state) => state.presets);
  const deletePreset = useQueryHistoryStore((state) => state.deletePreset);
  const clearHistory = useQueryHistoryStore((state) => state.clearHistory);
  
  const loadQuery = useQueryStore((state) => state.loadQuery);

  const activeTab = useUIStore((state) => state.activeHistoryTab || "history");
  const setActiveTab = (tab: string) => useUIStore.setState({ activeHistoryTab: tab });

  // Prevent background scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
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

  function handleLoad(query: SavedQuery) {
    loadQuery(query.rootGroup);
    setOpen(false);
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
                          onClick={clearHistory}
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
                            <button
                              onClick={() => handleLoad(item)}
                              className="opacity-0 group-hover:opacity-100 flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium bg-[var(--accent-100)] text-[var(--accent-700)] dark:bg-[var(--accent-900)]/40 dark:text-[var(--accent-300)] hover:bg-[var(--accent-200)] transition-colors"
                            >
                              <Play size={10} /> Load Query
                            </button>
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
