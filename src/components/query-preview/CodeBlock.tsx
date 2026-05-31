"use client";

/**
 * CodeBlock — syntax-highlighted, copyable code preview.
 *
 * Renders generated query strings with basic keyword highlighting
 * and a one-click copy button. No external syntax highlighter
 * dependency — we use a lightweight regex-based approach that
 * handles SQL, MongoDB, and GraphQL keywords cleanly.
 */

import { useState, useCallback, useMemo } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { QueryOutputFormat } from "@/lib/types";

interface CodeBlockProps {
  code: string;
  format: QueryOutputFormat;
}

// Keyword sets for each format
const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "IN", "BETWEEN",
  "LIKE", "IS", "NULL", "TRUE", "FALSE", "REGEXP", "ORDER", "BY",
  "ASC", "DESC", "LIMIT", "OFFSET", "JOIN", "ON", "GROUP", "HAVING",
];

const GRAPHQL_KEYWORDS = [
  "query", "mutation", "subscription", "fragment", "where", "order_by",
  "limit", "offset", "true", "false", "null",
];

export function CodeBlock({ code, format }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
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
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  const highlighted = useMemo(() => highlightCode(code, format), [code, format]);

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
          copied && "opacity-100 text-[var(--success)]"
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
      <pre
        className={cn(
          "p-4 rounded-lg overflow-x-auto",
          "bg-[var(--surface)] border border-[var(--border)]",
          "font-mono text-sm leading-relaxed",
          "text-[var(--foreground)]"
        )}
      >
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}

/**
 * Lightweight keyword-based syntax highlighting.
 * Returns HTML string with <span> wrappers for colored tokens.
 */
function highlightCode(code: string, format: QueryOutputFormat): string {
  // HTML-escape the code first
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  switch (format) {
    case "sql":
      return highlightSQL(escaped);
    case "mongodb":
      return highlightJSON(escaped);
    case "graphql":
      return highlightGraphQL(escaped);
    default:
      return escaped;
  }
}

function highlightSQL(code: string): string {
  let result = code;

  // Highlight SQL keywords (case-insensitive, whole words)
  for (const kw of SQL_KEYWORDS) {
    const regex = new RegExp(`\\b(${kw})\\b`, "gi");
    result = result.replace(
      regex,
      '<span style="color: var(--indigo-400); font-weight: 600;">$1</span>'
    );
  }

  // Highlight string literals (single-quoted)
  result = result.replace(
    /&#39;([^&#]*?)&#39;|'([^']*?)'/g,
    '<span style="color: var(--success);">\'$1$2\'</span>'
  );

  // Highlight numbers
  result = result.replace(
    /\b(\d+(?:\.\d+)?)\b/g,
    '<span style="color: var(--warning);">$1</span>'
  );

  return result;
}

function highlightJSON(code: string): string {
  let result = code;

  // Highlight JSON keys (MongoDB operators like $and, $or, $eq, etc.)
  result = result.replace(
    /&quot;(\$\w+)&quot;/g,
    '&quot;<span style="color: var(--indigo-400); font-weight: 600;">$1</span>&quot;'
  );

  // Highlight regular JSON keys
  result = result.replace(
    /&quot;([^$&][^&]*?)&quot;(?=\s*:)/g,
    '&quot;<span style="color: var(--foreground);">$1</span>&quot;'
  );

  // Highlight string values
  result = result.replace(
    /:\s*&quot;([^&]*?)&quot;/g,
    ': &quot;<span style="color: var(--success);">$1</span>&quot;'
  );

  // Highlight numbers
  result = result.replace(
    /:\s*(\d+(?:\.\d+)?)/g,
    ': <span style="color: var(--warning);">$1</span>'
  );

  // Highlight booleans and null
  result = result.replace(
    /\b(true|false|null)\b/g,
    '<span style="color: var(--indigo-400);">$1</span>'
  );

  return result;
}

function highlightGraphQL(code: string): string {
  let result = code;

  // Highlight GraphQL keywords
  for (const kw of GRAPHQL_KEYWORDS) {
    const regex = new RegExp(`\\b(${kw})\\b`, "g");
    result = result.replace(
      regex,
      '<span style="color: var(--indigo-400); font-weight: 600;">$1</span>'
    );
  }

  // Highlight Hasura-style operators (_eq, _gt, _and, _or, etc.)
  result = result.replace(
    /\b(_\w+)\b/g,
    '<span style="color: var(--warning);">$1</span>'
  );

  // Highlight string values
  result = result.replace(
    /&quot;([^&]*?)&quot;/g,
    '&quot;<span style="color: var(--success);">$1</span>&quot;'
  );

  // Highlight numbers
  result = result.replace(
    /(?<=:\s)(\d+(?:\.\d+)?)\b/g,
    '<span style="color: var(--warning);">$1</span>'
  );

  return result;
}
