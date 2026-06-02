"use client";

/**
 * CodeBlock — syntax-highlighted, copyable code preview.
 *
 * Uses Shiki for premium, VS Code quality syntax highlighting.
 * Loads asynchronously to prevent client-side blocking.
 */

import { useState, useCallback, useEffect } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import type { QueryOutputFormat } from "@/lib/types";
import { codeToHtml } from "shiki";

interface CodeBlockProps {
  code: string;
  format: QueryOutputFormat;
}

export function CodeBlock({ code, format }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [html, setHtml] = useState<string>("");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Query copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      toast.success("Query copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  useEffect(() => {
    let isMounted = true;
    async function highlight() {
      try {
        const lang = format === "mongodb" ? "json" : format;
        const result = await codeToHtml(code, {
          lang,
          theme: "vitesse-dark",
        });
        if (isMounted) setHtml(result);
      } catch {
        // Fallback if language fails to load
        if (isMounted) setHtml(`<pre><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`);
      }
    }
    highlight();
    return () => {
      isMounted = false;
    };
  }, [code, format]);

  return (
    <div className="relative group">
      {/* Copy button — appears on hover */}
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          "absolute top-2 right-2 z-10",
          "inline-flex items-center gap-1.5",
          "px-2 py-1 rounded-md text-xs font-medium",
          "bg-[var(--surface)] border border-[var(--border)]",
          "text-[var(--gray-400)] hover:text-[var(--foreground)]",
          "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 group-focus-within:opacity-100",
          "transition-all duration-150",
          copied && "opacity-100 text-[var(--color-success)]"
        )}
        aria-label={copied ? "Copied!" : "Copy to clipboard"}
      >
        {copied ? (
          <>
            <Check className="h-3 w-3" aria-hidden="true" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" aria-hidden="true" />
            <span>Copy</span>
          </>
        )}
      </button>

      {/* Code display */}
      <div
        className={cn(
          "p-4 rounded-lg overflow-x-auto",
          "bg-[#121212] border border-[var(--border)]",
          "font-mono text-sm leading-relaxed",
          "[&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!m-0"
        )}
        dangerouslySetInnerHTML={{ __html: html || `<pre><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>` }}
      />
    </div>
  );
}
