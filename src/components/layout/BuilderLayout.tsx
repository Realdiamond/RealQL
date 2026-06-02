"use client";

import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels";
import { QueryBuilder } from "@/components/query-builder/QueryBuilder";
import { QueryPreviewPanel } from "@/components/query-preview/QueryPreviewPanel";
import { QueryResultsPanel } from "@/components/query-results/QueryResultsPanel";

export function BuilderLayout() {
  return (
    <main className="flex flex-col flex-1 w-full h-full overflow-hidden">
      <PanelGroup orientation="vertical">
        {/* Top Half */}
        <Panel defaultSize={50} minSize={20}>
          <PanelGroup orientation="horizontal">
            {/* Top Left: Query Builder */}
            <Panel defaultSize={60} minSize={30}>
              <section className="flex flex-1 flex-col h-full overflow-hidden border-b lg:border-b-0 lg:border-r border-[var(--border)]">
                <QueryBuilder />
              </section>
            </Panel>

            <PanelResizeHandle className="w-[1px] bg-[var(--border)] hover:bg-accent-500 hover:w-1 transition-all flex flex-col justify-center items-center cursor-col-resize z-10 group" />

            {/* Top Right: Preview */}
            <Panel defaultSize={40} minSize={20}>
              <aside className="w-full h-full flex flex-col overflow-hidden bg-[var(--surface-secondary)]">
                <QueryPreviewPanel />
              </aside>
            </Panel>
          </PanelGroup>
        </Panel>

        {/* Horizontal Resizer for the Results Panel */}
        <PanelResizeHandle className="h-[1px] bg-[var(--border)] hover:bg-accent-500 hover:h-1 transition-all flex flex-row justify-center items-center cursor-row-resize z-10 group" />

        {/* Bottom Half: Results */}
        <Panel defaultSize={50} minSize={20}>
          <section className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--surface-secondary)]">
            <QueryResultsPanel />
          </section>
        </Panel>
      </PanelGroup>
    </main>
  );
}
