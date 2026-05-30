import { nanoid } from "nanoid";

/**
 * Generate a unique identifier for query nodes.
 * Uses nanoid with a 12-char length for compact yet collision-safe IDs.
 */
export function generateId(): string {
  return nanoid(12);
}
