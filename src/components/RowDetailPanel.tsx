"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
    PropertyDefinition,
    RowValues,
    AUTO_PROPERTY_TYPES,
    PROPERTY_TYPE_LABELS,
} from "@/lib/database-types";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { NativeSelect } from "@/components/ui/native-select";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from "@/components/ui/drawer";

interface DatabaseRow {
    _id: Id<"databaseRows">;
    databaseId: Id<"databases">;
    values: string;
    position: number;
}

interface SubTask {
    text: string;
    completed: boolean;
}

interface RowDetailPanelProps {
    open: boolean;
    row: DatabaseRow | null;
    properties: PropertyDefinition[];
    onClose: () => void;
}

/** Progress input with local state — only persists on blur */
function ProgressInput({ value, onSave }: { value: number; onSave: (v: number) => void }) {
    const [localVal, setLocalVal] = useState(value);
    useEffect(() => { setLocalVal(value); }, [value]);
    const commit = () => {
        if (localVal !== value) onSave(localVal);
    };
    return (
        <div className="flex items-center gap-2 w-full">
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
                className="w-14 bg-transparent border border-border rounded px-1.5 py-0.5 text-[13px] text-center outline-none focus:ring-1 focus:ring-ring"
            />
            <span className="text-[12px] text-muted-foreground">%</span>
        </div>
    );
}

