"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PropertyDefinition, PropertyType, RowValues, AUTO_PROPERTY_TYPES, PROPERTY_TYPE_LABELS } from "@/lib/database-types";
import { useState, useRef, useEffect } from "react";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef,
} from "@tanstack/react-table";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

interface DatabaseRow {
    _id: Id<"databaseRows">;
    databaseId: Id<"databases">;
    values: string;
    position: number;
}

interface DatabaseTableViewProps {
    databaseId: Id<"databases">;
    properties: PropertyDefinition[];
    rows: DatabaseRow[];
    onEditProperties: (properties: PropertyDefinition[]) => void;
    onOpenRow?: (rowId: Id<"databaseRows">) => void;
}

function ProgressInput({ value, onSave }: { value: number; onSave: (v: number) => void }) {
    const [localVal, setLocalVal] = useState(value);
    useEffect(() => { setLocalVal(value); }, [value]);
    const commit = () => {
        if (localVal !== value) onSave(localVal);
    };
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, localVal))}%` }}
                />
            </div>
            <input
                type="number"
                min={0}
                max={100}
                value={localVal}
                onChange={(e) => setLocalVal(Number(e.target.value))}
                onBlur={commit}
                onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                className="w-12 bg-transparent border border-border rounded px-1 py-0.5 text-[12px] text-center outline-none focus:ring-1 focus:ring-ring"
            />
            <span className="text-[11px] text-muted-foreground">%</span>
        </div>
    );
}

function CellEditor({
    row,
    property,
    value,
    allValues,
    updateRow,
    generateUploadUrl,
    saveFileRecord,
}: {
    row: DatabaseRow;
    property: PropertyDefinition;
    value: unknown;
    allValues: RowValues;
    updateRow: (args: { id: Id<"databaseRows">; values: string }) => void;
    generateUploadUrl: () => Promise<string>;
    saveFileRecord: (args: { storageId: string; filename: string; mimeType: string; size: number }) => Promise<unknown>;
}) {
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState(String(value ?? ""));
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Ref avoids stale closure — save() always reads latest allValues
    const allValuesRef = useRef(allValues);
    allValuesRef.current = allValues;

    const save = (newVal: unknown) => {
        const updated = { ...allValuesRef.current, [property.id]: newVal };
        updateRow({ id: row._id, values: JSON.stringify(updated) });
    };

    // Auto-populated types are read-only
    if (AUTO_PROPERTY_TYPES.includes(property.type)) {
        if (property.type === "createdTime" || property.type === "updatedTime") {
            if (!value) return <span className="text-muted-foreground/40 text-[13px]">—</span>;
            const date = new Date(String(value));
            return (
                <span className="text-[13px] text-muted-foreground">
                    {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    {" "}
                    {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </span>
            );
        }
        if (property.type === "createdBy" || property.type === "lastEditedBy") {
            return (
                <span className="text-[13px] text-muted-foreground">
                    {value ? String(value) : "\u2014"}
                </span>
            );
        }
        if (property.type === "id") {
            return (
                <span className="text-[13px] text-muted-foreground font-mono">
                    {value ? String(value) : "—"}
                </span>
            );
        }
    }

    if (property.type === "checkbox") {
        return (
            <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => save(e.target.checked)}
                className="h-4 w-4 accent-primary cursor-pointer"
            />
        );
    }

    if (property.type === "select" || property.type === "status") {
        return (
            <NativeSelect
                value={String(value ?? "")}
                options={property.options ?? []}
                onChange={(val) => save(val)}
                className="h-7"
            />
        );
    }

    if (property.type === "multiSelect") {
        const selected = Array.isArray(value) ? (value as string[]) : [];
        return (
            <div className="flex flex-wrap gap-1">
                {property.options?.map((opt, i) => {
                    const isSelected = selected.includes(opt);
                    return (
                        <button
                            key={`${opt}-${i}`}
                            onClick={() => {
                                const next = isSelected
                                    ? selected.filter((s) => s !== opt)
                                    : [...selected, opt];
                                save(next);
                            }}
                            className={`text-[11px] px-1.5 py-0.5 rounded-full border transition-colors ${
                                isSelected
                                    ? "bg-primary/15 border-primary/30 text-primary"
                                    : "border-border text-muted-foreground hover:bg-accent"
                            }`}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>
        );
    }

    if (property.type === "progress") {
        return <ProgressInput value={typeof value === "number" ? value : 0} onSave={save} />;
    }

    if (property.type === "person") {
        return (
            <div
                className="min-h-[24px] cursor-text px-1 py-0.5 rounded hover:bg-accent/50 transition-colors text-[13px]"
                onClick={() => {
                    setEditing(true);
                    setEditValue(String(value ?? ""));
                }}
            >
                {!editing ? (
                    value ? (
                        <span className="inline-flex items-center gap-1">
                            <span className="h-5 w-5 rounded-full bg-primary/20 text-primary text-[10px] font-medium flex items-center justify-center shrink-0">
                                {String(value).charAt(0).toUpperCase()}
                            </span>
                            <span className="truncate">{String(value)}</span>
                        </span>
                    ) : (
                        <span className="text-muted-foreground/40">Empty</span>
                    )
                ) : (
                    <Input
                        autoFocus
                        className="h-7 text-[13px]"
                        placeholder="Name or email"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => {
                            setEditing(false);
                            if (editValue !== String(value ?? "")) save(editValue || undefined);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                            if (e.key === "Escape") {
                                setEditValue(String(value ?? ""));
                                setEditing(false);
                            }
                        }}
                    />
                )}
            </div>
        );
    }

    if (property.type === "file") {
        const fileData = value as { storageId: string; name: string } | null | undefined;
        return (
            <div className="flex items-center gap-1.5 text-[13px]">
                {fileData?.name ? (
                    <>
                        <a
                            href={`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/file/${fileData.storageId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline truncate max-w-[140px]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {fileData.name}
                        </a>
                        <button
                            onClick={() => save(null)}
                            className="text-muted-foreground hover:text-destructive text-[10px]"
                        >
                            ✕
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-muted-foreground/60 hover:text-foreground transition-colors"
                        >
                            + Attach
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const url = await generateUploadUrl();
                                const result = await fetch(url, {
                                    method: "POST",
                                    headers: { "Content-Type": file.type },
                                    body: file,
                                });
                                const { storageId } = await result.json();
                                await saveFileRecord({ storageId, filename: file.name, mimeType: file.type, size: file.size });
                                save({ storageId, name: file.name });
                                e.target.value = "";
                            }}
                        />
                    </>
                )}
            </div>
        );
    }

    // Text, number, date, url — inline editable
    if (!editing) {
        return (
            <div
                className="min-h-[24px] cursor-text px-1 py-0.5 rounded hover:bg-accent/50 transition-colors text-[13px]"
                onClick={() => {
                    setEditing(true);
                    setEditValue(String(value ?? ""));
                }}
            >
                {property.type === "url" && value ? (
                    <a
                        href={String(value)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {String(value)}
                    </a>
                ) : (
                    <span className={value ? "" : "text-muted-foreground/40"}>
                        {value ? String(value) : "Empty"}
                    </span>
                )}
            </div>
        );
    }

    return (
        <Input
            autoFocus
            type={property.type === "number" ? "number" : property.type === "date" ? "date" : property.type === "email" ? "email" : property.type === "phone" ? "tel" : "text"}
            className="h-7 text-[13px]"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => {
                setEditing(false);
                const parsed =
                    property.type === "number" ? (editValue ? Number(editValue) : "") : editValue;
                if (parsed !== value) save(parsed);
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") {
                    setEditValue(String(value ?? ""));
                    setEditing(false);
                }
            }}
        />
    );
}

