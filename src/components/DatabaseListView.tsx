"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PropertyDefinition, RowValues, AUTO_PROPERTY_TYPES } from "@/lib/database-types";
import { Button } from "@/components/ui/button";

interface DatabaseRow {
    _id: Id<"databaseRows">;
    databaseId: Id<"databases">;
    values: string;
    position: number;
}

interface DatabaseListViewProps {
    databaseId: Id<"databases">;
    properties: PropertyDefinition[];
    rows: DatabaseRow[];
    onOpenRow?: (rowId: Id<"databaseRows">) => void;
}

export default function DatabaseListView({
    databaseId,
    properties,
    rows,
    onOpenRow,
}: DatabaseListViewProps) {
    const createRow = useMutation(api.databases.createRow);
    const deleteRow = useMutation(api.databases.deleteRow);

    const titleProp = properties.find((p) => p.id === "title") ?? properties[0];

    return (
        <div>
            <div className="space-y-1">
                {rows.map((row) => {
                    const values: RowValues = JSON.parse(row.values);
                    const title = titleProp ? String(values[titleProp.id] ?? "") : "";

                    return (
                        <div
                            key={row._id}
                            className="group/row flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/30 transition-colors border border-transparent hover:border-border"
                        >
                            {/* Title */}
                            <span className="text-[14px] text-foreground font-medium truncate flex-1 min-w-0">
                                {title || "Untitled"}
                            </span>

                            {/* Property badges */}
                            <div className="flex items-center gap-2 shrink-0">
                                {properties
                                    .filter((p) => p.id !== titleProp?.id && !AUTO_PROPERTY_TYPES.includes(p.type))
                                    .slice(0, 3) // Show max 3 properties
                                    .map((p) => {
                                        const val = values[p.id];
                                        if (val === undefined || val === null || val === "") return null;
                                        if (p.type === "checkbox") {
                                            return (
                                                <span
                                                    key={p.id}
                                                    className="text-[11px] px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                                                >
                                                    {val ? "✓" : "✗"} {p.name}
                                                </span>
                                            );
                                        }
                                        if (p.type === "select") {
                                            return (
                                                <span
                                                    key={p.id}
                                                    className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                                                >
                                                    {String(val)}
                                                </span>
                                            );
                                        }
                                        if (p.type === "progress") {
                                            const num = typeof val === "number" ? val : 0;
                                            return (
                                                <span
                                                    key={p.id}
                                                    className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground inline-flex items-center gap-1"
                                                >
                                                    <span className="inline-block w-8 h-1.5 bg-muted-foreground/20 rounded-full overflow-hidden">
                                                        <span className="block h-full bg-primary rounded-full" style={{ width: `${num}%` }} />
                                                    </span>
                                                    {num}%
                                                </span>
                                            );
                                        }
                                        if (p.type === "person") {
                                            return (
                                                <span
                                                    key={p.id}
                                                    className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground inline-flex items-center gap-1"
                                                >
                                                    <span className="h-4 w-4 rounded-full bg-primary/20 text-primary text-[9px] font-medium flex items-center justify-center">
                                                        {String(val).charAt(0).toUpperCase()}
                                                    </span>
                                                    {String(val)}
                                                </span>
                                            );
                                        }
                                        if (p.type === "file") {
                                            const fd = val as { name?: string } | null;
                                            if (!fd?.name) return null;
                                            return (
                                                <span
                                                    key={p.id}
                                                    className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                                                >
                                                    📎 {fd.name}
                                                </span>
                                            );
                                        }
                                        if (p.type === "multiSelect" && Array.isArray(val)) {
                                            return (val as string[]).map((v, vi) => (
                                                <span key={`${p.id}-${vi}`} className="text-[11px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                                    {v}
                                                </span>
                                            ));
                                        }
                                        return (
                                            <span
                                                key={p.id}
                                                className="text-[11px] text-muted-foreground"
                                            >
                                                {String(val)}
                                            </span>
                                        );
                                    })}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                {onOpenRow && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                                        onClick={() => onOpenRow(row._id)}
                                    >
                                        Open
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                    onClick={() => deleteRow({ id: row._id })}
                                >
                                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="4" y1="4" x2="12" y2="12" />
                                        <line x1="12" y1="4" x2="4" y2="12" />
                                    </svg>
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {rows.length === 0 && (
                <p className="text-[13px] text-muted-foreground/60 py-6 text-center">
                    No items yet
                </p>
            )}

            <Button
                variant="ghost"
                className="w-full mt-1 h-8 text-[13px] text-muted-foreground hover:text-foreground justify-start pl-3"
                onClick={() => createRow({ databaseId })}
            >
                + New
            </Button>
        </div>
    );
}
