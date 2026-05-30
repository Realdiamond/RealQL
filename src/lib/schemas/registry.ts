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

export const SCHEMA_DATA: Record<string, Record<string, unknown>[]> = {
  users: usersData,
  products: productsData,
  orders: ordersData,
};

/**
 * Look up a schema by its ID.
 */
export function getSchema(schemaId: string): DataSchema | undefined {
  return SCHEMAS.find((s) => s.id === schemaId);
}

/**
 * Get mock dataset for a schema.
 */
export function getSchemaData(schemaId: string): Record<string, unknown>[] {
  return SCHEMA_DATA[schemaId] ?? [];
}

/**
 * Get the default schema (first registered).
 */
export function getDefaultSchema(): DataSchema {
  return SCHEMAS[0];
}
