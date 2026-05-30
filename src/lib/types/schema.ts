/**
 * Schema type definitions for data source configuration.
 *
 * Schemas define the structure of a data source — its fields, types,
 * and constraints. The query builder uses these to render the right
 * input controls and filter valid operators.
 */

export type FieldType = "string" | "number" | "enum" | "date" | "boolean";

export interface SchemaField {
  name: string;
  label: string;
  type: FieldType;
  enumValues?: string[];
  description?: string;
}

export interface DataSchema {
  id: string;
  name: string;
  label: string;
  description: string;
  icon: string;
  fields: SchemaField[];
}
