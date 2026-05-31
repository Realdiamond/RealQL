"use client";

/**
 * QueryRule — single condition row, fully schema-driven.
 *
 * Renders a field selector (populated from the active schema),
 * an operator selector (filtered by field type), a value input
 * (dynamically routed by type), and rule actions.
 *
 * When the user changes the field, the operator resets to
 * the first compatible operator and the value clears — this
 * prevents stale operator/value combinations.
 */

import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { RuleActions } from "./RuleActions";
import { FieldSelector } from "./fields/FieldSelector";
import { OperatorSelector } from "./operators/OperatorSelector";
import { ValueInputRouter } from "./value-inputs/ValueInputRouter";
import type { QueryRule as QueryRuleType, SchemaField, FieldType, RuleValue } from "@/lib/types";
import { getOperatorsForFieldType } from "@/lib/constants/operators";

interface QueryRuleProps {
  rule: QueryRuleType;
  depth: number;
  fields: SchemaField[];
  onUpdate: (updates: Partial<QueryRuleType>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function QueryRule({
  rule,
  fields,
  onUpdate,
  onDelete,
  onDuplicate,
}: QueryRuleProps) {
  // Resolve field metadata from the schema
  const activeField = fields.find((f) => f.name === rule.field);
  const fieldType: FieldType | null = activeField?.type ?? null;

  const handleFieldChange = (fieldName: string, newFieldType: FieldType) => {
    // Reset operator to first compatible operator for the new field type
    const compatible = getOperatorsForFieldType(newFieldType);
    const defaultOp = compatible.length > 0 ? compatible[0].type : "equals";

    // Reset value based on field type
    let defaultValue: RuleValue = "";
    if (newFieldType === "boolean") defaultValue = true;
    if (newFieldType === "number") defaultValue = "";

    onUpdate({
      field: fieldName,
      operator: defaultOp,
      value: defaultValue,
    });
  };

  return (
    <div
      className={cn(
        "group/rule flex items-center gap-2 px-3 py-2 rounded-lg",
        "bg-[var(--surface)] hover:bg-[var(--surface-secondary)]",
        "border border-[var(--border)]",
        "transition-colors duration-150",
        rule.disabled && "opacity-50"
      )}
      data-rule-id={rule.id}
    >
      {/* Drag handle (visual only — wired in PR 9) */}
      <div className="flex items-center text-[var(--gray-300)] cursor-grab">
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Field selector — populated from schema */}
      <FieldSelector
        value={rule.field}
        fields={fields}
        disabled={rule.disabled}
        onChange={handleFieldChange}
      />

      {/* Operator selector — filtered by field type */}
      <OperatorSelector
        value={rule.operator}
        fieldType={fieldType}
        disabled={rule.disabled}
        onChange={(operator) => {
          let defaultValue: RuleValue = "";
          if (fieldType === "boolean") defaultValue = true;
          if (fieldType === "number") defaultValue = "";
          onUpdate({ operator, value: defaultValue });
        }}
      />

      {/* Value input — dynamically routed by field type + operator */}
      <ValueInputRouter
        value={rule.value}
        fieldType={fieldType}
        operator={rule.operator}
        enumValues={activeField?.enumValues}
        disabled={rule.disabled}
        onChange={(value) => onUpdate({ value })}
      />

      {/* Actions */}
      <RuleActions
        disabled={rule.disabled}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onToggleDisable={() => onUpdate({ disabled: !rule.disabled })}
      />
    </div>
  );
}