/** Inline property editor for the detail panel */
function PropertyField({
    property,
    value,
    allValues,
    row,
}: {
    property: PropertyDefinition;
    value: unknown;
    allValues: RowValues;
    row: DatabaseRow;
}) {
    const updateRow = useMutation(api.databases.updateRow).withOptimisticUpdate(
        (localStore, args) => {
            const existingRows = localStore.getQuery(api.databases.listRows, { databaseId: row.databaseId });
            if (existingRows !== undefined) {
                const updated = existingRows.map((r) =>
                    r._id === args.id ? { ...r, values: args.values } : r,
                );
                localStore.setQuery(api.databases.listRows, { databaseId: row.databaseId }, updated);
            }
        },
    );
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const saveFileRecord = useMutation(api.files.saveFileRecord);
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Ref avoids stale closure — save() always reads latest allValues
    const allValuesRef = useRef(allValues);
    allValuesRef.current = allValues;

    const save = (newVal: unknown) => {
        const updated = { ...allValuesRef.current, [property.id]: newVal };
        updateRow({ id: row._id, values: JSON.stringify(updated) });
    };

    // Auto-populated types
    if (AUTO_PROPERTY_TYPES.includes(property.type)) {
        let display = "—";
        if (property.type === "createdTime" || property.type === "updatedTime") {
            if (value) {
                const d = new Date(String(value));
                display = `${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
            }
        } else if (property.type === "createdBy" || property.type === "lastEditedBy") {
            display = value ? String(value) : "—";
        } else if (property.type === "id") {
            display = value ? String(value) : "—";
        }
        return (
            <span className={`text-[13px] text-muted-foreground ${property.type === "id" ? "font-mono" : ""}`}>
                {display}
            </span>
        );
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
                className="min-w-[120px]"
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
                            className={`text-[12px] px-2 py-0.5 rounded-full border transition-colors ${
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
        if (!editing) {
            return (
                <div
                    className="cursor-text px-2 py-1 rounded hover:bg-accent/50 transition-colors text-[13px] min-w-[100px]"
                    onClick={() => {
                        setEditing(true);
                        setEditValue(String(value ?? ""));
                    }}
                >
                    {value ? (
                        <span className="inline-flex items-center gap-1.5">
                            <span className="h-5 w-5 rounded-full bg-primary/20 text-primary text-[10px] font-medium flex items-center justify-center shrink-0">
                                {String(value).charAt(0).toUpperCase()}
                            </span>
                            {String(value)}
                        </span>
                    ) : (
                        <span className="text-muted-foreground/40">Empty</span>
                    )}
                </div>
            );
        }
        return (
            <Input
                autoFocus
                className="h-8 text-[13px]"
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
        );
    }

    if (property.type === "file") {
        const fileData = value as { storageId: string; name: string } | null | undefined;
        return (
            <div className="flex items-center gap-2 text-[13px]">
                {fileData?.name ? (
                    <>
                        <a
                            href={`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/file/${fileData.storageId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline truncate"
                        >
                            {fileData.name}
                        </a>
                        <button
                            onClick={() => save(null)}
                            className="text-muted-foreground hover:text-destructive text-[11px] shrink-0"
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
                            + Attach file
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

    // Text, number, date, url — click to edit
    if (!editing) {
        return (
            <div
                className="cursor-text px-2 py-1 rounded hover:bg-accent/50 transition-colors text-[13px] min-w-[100px]"
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
            className="h-8 text-[13px]"
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

/** Comments section */
function CommentsSection({ rowId }: { rowId: Id<"databaseRows"> }) {
    const comments = useQuery(api.comments.listByRow, { rowId });
    const createComment = useMutation(api.comments.create);
    const removeComment = useMutation(api.comments.remove);
    const [newComment, setNewComment] = useState("");

    const handleSubmit = async () => {
        if (!newComment.trim()) return;
        await createComment({ rowId, content: newComment.trim() });
        setNewComment("");
    };

    return (
        <div className="space-y-3">
            <h3 className="text-[14px] font-semibold text-foreground">Comments</h3>

            {/* Comment list */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {comments?.map((comment) => (
                    <div key={comment._id} className="group/comment flex gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 text-primary text-[10px] font-medium flex items-center justify-center shrink-0 mt-0.5">
                            {comment.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-[12px] font-medium text-foreground">
                                    {comment.userName}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                    {new Date(comment.createdAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </span>
                                <button
                                    onClick={() => removeComment({ id: comment._id })}
                                    className="text-[10px] text-muted-foreground hover:text-destructive opacity-0 group-hover/comment:opacity-100 transition-opacity ml-auto"
                                >
                                    ✕
                                </button>
                            </div>
                            <p className="text-[13px] text-foreground/80 whitespace-pre-wrap break-words">
                                {comment.content}
                            </p>
                        </div>
                    </div>
                ))}
                {comments?.length === 0 && (
                    <p className="text-[12px] text-muted-foreground/50">No comments yet</p>
                )}
            </div>

            {/* New comment input */}
            <div className="flex gap-2">
                <Input
                    className="text-[13px] flex-1"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                />
                <Button size="sm" onClick={handleSubmit} disabled={!newComment.trim()}>
                    Send
                </Button>
            </div>
        </div>
    );
}

/** Sub-tasks section */
function SubTasksSection({
    subTasks,
    onUpdate,
}: {
    subTasks: SubTask[];
    onUpdate: (tasks: SubTask[]) => void;
}) {
    const [newTask, setNewTask] = useState("");

    const handleAdd = () => {
        if (!newTask.trim()) return;
        onUpdate([...subTasks, { text: newTask.trim(), completed: false }]);
        setNewTask("");
    };

    const handleToggle = (index: number) => {
        const updated = subTasks.map((t, i) =>
            i === index ? { ...t, completed: !t.completed } : t,
        );
        onUpdate(updated);
    };

    const handleDelete = (index: number) => {
        onUpdate(subTasks.filter((_, i) => i !== index));
    };

    const completedCount = subTasks.filter((t) => t.completed).length;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-foreground">Sub-tasks</h3>
                {subTasks.length > 0 && (
                    <span className="text-[11px] text-muted-foreground">
                        {completedCount}/{subTasks.length}
                    </span>
                )}
            </div>

            {/* Progress bar */}
            {subTasks.length > 0 && (
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                            width: `${subTasks.length > 0 ? (completedCount / subTasks.length) * 100 : 0}%`,
                        }}
                    />
                </div>
            )}

            {/* Task list */}
            <div className="space-y-1">
                {subTasks.map((task, i) => (
                    <div key={i} className="group/task flex items-center gap-2 py-0.5">
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggle(i)}
                            className="h-4 w-4 accent-primary cursor-pointer shrink-0"
                        />
                        <span
                            className={`text-[13px] flex-1 ${
                                task.completed
                                    ? "line-through text-muted-foreground"
                                    : "text-foreground"
                            }`}
                        >
                            {task.text}
                        </span>
                        <button
                            onClick={() => handleDelete(i)}
                            className="text-[10px] text-muted-foreground hover:text-destructive opacity-0 group-hover/task:opacity-100 transition-opacity"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            {/* Add new sub-task */}
            <div className="flex gap-2">
                <Input
                    className="text-[13px] flex-1 h-8"
                    placeholder="Add a sub-task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleAdd();
                    }}
                />
            </div>
        </div>
    );
}

/** Supporting files section */
function FilesSection({
    files,
    onUpdate,
}: {
    files: Array<{ storageId: string; name: string }>;
    onUpdate: (files: Array<{ storageId: string; name: string }>) => void;
}) {
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const saveFileRecord = useMutation(api.files.saveFileRecord);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (file: File) => {
        const url = await generateUploadUrl();
        const result = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
        });
        const { storageId } = await result.json();
        await saveFileRecord({ storageId, filename: file.name, mimeType: file.type, size: file.size });
        onUpdate([...files, { storageId, name: file.name }]);
    };

    const handleRemove = (index: number) => {
        onUpdate(files.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-2">
            <h3 className="text-[14px] font-semibold text-foreground">Supporting files</h3>

            <div className="space-y-1">
                {files.map((f, i) => (
                    <div
                        key={`${f.storageId}-${i}`}
                        className="group/file flex items-center gap-2 py-1 px-2 rounded hover:bg-accent/30"
                    >
                        <span className="text-[12px]">📎</span>
                        <a
                            href={`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/file/${f.storageId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[13px] text-primary underline truncate flex-1"
                        >
                            {f.name}
                        </a>
                        <button
                            onClick={() => handleRemove(i)}
                            className="text-[10px] text-muted-foreground hover:text-destructive opacity-0 group-hover/file:opacity-100 transition-opacity"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            >
                + Add a file
            </button>
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    await handleUpload(file);
                    e.target.value = "";
                }}
            />
        </div>
    );
}

/** Main Row Detail Panel */
export default function RowDetailPanel({ open, row, properties, onClose }: RowDetailPanelProps) {
    const databaseId = row?.databaseId;
    const updateRow = useMutation(api.databases.updateRow).withOptimisticUpdate(
        (localStore, args) => {
            if (!databaseId) return;
            const existingRows = localStore.getQuery(api.databases.listRows, { databaseId });
            if (existingRows !== undefined) {
                const updated = existingRows.map((r) =>
                    r._id === args.id ? { ...r, values: args.values } : r,
                );
                localStore.setQuery(api.databases.listRows, { databaseId }, updated);
            }
        },
    );
    const values: RowValues = row ? JSON.parse(row.values) : {};

    const titleProp = properties.find((p) => p.id === "title") ?? properties[0];
    const title = titleProp ? String(values[titleProp.id] ?? "") : "";

    // Extract special fields from values
    const description = (values._description as string) ?? "";
    const subTasks = (values._subTasks as SubTask[]) ?? [];
    const files = (values._files as Array<{ storageId: string; name: string }>) ?? [];

    const [editingTitle, setEditingTitle] = useState(false);
    const [titleValue, setTitleValue] = useState(title);
    const [descriptionValue, setDescriptionValue] = useState(description);
    const [editingDesc, setEditingDesc] = useState(false);

    // Reset editing states when switching rows
    const rowId = row?._id;
    useEffect(() => {
        setEditingTitle(false);
        setEditingDesc(false);
    }, [rowId]);

    // Ref avoids stale closure — saveValues always reads latest values
    const valuesRef = useRef(values);
    valuesRef.current = values;

    const saveValues = (patch: Partial<RowValues>) => {
        if (!row) return;
        const updated = { ...valuesRef.current, ...patch };
        updateRow({ id: row._id, values: JSON.stringify(updated) });
    };

    const handleTitleSave = () => {
        setEditingTitle(false);
        if (titleValue !== title && titleProp) {
            saveValues({ [titleProp.id]: titleValue });
        }
    };

    const otherProperties = properties.filter((p) => p.id !== titleProp?.id);

    return (
        <Drawer open={open} onOpenChange={(o) => { if (!o) onClose(); }} direction="right">
            <DrawerContent className="h-full w-[480px] max-w-[90vw] sm:max-w-[480px] flex flex-col">
                <DrawerHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-border shrink-0 space-y-0">
                    <div>
                        <DrawerTitle className="text-[13px] font-medium text-muted-foreground">Details</DrawerTitle>
                        <DrawerDescription className="sr-only">Row details panel</DrawerDescription>
                    </div>
                    <DrawerClose asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground"
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 16 16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="4" y1="4" x2="12" y2="12" />
                                <line x1="12" y1="4" x2="4" y2="12" />
                            </svg>
                        </Button>
                    </DrawerClose>
                </DrawerHeader>

                {row && <div className="px-4 py-4 space-y-5 overflow-y-auto flex-1">
                    {/* Title */}
                    {editingTitle ? (
                        <Input
                            autoFocus
                            className="text-lg font-semibold"
                            value={titleValue}
                            onChange={(e) => setTitleValue(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleTitleSave();
                                if (e.key === "Escape") {
                                    setTitleValue(title);
                                    setEditingTitle(false);
                                }
                            }}
                        />
                    ) : (
                        <h2
                            className="text-lg font-semibold text-foreground cursor-text hover:bg-accent/30 rounded px-1 py-0.5 -mx-1 transition-colors"
                            onClick={() => {
                                setTitleValue(title);
                                setEditingTitle(true);
                            }}
                        >
                            {title || "Untitled"}
                        </h2>
                    )}

                    {/* Properties */}
                    <div className="space-y-2">
                        {otherProperties.map((prop) => (
                            <div key={prop.id} className="flex items-start gap-3">
                                <span className="text-[12px] text-muted-foreground w-28 shrink-0 pt-1.5">
                                    {prop.name}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <PropertyField
                                        property={prop}
                                        value={values[prop.id]}
                                        allValues={values}
                                        row={row}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <Separator />

                    {/* Description */}
                    <div className="space-y-2">
                        <h3 className="text-[14px] font-semibold text-foreground">Description</h3>
                        {editingDesc ? (
                            <textarea
                                autoFocus
                                className="w-full min-h-[100px] bg-transparent border border-border rounded-md px-3 py-2 text-[13px] text-foreground resize-y outline-none focus:ring-1 focus:ring-ring"
                                placeholder="Add a description..."
                                value={descriptionValue}
                                onChange={(e) => setDescriptionValue(e.target.value)}
                                onBlur={() => {
                                    setEditingDesc(false);
                                    if (descriptionValue !== description) {
                                        saveValues({ _description: descriptionValue });
                                    }
                                }}
                            />
                        ) : (
                            <div
                                className="min-h-[60px] px-3 py-2 rounded-md border border-transparent hover:border-border cursor-text text-[13px] transition-colors"
                                onClick={() => {
                                    setDescriptionValue(description);
                                    setEditingDesc(true);
                                }}
                            >
                                {description ? (
                                    <p className="text-foreground/80 whitespace-pre-wrap">{description}</p>
                                ) : (
                                    <p className="text-muted-foreground/40">Add a description...</p>
                                )}
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Sub-tasks */}
                    <SubTasksSection
                        subTasks={subTasks}
                        onUpdate={(tasks) => saveValues({ _subTasks: tasks })}
                    />

                    <Separator />

                    {/* Supporting files */}
                    <FilesSection
                        files={files}
                        onUpdate={(f) => saveValues({ _files: f })}
                    />

                    <Separator />

                    {/* Comments */}
                    <CommentsSection rowId={row._id} />
                </div>}
            </DrawerContent>
        </Drawer>
    );
}