/** Property header with Notion-style dropdown menu */
function PropertyHeader({
    property,
    properties,
    onEditProperties,
}: {
    property: PropertyDefinition;
    properties: PropertyDefinition[];
    onEditProperties: (properties: PropertyDefinition[]) => void;
}) {
    const [renaming, setRenaming] = useState(false);
    const [renameName, setRenameName] = useState(property.name);
    const isTitle = property.id === "title";
    const propIndex = properties.findIndex((p) => p.id === property.id);

    const handleRename = () => {
        if (!renameName.trim()) {
            setRenameName(property.name);
            setRenaming(false);
            return;
        }
        const updated = properties.map((p) =>
            p.id === property.id ? { ...p, name: renameName.trim() } : p,
        );
        onEditProperties(updated);
        setRenaming(false);
    };

    const handleChangeType = (newType: PropertyType) => {
        const updated = properties.map((p) => {
            if (p.id !== property.id) return p;
            const base: PropertyDefinition = { ...p, type: newType };
            if ((newType === "select" || newType === "multiSelect" || newType === "status") && !p.options?.length) {
                base.options = newType === "status"
                    ? ["Backlog", "In progress", "In review", "Done"]
                    : ["Option 1", "Option 2", "Option 3"];
            }
            if (newType !== "select" && newType !== "multiSelect" && newType !== "status") {
                delete base.options;
            }
            return base;
        });
        onEditProperties(updated);
    };

    const handleDelete = () => {
        const updated = properties.filter((p) => p.id !== property.id);
        onEditProperties(updated);
    };

    const handleDuplicate = () => {
        const clone: PropertyDefinition = {
            ...property,
            id: `prop_${Date.now()}`,
            name: `${property.name} copy`,
        };
        const updated = [...properties];
        updated.splice(propIndex + 1, 0, clone);
        onEditProperties(updated);
    };

    const handleInsertLeft = () => {
        const newProp: PropertyDefinition = {
            id: `prop_${Date.now()}`,
            name: "New property",
            type: "text",
        };
        const updated = [...properties];
        updated.splice(propIndex, 0, newProp);
        onEditProperties(updated);
    };

    const handleInsertRight = () => {
        const newProp: PropertyDefinition = {
            id: `prop_${Date.now()}`,
            name: "New property",
            type: "text",
        };
        const updated = [...properties];
        updated.splice(propIndex + 1, 0, newProp);
        onEditProperties(updated);
    };

    const handleHide = () => {
        const updated = properties.filter((p) => p.id !== property.id);
        onEditProperties(updated);
    };

    if (renaming) {
        return (
            <Input
                autoFocus
                className="h-6 text-[12px] w-full"
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename();
                    if (e.key === "Escape") {
                        setRenameName(property.name);
                        setRenaming(false);
                    }
                }}
            />
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 text-left hover:text-foreground transition-colors w-full">
                    <span className="truncate">{property.name}</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[200px]">
                {/* Property name — clickable to rename */}
                <div className="px-2 py-1.5 flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground truncate">{property.name}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {PROPERTY_TYPE_LABELS[property.type]}
                    </span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => {
                    setRenameName(property.name);
                    setRenaming(true);
                }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>
                    Edit property
                </DropdownMenuItem>
                {!isTitle && (
                    <>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m3 15 2 2 4-4"/></svg>
                                Change type
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="min-w-[160px] max-h-[280px] overflow-y-auto">
                                {(Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map((type) => (
                                    <DropdownMenuItem
                                        key={type}
                                        onSelect={() => handleChangeType(type)}
                                        className={property.type === type ? "bg-accent font-medium" : ""}
                                    >
                                        {PROPERTY_TYPE_LABELS[type]}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={handleInsertLeft}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M12 5v14"/><path d="m19 12-7-7-7 7"/></svg>
                            Insert left
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={handleInsertRight}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M12 5v14"/><path d="m5 12 7 7 7-7"/></svg>
                            Insert right
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={handleDuplicate}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                            Duplicate property
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={handleHide}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>
                            Hide
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={handleDelete}
                            className="text-destructive focus:text-destructive"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            Delete property
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/** Add property button with type picker */
function AddPropertyButton({
    properties,
    onEditProperties,
}: {
    properties: PropertyDefinition[];
    onEditProperties: (properties: PropertyDefinition[]) => void;
}) {
    const [showNameInput, setShowNameInput] = useState(false);
    const [newPropName, setNewPropName] = useState("");
    const [selectedType, setSelectedType] = useState<PropertyType>("text");

    const handleAdd = () => {
        if (!newPropName.trim()) {
            setShowNameInput(false);
            return;
        }
        const id = `prop_${Date.now()}`;
        const newProp: PropertyDefinition = { id, name: newPropName.trim(), type: selectedType };
        if (selectedType === "select" || selectedType === "multiSelect" || selectedType === "status") {
            newProp.options = selectedType === "status"
                ? ["Backlog", "In progress", "In review", "Done"]
                : ["Option 1", "Option 2", "Option 3"];
        }
        onEditProperties([...properties, newProp]);
        setNewPropName("");
        setSelectedType("text");
        setShowNameInput(false);
    };

    if (!showNameInput) {
        return (
            <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[11px] text-muted-foreground"
                onClick={() => setShowNameInput(true)}
            >
                +
            </Button>
        );
    }

    return (
        <div className="flex flex-col gap-1 min-w-[160px]">
            <Input
                autoFocus
                className="h-6 text-[12px]"
                placeholder="Property name"
                value={newPropName}
                onChange={(e) => setNewPropName(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd();
                    if (e.key === "Escape") setShowNameInput(false);
                }}
            />
            <NativeSelect
                value={selectedType}
                options={(Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map((type) => ({
                    value: type,
                    label: PROPERTY_TYPE_LABELS[type],
                }))}
                onChange={(val) => setSelectedType(val as PropertyType)}
                className="h-6 text-[11px] px-1.5 py-0.5"
            />
            <div className="flex gap-1">
                <Button size="sm" className="h-5 text-[10px] flex-1" onClick={handleAdd}>
                    Add
                </Button>
                <Button size="sm" variant="ghost" className="h-5 text-[10px]" onClick={() => setShowNameInput(false)}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}

export default function DatabaseTableView({
    databaseId,
    properties,
    rows,
    onEditProperties,
    onOpenRow,
}: DatabaseTableViewProps) {
    const createRow = useMutation(api.databases.createRow);
    const deleteRow = useMutation(api.databases.deleteRow);
    const updateRow = useMutation(api.databases.updateRow).withOptimisticUpdate(
        (localStore, args) => {
            const existingRows = localStore.getQuery(api.databases.listRows, { databaseId });
            if (existingRows !== undefined) {
                const updated = existingRows.map((row) =>
                    row._id === args.id ? { ...row, values: args.values } : row,
                );
                localStore.setQuery(api.databases.listRows, { databaseId }, updated);
            }
        },
    );
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const saveFileRecord = useMutation(api.files.saveFileRecord);

    const columns: ColumnDef<DatabaseRow>[] = properties.map((prop) => ({
        id: prop.id,
        header: () => (
            <PropertyHeader
                property={prop}
                properties={properties}
                onEditProperties={onEditProperties}
            />
        ),
        size: prop.type === "checkbox" ? 60 : prop.type === "progress" ? 200 : 180,
        cell: ({ row: tableRow }) => {
            const rowData = tableRow.original;
            const values: RowValues = JSON.parse(rowData.values);
            return (
                <CellEditor
                    row={rowData}
                    property={prop}
                    value={values[prop.id]}
                    allValues={values}
                    updateRow={updateRow}
                    generateUploadUrl={generateUploadUrl}
                    saveFileRecord={saveFileRecord}
                />
            );
        },
    }));

    // Add a delete action column
    columns.push({
        id: "_actions",
        header: "",
        size: 80,
        cell: ({ row: tableRow }) => (
            <div className="flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                {onOpenRow && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                        onClick={() => onOpenRow(tableRow.original._id)}
                    >
                        Open
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteRow({ id: tableRow.original._id })}
                >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="4" x2="12" y2="12" />
                        <line x1="12" y1="4" x2="4" y2="12" />
                    </svg>
                </Button>
            </div>
        ),
    });

    const table = useReactTable({
        data: rows,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row._id,
    });

    return (
        <div className="w-full overflow-x-auto">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    style={{ width: header.getSize() }}
                                    className="text-[11px] font-semibold text-muted-foreground/80 h-8 uppercase tracking-[0.06em]"
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                            <TableHead className="w-[100px] h-8">
                                <AddPropertyButton
                                    properties={properties}
                                    onEditProperties={onEditProperties}
                                />
                            </TableHead>
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} className="group/row hover:bg-accent/40 transition-colors">
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className="py-1 px-2">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                            <TableCell />
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Add row button */}
            <Button
                variant="ghost"
                className="w-full mt-1 h-8 text-[13px] text-muted-foreground hover:text-foreground justify-start pl-3 border-t border-border rounded-none"
                onClick={() => createRow({ databaseId })}
            >
                + New
            </Button>
        </div>
    );
}
