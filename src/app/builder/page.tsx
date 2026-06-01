import { Header } from "@/components/layout/Header";
import { AppShell } from "@/components/layout/AppShell";
import { QueryBuilder } from "@/components/query-builder/QueryBuilder";
import { QueryPreviewPanel } from "@/components/query-preview/QueryPreviewPanel";
import { QueryResultsPanel } from "@/components/query-results/QueryResultsPanel";

export const metadata = {
  title: "RealQL — Visual Query Builder",
  description:
    "Build complex database queries visually. Select a schema, add conditions, nest logic, and preview the generated query in real time.",
};

export default function Home() {
  return (
    <>
      <Header />
      <AppShell>
        <main className="flex flex-col flex-1 overflow-hidden">
          {/* Top half: Builder & Preview */}
          <div className="flex flex-col lg:flex-row h-[50%] lg:h-[55%] border-b border-[var(--border)]">
            {/* Top Left: Query builder panel */}
            <section
              className="flex flex-1 flex-col overflow-hidden border-b lg:border-b-0 lg:border-r border-[var(--border)]"
              aria-label="Query builder"
            >
              <QueryBuilder />
            </section>

            {/* Top Right: Live query preview */}
            <aside
              className="w-full lg:w-[440px] xl:w-[500px] flex flex-col overflow-hidden bg-[var(--surface-secondary)]"
              aria-label="Query preview"
            >
              <QueryPreviewPanel />
            </aside>
          </div>

          {/* Bottom half: Full width Execution results */}
          <section
            className="flex-1 flex flex-col overflow-hidden bg-[var(--surface-secondary)]"
            aria-label="Query execution results"
          >
            <QueryResultsPanel />
          </section>
        </main>
      </AppShell>
    </>
  );
}

