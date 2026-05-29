import { type ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {children}
    </div>
  );
}
