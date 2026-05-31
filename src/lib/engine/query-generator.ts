/**
 * Unified query generator interface.
 *
 * Provides a single entry point for generating query output
 * in any supported format. Delegates to the format-specific
 * generators and wraps the result in a QueryOutput object.
 */

import type {
  QueryGroup,
  QueryOutputFormat,
  QueryOutput,
  ValidationError,
} from "@/lib/types";
import type { SchemaField } from "@/lib/types";
import { generateSQL } from "./sql-generator";
import { generateMongoDB } from "./mongo-generator";
import { generateGraphQL } from "./graphql-generator";
import { validateQuery } from "./query-validator";

/**
 * Generate query output in the specified format.
 * Also runs validation and includes errors in the result.
 */
export function generateQuery(
  root: QueryGroup,
  format: QueryOutputFormat,
  tableName: string,
  fields: SchemaField[] = []
): QueryOutput {
  const errors: ValidationError[] = validateQuery(root, fields);
  const hasErrors = errors.some((e) => e.severity === "error");

  let query: string;

  switch (format) {
    case "sql":
      query = generateSQL(root, tableName);
      break;
    case "mongodb":
      query = generateMongoDB(root);
      break;
    case "graphql":
      query = generateGraphQL(root, tableName);
      break;
    default:
      query = "";
  }

  return {
    format,
    query,
    isValid: !hasErrors,
    errors,
  };
}
