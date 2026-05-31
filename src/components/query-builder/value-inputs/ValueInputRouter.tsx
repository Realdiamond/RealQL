"use client";

/**
 * ValueInputRouter — dynamic value input dispatcher.
 *
 * This component decides which specialized value input to render
 * based on the current field type, operator, and schema metadata.
 * It's the single point that connects the type system to the UI.
 *
 * Routing logic:
 * - requiresValue=false (is_null/is_not_null) → no input
 * - valueCount="dual" (between) → RangeValueInput
 * - valueCount="array" (in/not_in) → ArrayValueInput
 * - boolean field → BooleanValueInput
 * - enum field → EnumValueInput
 * - date field → DateValueInput
 * - number field → NumberValueInput
 * - string field (default) → TextValueInput
 */

import type { FieldType, OperatorType, RuleValue } from "@/lib/types";
import { getOperatorMeta } from "@/lib/constants/operators";
import { TextValueInput } from "./TextValueInput";
import { NumberValueInput } from "./NumberValueInput";
import { DateValueInput } from "./DateValueInput";
import { EnumValueInput } from "./EnumValueInput";
import { BooleanValueInput } from "./BooleanValueInput";
import { ArrayValueInput } from "./ArrayValueInput";
import { RangeValueInput } from "./RangeValueInput";

interface ValueInputRouterProps {
  value: RuleValue;
  fieldType: FieldType | null;
  operator: OperatorType;
  enumValues?: string[];
  disabled?: boolean;
  onChange: (value: RuleValue) => void;
}

export function ValueInputRouter({
  value,
  fieldType,
  operator,
  enumValues,
  disabled,
  onChange,
}: ValueInputRouterProps) {
  const operatorMeta = getOperatorMeta(operator);

  // Operators that don't need a value (is_null, is_not_null)
  if (!operatorMeta || operatorMeta.requiresValue === false) {
    return null;
  }

  // Between → dual range input
  if (operatorMeta.valueCount === "dual") {
    const rangeValue = Array.isArray(value) && value.length === 2
      ? (value as [string, string] | [number, number])
      : null;
    return (
      <RangeValueInput
        value={rangeValue}
        fieldType={fieldType ?? "number"}
        disabled={disabled}
        onChange={onChange}
      />
    );
  }

  // In / Not In → array tag input
  if (operatorMeta.valueCount === "array") {
    const arrayValue = Array.isArray(value) ? (value as string[]) : [];
    return (
      <ArrayValueInput
        value={arrayValue}
        enumValues={fieldType === "enum" ? enumValues : undefined}
        disabled={disabled}
        onChange={onChange}
      />
    );
  }

  // No field type selected yet → generic text fallback
  if (!fieldType) {
    return (
      <TextValueInput
        value={typeof value === "string" ? value : String(value ?? "")}
        disabled={disabled}
        onChange={onChange}
      />
    );
  }

  // Route by field type
  switch (fieldType) {
    case "boolean":
      return (
        <BooleanValueInput
          value={typeof value === "boolean" ? value : value === "true"}
          disabled={disabled}
          onChange={onChange}
        />
      );

    case "enum":
      return (
        <EnumValueInput
          value={typeof value === "string" ? value : ""}
          enumValues={enumValues ?? []}
          disabled={disabled}
          onChange={onChange}
        />
      );

    case "date":
      return (
        <DateValueInput
          value={typeof value === "string" ? value : ""}
          disabled={disabled}
          onChange={onChange}
        />
      );

    case "number":
      return (
        <NumberValueInput
          value={typeof value === "number" ? value : typeof value === "string" ? value : ""}
          disabled={disabled}
          onChange={onChange}
        />
      );

    case "string":
    default:
      return (
        <TextValueInput
          value={typeof value === "string" ? value : String(value ?? "")}
          disabled={disabled}
          onChange={onChange}
        />
      );
  }
}
