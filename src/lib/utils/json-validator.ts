/**
 * JSON Validator — Zod schema for validating imported query trees.
 *
 * Ensures imported JSON strictly matches our QueryGroup/QueryRule
 * type definitions before being loaded into the query store.
 * Rejects unknown operators, malformed structures, and excessive
 * nesting depth to prevent stack overflow and broken state.
 */

import { z } from "zod";

const MAX_IMPORT_DEPTH = 20;

/**
 * All valid operator strings — mirrors OperatorType in query.ts.
 */
const VALID_OPERATORS = [
  "equals",
  "not_equals",
  "contains",
  "not_contains",
  "starts_with",
  "ends_with",
  "greater_than",
  "greater_than_or_equal",
  "less_than",
  "less_than_or_equal",
  "in_array",
  "not_in_array",
  "between",
  "is_null",
  "is_not_null",
  "regex",
  "before",
  "after",
] as const;

/**
 * Schema for a single query rule (leaf node).
 */
const queryRuleSchema = z.object({
  id: z.string().min(1, "Rule must have an id"),
  type: z.literal("rule"),
  field: z.string(),
  operator: z.enum(VALID_OPERATORS, {
    message: "Invalid operator. Expected a valid RealQL operator.",
  }),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.union([z.string(), z.number()])),
    z.tuple([z.string(), z.string()]),
    z.tuple([z.number(), z.number()]),
    z.null(),
  ]),
  disabled: z.boolean().optional(),
});

/**
 * Recursive schema for a query group (container node).
 * Uses a depth-limited lazy schema to prevent infinite recursion.
 */
function createGroupSchema(currentDepth: number): z.ZodType {
  if (currentDepth > MAX_IMPORT_DEPTH) {
    return z.never({
      message: `Query nesting exceeds maximum depth of ${MAX_IMPORT_DEPTH}`,
    });
  }

  const childSchema: z.ZodType = z.lazy(() => {
    if (currentDepth + 1 > MAX_IMPORT_DEPTH) {
      return queryRuleSchema;
    }
    return z.discriminatedUnion("type", [
      queryRuleSchema,
      createGroupSchema(currentDepth + 1) as z.ZodObject<z.ZodRawShape>,
    ]);
  });

  return z.object({
    id: z.string().min(1, "Group must have an id"),
    type: z.literal("group"),
    combinator: z.enum(["AND", "OR"], {
      message: "Combinator must be 'AND' or 'OR'",
    }),
    children: z.array(childSchema),
    collapsed: z.boolean(),
    negated: z.boolean().optional(),
  });
}

/**
 * The root validator schema — expects a QueryGroup at the top level.
 */
export const queryTreeSchema = createGroupSchema(0);

/**
 * Validate an unknown value against the query tree schema.
 * Returns a typed result with either the parsed data or error details.
 */
export function validateQueryJSON(data: unknown): {
  success: boolean;
  data?: unknown;
  error?: string;
} {
  // Basic type guards before parsing
  if (data === null || data === undefined) {
    return { success: false, error: "Import data is empty" };
  }

  if (typeof data !== "object") {
    return {
      success: false,
      error: "Invalid query file. Expected a RealQL query export.",
    };
  }

  if (Array.isArray(data)) {
    return {
      success: false,
      error: "Invalid query file. Expected a query group object, not an array.",
    };
  }

  const record = data as Record<string, unknown>;

  // Quick structural check before expensive Zod parsing
  if (record.type !== "group") {
    return {
      success: false,
      error: "Invalid query file. Expected a RealQL query export.",
    };
  }

  const result = queryTreeSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Extract the first meaningful error message
  const firstError = result.error.issues[0];
  const path = firstError.path.length > 0 ? ` at ${firstError.path.join(".")}` : "";
  return {
    success: false,
    error: `Invalid query structure${path}: ${firstError.message}`,
  };
}
