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
import type { QueryRule as QueryRuleType, SchemaField, FieldType, RuleValue, ValidationError } from "@/lib/types";
import { getOperatorsForFieldType } from "@/lib/constants/operators";
import { getErrorsForNode } from "@/lib/engine/query-validator";
import { ValidationMessage } from "./ValidationMessage";
import React from "react";

interface QueryRuleProps {
  rule: QueryRuleType;
  depth: number;
  fields: SchemaField[];
  validationErrors?: ValidationError[];
  onUpdate: (updates: Partial<QueryRuleType>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  dragHandleRef?: (element: HTMLElement | null) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

export function QueryRule({
  rule,
  fields,
  validationErrors = [],
  onUpdate,
  onDelete,
  onDuplicate,
  dragHandleRef,
  dragHandleProps,
}: QueryRuleProps) {
  // Resolve field metadata from the schema
  const activeField = fields.find((f) => f.name === rule.field);
  const fieldType: FieldType | null = activeField?.type ?? null;

  // Get validation errors for this specific rule
  const ruleErrors = getErrorsForNode(validationErrors, rule.id);
  const hasErrors = ruleErrors.some((e) => e.severity === "error");

  const handleFieldChange = (fieldName: string, newFieldType: FieldType) => {
    // Reset operator to first compatible operator for the new field type
    const compatible = getOperatorsForFieldType(newFieldType);
    const defaultOp = compatible.length > 0 ? compatible[0].type : "equals";

    // Reset value based on field type
    let defaultValue: RuleValue = "";
    if (newFieldType === "boolean") defaultValue = true;

    onUpdate({
      field: fieldName,
      operator: defaultOp,
      value: defaultValue,
    });
  };

  return (
    <div
      className={cn(
        "group/rule flex flex-col gap-0 rounded-lg",
        "bg-[var(--surface)] hover:bg-[var(--surface-secondary)]",
        "border transition-colors duration-150",
        hasErrors
          ? "border-[var(--color-error)]/50"
          : "border-[var(--border)]",
        rule.disabled && "opacity-50"
      )}
      data-rule-id={rule.id}
    >
      <div className="flex items-center gap-2 px-3 py-2">
      {/* Drag handle (visual only — wired in PR 9) */}
      <div 
        ref={dragHandleRef}
        {...dragHandleProps}
        className={cn(
          "flex items-center text-[var(--gray-300)] focus-ring rounded-sm",
          dragHandleProps && "cursor-grab hover:text-[var(--foreground)] active:cursor-grabbing"
        )}
      >
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
          const newRequiresBoolean = fieldType === "boolean" || operator === "is_null" || operator === "is_not_null";
          const oldRequiresBoolean = typeof rule.value === "boolean";
          
          const newRequiresArray = operator === "in_array" || operator === "not_in_array";
          const oldIsArray = Array.isArray(rule.value);
          
          const newRequiresRange = operator === "between";
          const oldIsRange = Array.isArray(rule.value) && rule.value.length === 2;

          if (newRequiresBoolean !== oldRequiresBoolean || newRequiresArray !== oldIsArray || newRequiresRange !== oldIsRange) {
            let defaultValue: RuleValue = "";
            if (fieldType === "boolean") defaultValue = true;
            if (newRequiresArray) defaultValue = [];
            if (newRequiresRange) defaultValue = ["", ""];
            onUpdate({ operator, value: defaultValue });
          } else {
            onUpdate({ operator, value: rule.value });
          }
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

      {/* Validation errors */}
      {ruleErrors.length > 0 && (
        <div className="px-3 pb-2">
          <ValidationMessage errors={ruleErrors} />
        </div>
      )}
    </div>
  );
}

export const MemoizedQueryRule = React.memo(QueryRule);
