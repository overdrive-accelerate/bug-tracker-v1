"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PropertyDefinition, ViewConfig, FilterRule, RowValues } from "@/lib/database-types";
import { useState } from "react";
import DatabaseTableView from "./DatabaseTableView";
import DatabaseBoardView from "./DatabaseBoardView";
import DatabaseListView from "./DatabaseListView";
import DatabaseFilter from "./DatabaseFilter";
import RowDetailPanel from "./RowDetailPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DatabasePage({ databaseId }: { databaseId: Id<"databases"> }) {
    const database = useQuery(api.databases.get, { id: databaseId });
    const rows = useQuery(api.databases.listRows, { databaseId });
    const updateProperties = useMutation(api.databases.updateProperties);
    const updateViews = useMutation(api.databases.updateViews);
    const removeDatabase = useMutation(api.databases.remove);

    const [activeViewId, setActiveViewId] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState<Id<"databaseRows"> | null>(null);

    const handleEditProperties = (updated: PropertyDefinition[]) => {
        updateProperties({ id: databaseId, properties: JSON.stringify(updated) });
    };

    if (database === undefined || rows === undefined) {
        return (
            <div className="space-y-3 p-4">
                <Skeleton className="h-8 w-48 rounded-md" />
                <Skeleton className="h-64 w-full rounded-md" />
            </div>
        );
    }

    if (database === null) {
        return <p className="text-sm text-muted-foreground p-4">Database not found.</p>;
    }

    const properties: PropertyDefinition[] = JSON.parse(database.properties);
    const views: ViewConfig[] = JSON.parse(database.views);
    const activeView = views.find((v) => v.id === activeViewId) ?? views[0];
    const selectedRow = selectedRowId ? rows.find((r) => r._id === selectedRowId) : null;

    const activeFilters = activeView?.filters ?? [];

    const handleFiltersChange = (filters: FilterRule[]) => {
        const updatedViews = views.map((v) =>
            v.id === activeView?.id ? { ...v, filters } : v,
        );
        updateViews({ id: databaseId, views: JSON.stringify(updatedViews) });
    };

    // Parse row values once for filtering — avoids repeated JSON.parse per row
    const filteredRows = activeFilters.length
        ? rows.filter((row) => {
              const values: RowValues = JSON.parse(row.values);
              return activeFilters.every((rule) => {
                  const prop = properties.find((p) => p.id === rule.propertyId);
                  if (!prop) return true;
                  return evaluateFilter(values[rule.propertyId], rule, prop);
              });
          })
        : rows;

    const handleAddView = (type: "table" | "board" | "list") => {
        const id = `view_${Date.now()}`;
        const name = type === "table" ? "Table" : type === "board" ? "Board" : "List";
        const newView: ViewConfig = { id, name: `${name} view`, type };
        if (type === "board") {
            const selectProp = properties.find((p) => p.type === "select" || p.type === "status");
            if (selectProp) newView.groupByPropertyId = selectProp.id;
        }
        const updated = [...views, newView];
        updateViews({ id: databaseId, views: JSON.stringify(updated) });
    };

    return (
        <div>
            {/* View tabs + actions */}
            <div className="flex items-center gap-1 border-b border-border mb-4 px-1">
                {views.map((view) => (
                    <button
                        key={view.id}
                        onClick={() => setActiveViewId(view.id)}
                        className={`px-3 py-2 text-[13px] font-medium border-b-2 transition-colors ${
                            activeView?.id === view.id
                                ? "border-primary text-foreground"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                        }`}
                    >
                        {view.type === "table" && "⊞ "}
                        {view.type === "board" && "▤ "}
                        {view.type === "list" && "☰ "}
                        {view.name}
                    </button>
                ))}

                {/* Add view dropdown */}
                <div className="relative group/addview ml-1">
                    <Button variant="ghost" size="sm" className="h-7 text-[12px] text-muted-foreground">
                        +
                    </Button>
                    <div className="absolute left-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg py-1 hidden group-hover/addview:block z-10 min-w-[120px]">
                        <button
                            onClick={() => handleAddView("table")}
                            className="block w-full text-left px-3 py-1.5 text-[13px] text-foreground hover:bg-accent transition-colors"
                        >
                            ⊞ Table
                        </button>
                        <button
                            onClick={() => handleAddView("board")}
                            className="block w-full text-left px-3 py-1.5 text-[13px] text-foreground hover:bg-accent transition-colors"
                        >
                            ▤ Board
                        </button>
                        <button
                            onClick={() => handleAddView("list")}
                            className="block w-full text-left px-3 py-1.5 text-[13px] text-foreground hover:bg-accent transition-colors"
                        >
                            ☰ List
                        </button>
                    </div>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Filter */}
                <DatabaseFilter
                    properties={properties}
                    filters={activeFilters}
                    onFiltersChange={handleFiltersChange}
                />

                {/* Database actions menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 text-muted-foreground">
                            ···
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                <path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 0 1 1.34-1.34h2.66a1.33 1.33 0 0 1 1.34 1.34V4m2 0v9.33a1.33 1.33 0 0 1-1.34 1.34H4.67a1.33 1.33 0 0 1-1.34-1.34V4h9.34Z" />
                            </svg>
                            Delete database
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Delete confirmation */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete database</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the database and all its rows. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => removeDatabase({ id: databaseId })}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Active view */}
            {activeView?.type === "table" && (
                <DatabaseTableView
                    databaseId={databaseId}
                    properties={properties}
                    rows={filteredRows}
                    onEditProperties={handleEditProperties}
                    onOpenRow={setSelectedRowId}
                />
            )}
            {activeView?.type === "board" && (
                <DatabaseBoardView
                    databaseId={databaseId}
                    properties={properties}
                    rows={filteredRows}
                    groupByPropertyId={activeView.groupByPropertyId ?? "status"}
                    onOpenRow={setSelectedRowId}
                />
            )}
            {activeView?.type === "list" && (
                <DatabaseListView
                    databaseId={databaseId}
                    properties={properties}
                    rows={filteredRows}
                    onOpenRow={setSelectedRowId}
                />
            )}

            {/* Row detail drawer */}
            <RowDetailPanel
                open={!!selectedRow}
                row={selectedRow ?? null}
                properties={properties}
                onClose={() => setSelectedRowId(null)}
            />
        </div>
    );
}

