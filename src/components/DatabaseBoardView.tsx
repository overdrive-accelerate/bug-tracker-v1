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

interface DatabaseBoardViewProps {
    databaseId: Id<"databases">;
    properties: PropertyDefinition[];
    rows: DatabaseRow[];
    groupByPropertyId: string;
    onOpenRow?: (rowId: Id<"databaseRows">) => void;
}

export default function DatabaseBoardView({
    databaseId,
    properties,
    rows,
    groupByPropertyId,
    onOpenRow,
}: DatabaseBoardViewProps) {
    const createRow = useMutation(api.databases.createRow);
    const updateRow = useMutation(api.databases.updateRow).withOptimisticUpdate(
        (localStore, args) => {
            const existingRows = localStore.getQuery(api.databases.listRows, { databaseId });
            if (existingRows !== undefined) {
                const updated = existingRows.map((r) =>
                    r._id === args.id ? { ...r, values: args.values } : r,
                );
                localStore.setQuery(api.databases.listRows, { databaseId }, updated);
            }
        },
    );
    const deleteRow = useMutation(api.databases.deleteRow);

    const groupProp = properties.find((p) => p.id === groupByPropertyId);
    if (!groupProp || (groupProp.type !== "select" && groupProp.type !== "status")) {
        return (
            <p className="text-sm text-muted-foreground p-4">
                Board view requires a select property to group by.
            </p>
        );
    }

    const columns = groupProp.options ?? [];

    // Parse all row values once, reuse for grouping and rendering
    const parsedValues = new Map<string, RowValues>();
    for (const row of rows) {
        parsedValues.set(row._id, JSON.parse(row.values));
    }

    const grouped: Record<string, DatabaseRow[]> = {};
    for (const col of columns) {
        grouped[col] = [];
    }
    for (const row of rows) {
        const values = parsedValues.get(row._id)!;
        const groupVal = String(values[groupByPropertyId] ?? "");
        if (grouped[groupVal]) {
            grouped[groupVal].push(row);
        } else {
            // Put uncategorized rows in the first column
            grouped[columns[0]]?.push(row);
        }
    }

    const titleProp = properties.find((p) => p.id === "title") ?? properties[0];

    const handleAddCard = async (columnValue: string) => {
        const values: RowValues = {};
        if (columnValue) values[groupByPropertyId] = columnValue;
        await createRow({ databaseId, values: JSON.stringify(values) });
    };

    const handleMoveCard = async (row: DatabaseRow, newColumnValue: string) => {
        const values: RowValues = JSON.parse(row.values);
        values[groupByPropertyId] = newColumnValue || undefined;
        await updateRow({ id: row._id, values: JSON.stringify(values) });
    };

    // Color map for status columns
    const STATUS_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
        "Backlog": { dot: "bg-gray-400", bg: "bg-gray-500/5", text: "text-gray-600 dark:text-gray-400" },
        "Not started": { dot: "bg-gray-400", bg: "bg-gray-500/5", text: "text-gray-600 dark:text-gray-400" },
        "In progress": { dot: "bg-blue-500", bg: "bg-blue-500/5", text: "text-blue-700 dark:text-blue-400" },
        "In review": { dot: "bg-amber-500", bg: "bg-amber-500/5", text: "text-amber-700 dark:text-amber-400" },
        "Done": { dot: "bg-emerald-500", bg: "bg-emerald-500/5", text: "text-emerald-700 dark:text-emerald-400" },
        "Low": { dot: "bg-slate-400", bg: "bg-slate-500/5", text: "text-slate-600 dark:text-slate-400" },
        "Medium": { dot: "bg-amber-500", bg: "bg-amber-500/5", text: "text-amber-700 dark:text-amber-400" },
        "High": { dot: "bg-red-500", bg: "bg-red-500/5", text: "text-red-700 dark:text-red-400" },
    };

    const getColor = (col: string) => STATUS_COLORS[col] ?? { dot: "bg-gray-400", bg: "bg-muted/30", text: "text-foreground" };

    return (
        <div className="flex gap-3 overflow-x-auto pb-4 min-h-[300px]">
            {columns.map((col, colIdx) => {
                const color = getColor(col);
                return (
                <div
                    key={`col-${colIdx}`}
                    className={`flex-shrink-0 w-[260px] rounded-lg ${color.bg}`}
                >
                    {/* Column header */}
                    <div className="px-3 py-2.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${color.dot}`} />
                                <span className={`text-[13px] font-semibold ${color.text}`}>
                                    {col}
                                </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                                {grouped[col].length}
                            </span>
                        </div>
                    </div>

                    {/* Cards */}
                    <div className="p-2 space-y-2 min-h-[100px]">
                        {grouped[col].map((row) => {
                            const values = parsedValues.get(row._id)!;
                            const title = titleProp
                                ? String(values[titleProp.id] ?? "")
                                : "";

                            return (
                                <div
                                    key={row._id}
                                    className="group/card bg-card border border-border rounded-md px-3 py-2 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-[13px] text-foreground font-medium truncate flex-1">
                                            {title || "Untitled"}
                                        </p>
                                        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover/card:opacity-100">
                                            {onOpenRow && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                                                    onClick={() => onOpenRow(row._id)}
                                                >
                                                    Open
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 text-muted-foreground hover:text-destructive"
                                                onClick={() => deleteRow({ id: row._id })}
                                            >
                                                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="4" y1="4" x2="12" y2="12" />
                                                    <line x1="12" y1="4" x2="4" y2="12" />
                                                </svg>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Show other property values as small badges */}
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                        {properties
                                            .filter((p) => p.id !== titleProp?.id && p.id !== groupByPropertyId && !AUTO_PROPERTY_TYPES.includes(p.type))
                                            .map((p) => {
                                                const val = values[p.id];
                                                if (!val && val !== 0) return null;
                                                if (p.type === "checkbox") {
                                                    return val ? (
                                                        <span key={p.id} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                                            ✓ {p.name}
                                                        </span>
                                                    ) : null;
                                                }
                                                if (p.type === "progress") {
                                                    const num = typeof val === "number" ? val : 0;
                                                    return (
                                                        <span key={p.id} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground inline-flex items-center gap-1">
                                                            <span className="inline-block w-8 h-1 bg-muted-foreground/20 rounded-full overflow-hidden">
                                                                <span className="block h-full bg-primary rounded-full" style={{ width: `${num}%` }} />
                                                            </span>
                                                            {num}%
                                                        </span>
                                                    );
                                                }
                                                if (p.type === "person") {
                                                    return (
                                                        <span key={p.id} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground inline-flex items-center gap-1">
                                                            <span className="h-3.5 w-3.5 rounded-full bg-primary/20 text-primary text-[8px] font-medium flex items-center justify-center">
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
                                                        <span key={p.id} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                                            📎 {fd.name}
                                                        </span>
                                                    );
                                                }
                                                if (p.type === "date") {
                                                    return (
                                                        <span key={p.id} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                                            {String(val)}
                                                        </span>
                                                    );
                                                }
                                                if (p.type === "multiSelect" && Array.isArray(val)) {
                                                    return (val as string[]).map((v, vi) => (
                                                        <span key={`${p.id}-${vi}`} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                                            {v}
                                                        </span>
                                                    ));
                                                }
                                                return (
                                                    <span key={p.id} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                                        {String(val)}
                                                    </span>
                                                );
                                            })}
                                    </div>

                                    {/* Move to other columns */}
                                    <div className="hidden group-hover/card:flex gap-1 mt-2 pt-2 border-t border-border">
                                        {columns
                                            .filter((c) => c !== col)
                                            .map((target, i) => (
                                                <button
                                                    key={`move-${i}`}
                                                    onClick={() => handleMoveCard(row, target)}
                                                    className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
                                                    title={`Move to ${target}`}
                                                >
                                                    → {target}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Add card */}
                    <div className="px-2 pb-2">
                        <Button
                            variant="ghost"
                            className="w-full h-7 text-[12px] text-muted-foreground hover:text-foreground justify-start"
                            onClick={() => handleAddCard(col)}
                        >
                            + New
                        </Button>
                    </div>
                </div>
                );
            })}
        </div>
    );
}
