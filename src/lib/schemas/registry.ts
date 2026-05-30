/**
 * Schema registry — single source of truth for all available data schemas.
 *
 * Components use this to populate the schema selector dropdown
 * and look up field definitions for the active schema.
 */

import type { DataSchema } from "@/lib/types";
import { usersSchema, usersData } from "./users.schema";
import { productsSchema, productsData } from "./products.schema";
import { ordersSchema, ordersData } from "./orders.schema";

export const SCHEMAS: DataSchema[] = [usersSchema, productsSchema, ordersSchema];

export type SchemaId = "users" | "products" | "orders";

export const SCHEMA_DATA: Record<SchemaId, Record<string, unknown>[]> = {
  users: usersData,
  products: productsData,
  orders: ordersData,
};

/**
 * Look up a schema by its ID.
 */
export function getSchema(schemaId: SchemaId): DataSchema | undefined {
  return SCHEMAS.find((s) => s.id === schemaId);
}

/**
 * Get mock dataset for a schema.
 */
export function getSchemaData(schemaId: SchemaId): Record<string, unknown>[] {
  return SCHEMA_DATA[schemaId] ?? [];
}

/**
 * Get the default schema (first registered).
 */
export function getDefaultSchema(): DataSchema {
  if (SCHEMAS.length === 0) {
    throw new Error("No schemas registered in the registry.");
  }
  return SCHEMAS[0];
}
