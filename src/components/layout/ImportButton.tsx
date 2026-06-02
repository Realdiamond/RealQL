"use client";

import { Upload, FileJson } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useQueryStore } from "@/lib/store/query-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";
import type { QueryGroup } from "@/lib/types";
import type { SchemaId } from "@/lib/schemas/registry";

interface ImportPayload {
  rootGroup: QueryGroup;
  schemaId?: SchemaId;
}

export function ImportButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { loadQuery, rootGroup, setSchema } = useQueryStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingImportPayload, setPendingImportPayload] = useState<ImportPayload | null>(null);

  const processFile = (file: File) => {
    if (!file.name.endsWith(".json")) {
      toast.error("Please upload a valid .json file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const payload = JSON.parse(event.target?.result as string);
        if (!payload.rootGroup) {
          throw new Error("Invalid RealQL preset format");
        }

        if (rootGroup.children.length > 0) {
          setPendingImportPayload(payload);
        } else {
          executeImport(payload);
        }
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

  const executeImport = (payload: ImportPayload) => {
    if (payload.schemaId) {
      setSchema(payload.schemaId);
    }
    loadQuery(payload.rootGroup);
    toast.success("Preset imported successfully");
    setIsOpen(false);
    setPendingImportPayload(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-8 items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface-secondary)] px-3 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-tertiary)] transition-colors"
        title="Import Preset"
        aria-label="Import Preset"
      >
        <Upload className="h-3.5 w-3.5" />
        Import
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Preset</DialogTitle>
          <DialogDescription>
            Upload a RealQL JSON preset file to restore a previous workspace.
          </DialogDescription>
        </DialogHeader>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-all cursor-pointer",
            isDragging
              ? "border-[var(--accent-500)] bg-[var(--accent-50)] dark:bg-[var(--accent-900)]/20"
              : "border-[var(--border)] bg-[var(--surface-secondary)] hover:border-[var(--gray-400)] hover:bg-[var(--surface-tertiary)]"
          )}
        >
          <div className="rounded-full bg-[var(--surface)] p-3 shadow-sm mb-4">
            <FileJson
              className={cn(
                "h-6 w-6 transition-colors",
                isDragging ? "text-[var(--accent-500)]" : "text-[var(--gray-500)]"
              )}
            />
          </div>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Click or drag file to this area to upload
          </h3>
          <p className="mt-1 text-xs text-[var(--gray-500)]">
            Only .json files are supported
          </p>
        </div>


          <input
            type="file"
            accept=".json"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!pendingImportPayload} onOpenChange={(open) => !open && setPendingImportPayload(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Overwrite Current Query?</DialogTitle>
            <DialogDescription>
              Importing this preset will replace your current query and clear all unsaved changes. Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <button
              onClick={() => setPendingImportPayload(null)}
              className="rounded-md px-4 py-2 text-sm font-medium text-[var(--gray-500)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (pendingImportPayload) {
                  executeImport(pendingImportPayload);
                }
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
