import { Header } from "@/components/layout/Header";
import { AppShell } from "@/components/layout/AppShell";

export default function Home() {
  return (
    <>
      <Header />
      <AppShell>
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              Visual Query Builder
            </h1>
            <p className="max-w-md text-sm text-[var(--gray-500)]">
              Build complex database queries visually. Select a schema, add
              conditions, nest logic, and preview the generated query in
              real time.
            </p>
          </div>
          <div className="mt-2 rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-secondary)] px-8 py-12 text-center">
            <p className="text-sm text-[var(--gray-400)]">
              Query builder will be rendered here
            </p>
          </div>
        </main>
      </AppShell>
    </>
  );
}
