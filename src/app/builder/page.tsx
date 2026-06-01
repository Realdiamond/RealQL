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
        <main className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Left: Query builder panel */}
          <section
            className="flex flex-1 flex-col overflow-hidden border-b lg:border-b-0 lg:border-r border-[var(--border)]"
            aria-label="Query builder"
          >
            <QueryBuilder />
          </section>

          {/* Right: Preview + Results stacked */}
          <aside
            className="w-full lg:w-[440px] flex flex-col overflow-hidden bg-[var(--surface-secondary)]"
            aria-label="Query output"
          >
            {/* Top: Live query preview */}
            <div className="border-b border-[var(--border)] max-h-[45%] overflow-auto">
              <QueryPreviewPanel />
            </div>

            {/* Bottom: Execution results */}
            <div className="flex-1 overflow-hidden">
              <QueryResultsPanel />
            </div>
          </aside>
        </main>
      </AppShell>
    </>
  );
}

