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
    case "json":
      return highlightJSON(escaped);
    case "graphql":
      return highlightGraphQL(escaped);
    default:
      return escaped;
  }
}

function highlightSQL(code: string): string {
  const keywords = SQL_KEYWORDS.join("|");
  const regex = new RegExp(`(&#39;.*?&#39;|'.*?')|(\\b(?:${keywords})\\b)|(\\b\\d+(?:\\.\\d+)?\\b)`, "gi");

  return code.replace(regex, (match, str, kw, num) => {
    if (str) return `<span style="color: var(--success);">${str}</span>`;
    if (kw) return `<span style="color: var(--indigo-400); font-weight: 600;">${kw}</span>`;
    if (num) return `<span style="color: var(--color-warning);">${num}</span>`;
    return match;
  });
}

function highlightJSON(code: string): string {
  // 1: MongoDB Operator Key, 2: Regular Key, 3: String Value, 4: Number, 5: Boolean/Null
  const regex = /(&quot;\$\w+&quot;(?=\s*:))|(&quot;[^&]*?&quot;(?=\s*:))|(&quot;[^&]*?&quot;)|(\b\d+(?:\.\d+)?\b)|\b(true|false|null)\b/gi;

  return code.replace(regex, (match, opKey, regKey, strVal, num, bool) => {
    if (opKey) return `<span style="color: var(--indigo-400); font-weight: 600;">${opKey}</span>`;
    if (regKey) return `<span style="color: var(--foreground);">${regKey}</span>`;
    if (strVal) return `<span style="color: var(--success);">${strVal}</span>`;
    if (num) return `<span style="color: var(--color-warning);">${num}</span>`;
    if (bool) return `<span style="color: var(--indigo-400);">${bool}</span>`;
    return match;
  });
}

function highlightGraphQL(code: string): string {
  const keywords = GRAPHQL_KEYWORDS.join("|");
  // 1: String, 2: Keyword, 3: Hasura operator, 4: Number
  const regex = new RegExp(`(&quot;[^&]*?&quot;)|(\\b(?:${keywords})\\b)|(\\b_\\w+\\b)|(\\b\\d+(?:\\.\\d+)?\\b)`, "gi");

  return code.replace(regex, (match, str, kw, op, num) => {
    if (str) return `<span style="color: var(--success);">${str}</span>`;
    if (kw) return `<span style="color: var(--indigo-400); font-weight: 600;">${kw}</span>`;
    if (op) return `<span style="color: var(--color-warning);">${op}</span>`;
    if (num) return `<span style="color: var(--color-warning);">${num}</span>`;
    return match;
  });
}
