import { Header } from "@/components/layout/Header";
import { AppShell } from "@/components/layout/AppShell";
import { BuilderLayout } from "@/components/layout/BuilderLayout";

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
        <BuilderLayout />
      </AppShell>
    </>
  );
}