/** Evaluate a single filter rule against a cell value */
function evaluateFilter(
    cellValue: unknown,
    rule: FilterRule,
    prop: PropertyDefinition,
): boolean {
    const op = rule.operator;
    const filterValue = rule.value;

    // Empty checks work for all types
    if (op === "is_empty") {
        if (cellValue === undefined || cellValue === null || cellValue === "") return true;
        if (Array.isArray(cellValue) && cellValue.length === 0) return true;
        return false;
    }
    if (op === "is_not_empty") {
        if (cellValue === undefined || cellValue === null || cellValue === "") return false;
        if (Array.isArray(cellValue) && cellValue.length === 0) return false;
        return true;
    }

    // Checkbox
    if (op === "is_checked") return !!cellValue;
    if (op === "is_not_checked") return !cellValue;

    // String-based operations
    const strValue = String(cellValue ?? "").toLowerCase();
    const strFilter = filterValue.toLowerCase();

    if (op === "contains") {
        if (prop.type === "multiSelect") {
            const arr = Array.isArray(cellValue) ? (cellValue as string[]) : [];
            return arr.some((v) => v.toLowerCase() === strFilter);
        }
        return strValue.includes(strFilter);
    }
    if (op === "does_not_contain") {
        if (prop.type === "multiSelect") {
            const arr = Array.isArray(cellValue) ? (cellValue as string[]) : [];
            return !arr.some((v) => v.toLowerCase() === strFilter);
        }
        return !strValue.includes(strFilter);
    }
    if (op === "is") return strValue === strFilter;
    if (op === "is_not") return strValue !== strFilter;

    // Numeric operations
    const numValue = typeof cellValue === "number" ? cellValue : Number(cellValue);
    const numFilter = Number(filterValue);
    if (op === "equals") return numValue === numFilter;
    if (op === "not_equals") return numValue !== numFilter;
    if (op === "greater_than") return numValue > numFilter;
    if (op === "less_than") return numValue < numFilter;
    if (op === "greater_than_or_equal") return numValue >= numFilter;
    if (op === "less_than_or_equal") return numValue <= numFilter;

    // Date operations
    if (op === "is_before") {
        const d = new Date(String(cellValue ?? ""));
        const fd = new Date(filterValue);
        return d < fd;
    }
    if (op === "is_after") {
        const d = new Date(String(cellValue ?? ""));
        const fd = new Date(filterValue);
        return d > fd;
    }

    return true;
}
