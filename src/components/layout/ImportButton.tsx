"use client";

import { Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { useQueryStore } from "@/lib/store/query-store";

export function ImportButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadQuery = useQueryStore((state) => state.loadQuery);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const payload = JSON.parse(event.target?.result as string);
        if (!payload.rootGroup || !payload.schemaId) {
          throw new Error("Invalid RealQL preset format");
        }

        loadQuery(payload.rootGroup);
        toast.success("Preset imported successfully");
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to import file");
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset input
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <input
        type="file"
        accept=".json,.realql"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex h-8 items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface-secondary)] px-3 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-tertiary)] transition-colors"
        title="Import Preset"
        aria-label="Import Preset"
      >
        <Upload className="h-3.5 w-3.5" />
        Import
      </button>
    </>
  );
}
