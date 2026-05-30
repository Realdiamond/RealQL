/**
 * Operator type definitions and metadata.
 *
 * Maps each operator to its label, description, and
 * which field types it's compatible with.
 */

import type { FieldType, OperatorType } from "./index";

export interface OperatorMeta {
  type: OperatorType;
  label: string;
  description: string;
  requiresValue: boolean;
  valueCount: "single" | "dual" | "array" | "none";
  compatibleTypes: FieldType[];
}
