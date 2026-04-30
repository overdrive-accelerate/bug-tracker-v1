"use client";

import { useState, useRef, useEffect } from "react";
import {
    FilterRule,
    FilterOperator,
    PropertyDefinition,
    OPERATORS_BY_TYPE,
} from "@/lib/database-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";

interface DatabaseFilterProps {
    properties: PropertyDefinition[];
    filters: FilterRule[];
    onFiltersChange: (filters: FilterRule[]) => void;
}

export default function DatabaseFilter({
    properties,
    filters,
    onFiltersChange,
}: DatabaseFilterProps) {
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Close panel on outside click
    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    const addRule = () => {
        const firstProp = properties[0];
        if (!firstProp) return;
        const operators = OPERATORS_BY_TYPE[firstProp.type];
        const newRule: FilterRule = {
            id: `filter_${Date.now()}`,
            propertyId: firstProp.id,
            operator: operators[0].value,
            value: "",
        };
        onFiltersChange([...filters, newRule]);
    };

    const updateRule = (id: string, updates: Partial<FilterRule>) => {
        onFiltersChange(
            filters.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        );
    };

    const removeRule = (id: string) => {
        onFiltersChange(filters.filter((r) => r.id !== id));
    };

    const clearAll = () => {
        onFiltersChange([]);
    };

    const hasFilters = filters.length > 0;

    return (
        <div className="relative" ref={panelRef}>
            {/* Filter trigger button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(!open)}
                className={`h-7 gap-1.5 text-[12px] ${
                    hasFilters
                        ? "text-primary"
                        : "text-muted-foreground"
                }`}
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                {hasFilters && (
                    <span className="bg-primary/15 text-primary text-[10px] px-1.5 py-0.5 rounded font-medium">
                        {filters.length} {filters.length === 1 ? "rule" : "rules"}
                    </span>
                )}
            </Button>

            {/* Filter panel dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-1 z-50 min-w-[480px] bg-popover border border-border rounded-lg shadow-lg">
                    {/* Header */}
                    {hasFilters && (
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                            <span className="bg-primary/15 text-primary text-[11px] px-2 py-0.5 rounded font-medium">
                                {filters.length} {filters.length === 1 ? "rule" : "rules"}
                            </span>
                            <span className="text-[12px] text-muted-foreground">+ Filter</span>
                        </div>
                    )}

                    {/* Filter rules */}
                    <div className="px-3 py-2 space-y-2">
                        {filters.map((rule, index) => (
                            <FilterRuleRow
                                key={rule.id}
                                rule={rule}
                                index={index}
                                properties={properties}
                                onUpdate={(updates) => updateRule(rule.id, updates)}
                                onRemove={() => removeRule(rule.id)}
                            />
                        ))}

                        {!hasFilters && (
                            <div className="py-1">
                                <p className="text-[12px] text-muted-foreground mb-2">
                                    Filter by...
                                </p>
                                {/* Quick property picker */}
                                <div className="space-y-0.5">
                                    {properties.slice(0, 5).map((prop) => (
                                        <button
                                            key={prop.id}
                                            onClick={() => {
                                                const operators = OPERATORS_BY_TYPE[prop.type];
                                                const newRule: FilterRule = {
                                                    id: `filter_${Date.now()}`,
                                                    propertyId: prop.id,
                                                    operator: operators[0].value,
                                                    value: "",
                                                };
                                                onFiltersChange([...filters, newRule]);
                                            }}
                                            className="flex items-center gap-2 w-full px-2 py-1.5 text-[13px] text-foreground rounded hover:bg-accent transition-colors"
                                        >
                                            <span className="text-muted-foreground text-[11px] w-5">
                                                {getPropertyIcon(prop.type)}
                                            </span>
                                            {prop.name}
                                        </button>
                                    ))}
                                </div>
                                {properties.length > 5 && (
                                    <p className="text-[11px] text-muted-foreground px-2 pt-1">
                                        + {properties.length - 5} more properties
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer actions */}
                    {hasFilters && (
                        <div className="border-t border-border px-3 py-2 space-y-1">
                            <button
                                onClick={addRule}
                                className="flex items-center gap-2 w-full px-2 py-1.5 text-[12px] text-muted-foreground hover:text-foreground rounded hover:bg-accent transition-colors"
                            >
                                <span>+</span> Add filter rule
                            </button>
                            <button
                                onClick={clearAll}
                                className="flex items-center gap-2 w-full px-2 py-1.5 text-[12px] text-destructive hover:bg-destructive/10 rounded transition-colors"
                            >
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                </svg>
                                Delete filter
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function FilterRuleRow({
    rule,
    index,
    properties,
    onUpdate,
    onRemove,
}: {
    rule: FilterRule;
    index: number;
    properties: PropertyDefinition[];
    onUpdate: (updates: Partial<FilterRule>) => void;
    onRemove: () => void;
}) {
    const property = properties.find((p) => p.id === rule.propertyId) ?? properties[0];
    const operators = OPERATORS_BY_TYPE[property.type];
    const needsValue = !["is_empty", "is_not_empty", "is_checked", "is_not_checked"].includes(
        rule.operator,
    );

    // Local state for text input to avoid Convex round-trip on every keystroke
    const [localValue, setLocalValue] = useState(rule.value);
    // Sync local state when rule changes externally (e.g. property/operator change resets value)
    useEffect(() => {
        setLocalValue(rule.value);
    }, [rule.value]);

    const handlePropertyChange = (propertyId: string) => {
        const newProp = properties.find((p) => p.id === propertyId);
        if (!newProp) return;
        const newOperators = OPERATORS_BY_TYPE[newProp.type];
        onUpdate({
            propertyId,
            operator: newOperators[0].value,
            value: "",
        });
    };

    const commitValue = () => {
        if (localValue !== rule.value) {
            onUpdate({ value: localValue });
        }
    };

    return (
        <div className="flex items-center gap-1.5">
            {/* Connector label */}
            <span className="text-[11px] text-muted-foreground w-10 shrink-0 text-right">
                {index === 0 ? "Where" : "And"}
            </span>

            {/* Property selector */}
            <NativeSelect
                value={rule.propertyId}
                options={properties.map((p) => ({
                    value: p.id,
                    label: p.name,
                }))}
                onChange={handlePropertyChange}
                className="h-7 text-[12px] min-w-[100px] max-w-[130px]"
            />

            {/* Operator selector */}
            <NativeSelect
                value={rule.operator}
                options={operators.map((o) => ({
                    value: o.value,
                    label: o.label,
                }))}
                onChange={(val) => onUpdate({ operator: val as FilterOperator })}
                className="h-7 text-[12px] min-w-[90px] max-w-[130px]"
            />

            {/* Value input */}
            {needsValue && (
                property.type === "select" || property.type === "status" ? (
                    <NativeSelect
                        value={rule.value}
                        options={[
                            { value: "", label: "Select..." },
                            ...(property.options ?? []).map((opt) => ({
                                value: opt,
                                label: opt,
                            })),
                        ]}
                        onChange={(val) => onUpdate({ value: val })}
                        className="h-7 text-[12px] flex-1 min-w-[80px]"
                    />
                ) : property.type === "multiSelect" ? (
                    <NativeSelect
                        value={rule.value}
                        options={[
                            { value: "", label: "Select..." },
                            ...(property.options ?? []).map((opt) => ({
                                value: opt,
                                label: opt,
                            })),
                        ]}
                        onChange={(val) => onUpdate({ value: val })}
                        className="h-7 text-[12px] flex-1 min-w-[80px]"
                    />
                ) : (
                    <Input
                        type={
                            property.type === "number" || property.type === "progress"
                                ? "number"
                                : property.type === "date" ||
                                    property.type === "createdTime" ||
                                    property.type === "updatedTime"
                                  ? "date"
                                  : "text"
                        }
                        placeholder="Value"
                        value={localValue}
                        onChange={(e) => setLocalValue(e.target.value)}
                        onBlur={commitValue}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") commitValue();
                        }}
                        className="h-7 text-[12px] flex-1 min-w-[80px] rounded-md"
                    />
                )
            )}

            {/* Remove single rule */}
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={onRemove}
                title="Remove rule"
            >
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </Button>
        </div>
    );
}

function getPropertyIcon(type: string): string {
    switch (type) {
        case "text":
        case "id":
        case "createdBy":
        case "lastEditedBy":
            return "Aa";
        case "number":
        case "progress":
            return "#";
        case "select":
        case "status":
        case "multiSelect":
            return "⊙";
        case "date":
        case "createdTime":
        case "updatedTime":
            return "📅";
        case "checkbox":
            return "☑";
        case "url":
            return "🔗";
        case "email":
            return "✉";
        case "phone":
            return "☎";
        case "person":
            return "👤";
        case "file":
            return "📎";
        default:
            return "·";
    }
}
