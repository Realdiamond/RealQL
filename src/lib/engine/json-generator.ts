/**
 * JSON query generator.
 *
 * Serializes the query tree as formatted JSON for export/import.
 * This provides a portable, human-readable representation of the
 * full query structure.
 */

import type { QueryGroup } from "@/lib/types";

/**
 * Generate a pretty-printed JSON representation of the query tree.
 */
export function generateJSON(root: QueryGroup): string {
  return JSON.stringify(root, null, 2);
}
