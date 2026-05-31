import { Header } from "@/components/layout/Header";
import { AppShell } from "@/components/layout/AppShell";
import { QueryBuilder } from "@/components/query-builder/QueryBuilder";

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

          {/* Right: Preview panel placeholder (PR 7) */}
          <aside
            className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l border-[var(--border)] flex flex-col overflow-hidden bg-[var(--surface-secondary)]"
            aria-label="Query preview"
          >
            <div className="px-4 py-3 border-b border-[var(--border)]">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
                Query Preview
              </p>
            </div>
            <div className="flex flex-1 items-center justify-center p-6">
              <p className="text-sm text-[var(--gray-400)] text-center">
                Query preview will appear here
              </p>
            </div>
          </aside>
        </main>
      </AppShell>
    </>
  );
}
