"use client";

import { useQuery, useMutation } from "convex/react";
import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import type { Preloaded } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRef, useState, useEffect } from "react";
import DynamicBlockNoteEditor from "./DynamicBlockNoteEditor";
import DatabasePage from "./DatabasePage";
import { Id } from "../../convex/_generated/dataModel";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/utils";
import { toast } from "sonner";

export default function Editor({ pageId, preloadedPage }: { pageId: Id<"pages">; preloadedPage: Preloaded<typeof api.pages.get> }) {
    const page = usePreloadedAuthQuery(preloadedPage);
    const database = useQuery(api.databases.getByPage, page ? { pageId } : "skip");
    const updateTitle = useMutation(api.pages.updateTitle);
    const updateIcon = useMutation(api.pages.updateIcon);
    const updateCoverImage = useMutation(api.pages.updateCoverImage);
    const updateCoverYPosition = useMutation(api.pages.updateCoverYPosition);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const saveFileRecord = useMutation(api.files.saveFileRecord);
    const createDatabase = useMutation(api.databases.create);
    const titleRef = useRef<HTMLDivElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const iconPickerRef = useRef<HTMLDivElement>(null);
    const iconButtonRef = useRef<HTMLButtonElement>(null);
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [coverHovered, setCoverHovered] = useState(false);
    const [dragCoverYPosition, setDragCoverYPosition] = useState<number | null>(null);
    const [isRepositioning, setIsRepositioning] = useState(false);
    const repositionStartY = useRef<number | null>(null);
    const repositionStartPos = useRef<number>(50);
    const latestCoverYPosition = useRef(0);

    // During drag, use local state; otherwise read from server
    const coverYPosition = dragCoverYPosition ?? page?.coverYPosition ?? 50;

    // Build breadcrumb by fetching the parent (if any)
    const parent = useQuery(api.pages.get, page?.parentId ? { id: page.parentId } : "skip");

    // Click-outside handler for icon picker
    useEffect(() => {
        if (!showIconPicker) return;
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                iconPickerRef.current && !iconPickerRef.current.contains(target) &&
                iconButtonRef.current && !iconButtonRef.current.contains(target)
            ) {
                setShowIconPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showIconPicker]);

    const handleTitleBlur = () => {
        const text = titleRef.current?.innerText?.trim() || "";
        if (page && text !== page.title) {
            updateTitle({ id: pageId, title: text });
        }
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            titleRef.current?.blur();
        }
    };

    const handleAddDatabase = async () => {
        try {
            await createDatabase({ pageId });
            toast.success("Database created");
        } catch {
            toast.error("Failed to create database");
        }
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file");
            return;
        }
        try {
            const uploadUrl = await generateUploadUrl();
            const result = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            if (!result.ok) throw new Error("Upload failed");
            const { storageId } = await result.json();
            await saveFileRecord({ storageId, filename: file.name, mimeType: file.type, size: file.size });
            const siteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
            await updateCoverImage({ id: pageId, coverImage: `${siteUrl}/file/${storageId}` });
            setDragCoverYPosition(null);
            toast.success("Cover image added");
        } catch {
            toast.error("Failed to upload cover image");
        }
        // Reset the input so the same file can be re-selected
        e.target.value = "";
    };

    const handleRemoveCover = async () => {
        await updateCoverImage({ id: pageId, coverImage: undefined });
        toast.success("Cover image removed");
    };

    const handleIconSelect = async (emoji: string) => {
        await updateIcon({ id: pageId, icon: emoji });
        setShowIconPicker(false);
    };

    const handleRemoveIcon = async () => {
        await updateIcon({ id: pageId, icon: undefined });
        setShowIconPicker(false);
    };

    const handleRepositionMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        repositionStartY.current = e.clientY;
        repositionStartPos.current = coverYPosition;
        const handleMouseMove = (ev: MouseEvent) => {
            if (repositionStartY.current === null) return;
            const delta = ev.clientY - repositionStartY.current;
            const newPos = Math.max(0, Math.min(100, repositionStartPos.current - delta * 0.3));
            latestCoverYPosition.current = newPos;
            setDragCoverYPosition(newPos);
        };
        const handleMouseUp = () => {
            repositionStartY.current = null;
            setIsRepositioning(false);
            // Persist the final position (read from ref to avoid stale closure)
            updateCoverYPosition({ id: pageId, coverYPosition: latestCoverYPosition.current });
            // Clear local drag state so we read from server again
            setDragCoverYPosition(null);
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    if (page === undefined) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-12">
                <Skeleton className="h-10 w-48 rounded-md mb-8" />
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-6 w-full rounded-md" />
                    ))}
                </div>
            </div>
        );
    }

    if (page === null) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-12 text-center">
                <p className="text-lg text-muted-foreground">Page not found</p>
                <Link href="/home" className="text-sm text-primary underline mt-2 inline-block">
                    Back to homepage
                </Link>
            </div>
        );
    }

    return (
        <div>
            {/* Hidden cover upload input */}
            <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
            />

            {/* Top breadcrumb bar */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/40 px-4 py-1.5 flex items-center justify-between text-[13px]">
                <nav className="flex items-center gap-1 text-muted-foreground min-w-0">
                    {page.parentId ? (
                        <>
                            {parent && (
                                <>
                                    <Link
                                        href={`/page/${parent._id}`}
                                        className="hover:text-foreground transition-colors truncate max-w-[160px]"
                                    >
                                        {parent.title || "Untitled"}
                                    </Link>
                                    <span className="text-muted-foreground/50">/</span>
                                </>
                            )}
                            <span className="text-foreground truncate max-w-[200px] font-medium">
                                {page.icon && <span className="mr-1">{page.icon}</span>}
                                {page.title || "Untitled"}
                            </span>
                        </>
                    ) : (
                        <span className="text-foreground font-medium truncate max-w-[200px]">
                            {page.icon && <span className="mr-1">{page.icon}</span>}
                            {page.title || "Untitled"}
                        </span>
                    )}
                    <span className="text-muted-foreground/50 ml-1">🔒</span>
                    <span className="text-muted-foreground/60">Private</span>
                </nav>
                <span className="text-muted-foreground/60 shrink-0 ml-4">
                    Edited {timeAgo(page.updatedAt)}
                </span>
            </div>

            {/* Cover image */}
            {page.coverImage && (
                <div
                    className="relative w-full h-[35vh] min-h-[200px] group"
                    onMouseEnter={() => setCoverHovered(true)}
                    onMouseLeave={() => {
                        setCoverHovered(false);
                        setIsRepositioning(false);
                    }}
                >
                    <Image
                        src={page.coverImage}
                        alt="Cover"
                        fill
                        className="object-cover"
                        style={{ objectPosition: `center ${coverYPosition}%` }}
                        draggable={false}
                        unoptimized
                    />
                    {isRepositioning && (
                        <div
                            className="absolute inset-0 cursor-ns-resize"
                            onMouseDown={handleRepositionMouseDown}
                        />
                    )}
                    {/* Cover controls */}
                    {coverHovered && !isRepositioning && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            <button
                                onClick={() => coverInputRef.current?.click()}
                                className="px-3 py-1 text-xs font-medium bg-background/80 backdrop-blur-sm border border-border rounded-md text-foreground hover:bg-background transition-colors"
                            >
                                Change
                            </button>
                            <button
                                onClick={() => setIsRepositioning(true)}
                                className="px-3 py-1 text-xs font-medium bg-background/80 backdrop-blur-sm border border-border rounded-md text-foreground hover:bg-background transition-colors"
                            >
                                Reposition
                            </button>
                            <button
                                onClick={handleRemoveCover}
                                className="p-1.5 bg-background/80 backdrop-blur-sm border border-border rounded-md text-foreground hover:bg-background transition-colors"
                                title="Remove cover"
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
                                    <path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 0 1 1.34-1.34h2.66a1.33 1.33 0 0 1 1.34 1.34V4m2 0v9.33a1.33 1.33 0 0 1-1.34 1.34H4.67a1.33 1.33 0 0 1-1.34-1.34V4h9.34Z" />
                                </svg>
                            </button>
                        </div>
                    )}
                    {isRepositioning && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 text-xs font-medium bg-background/80 backdrop-blur-sm border border-border rounded-md text-foreground">
                            Drag image to reposition
                        </div>
                    )}
                </div>
            )}

            {/* Page content */}
            <div className={database ? "px-8 py-10" : "max-w-3xl mx-auto px-6 py-10"}>
                {/* Icon + Add icon / Add cover buttons */}
                <div className={`relative ${page.coverImage ? "-mt-8" : ""}`}>
                    {/* Icon */}
                    {page.icon && (
                        <div className="relative group/icon mb-3">
                            <button
                                ref={iconButtonRef}
                                onClick={() => setShowIconPicker(!showIconPicker)}
                                className="text-6xl hover:opacity-80 transition-opacity cursor-pointer"
                                title="Change icon"
                            >
                                {page.icon}
                            </button>
                        </div>
                    )}

                    {/* Icon picker popover */}
                    {showIconPicker && (
                        <div ref={iconPickerRef} className="absolute z-20 bg-popover border border-border rounded-lg shadow-lg p-3 w-[320px]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-foreground">
                                    Choose an icon
                                </span>
                                {page.icon && (
                                    <button
                                        onClick={handleRemoveIcon}
                                        className="text-xs text-destructive hover:underline"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-8 gap-1 max-h-[200px] overflow-y-auto">
                                {[
                                    "📄",
                                    "📝",
                                    "📋",
                                    "📌",
                                    "📎",
                                    "🔖",
                                    "📁",
                                    "📂",
                                    "💡",
                                    "🎯",
                                    "🚀",
                                    "⭐",
                                    "🔥",
                                    "💎",
                                    "🏆",
                                    "🎨",
                                    "💻",
                                    "🖥️",
                                    "📱",
                                    "⌨️",
                                    "🔧",
                                    "⚙️",
                                    "🛠️",
                                    "🔨",
                                    "📊",
                                    "📈",
                                    "📉",
                                    "🗂️",
                                    "🗃️",
                                    "🗄️",
                                    "📦",
                                    "🏷️",
                                    "✅",
                                    "❌",
                                    "⚠️",
                                    "ℹ️",
                                    "❓",
                                    "❗",
                                    "🔔",
                                    "🔕",
                                    "🌍",
                                    "🌐",
                                    "🏠",
                                    "🏢",
                                    "🎓",
                                    "📚",
                                    "🔬",
                                    "🧪",
                                    "❤️",
                                    "💚",
                                    "💙",
                                    "💜",
                                    "🤍",
                                    "🖤",
                                    "💛",
                                    "🧡",
                                    "🐛",
                                    "🐞",
                                    "🦋",
                                    "🐝",
                                    "🌱",
                                    "🌿",
                                    "🍃",
                                    "🌸",
                                ].map((emoji) => (
                                    <button
                                        key={emoji}
                                        onClick={() => handleIconSelect(emoji)}
                                        className="text-2xl p-1 hover:bg-accent rounded transition-colors"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add icon / Add cover buttons (shown when hovered over title area, before title) */}
                    {(!page.icon || !page.coverImage) && (
                        <div className="flex items-center gap-2 mb-2 opacity-0 hover:opacity-100 transition-opacity">
                            {!page.icon && (
                                <button
                                    onClick={() => setShowIconPicker(true)}
                                    className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                                >
                                    <span>😀</span> Add icon
                                </button>
                            )}
                            {!page.coverImage && (
                                <button
                                    onClick={() => coverInputRef.current?.click()}
                                    className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
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
                                        <rect x="1" y="2" width="14" height="12" rx="2" />
                                        <circle cx="5" cy="6" r="1.5" />
                                        <path d="M15 11l-4-4-7 7" />
                                    </svg>
                                    Add cover
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Editable title */}
                <div
                    ref={titleRef}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={handleTitleBlur}
                    onKeyDown={handleTitleKeyDown}
                    className="text-4xl font-bold text-foreground outline-none tracking-[-0.02em] empty:before:content-['Untitled'] empty:before:text-muted-foreground/40"
                >
                    {page.title}
                </div>

                {/* BlockNote Editor */}
                <div className="-ml-[54px]">
                    <DynamicBlockNoteEditor
                        pageId={pageId}
                        initialContent={page.content}
                        onAddDatabase={!database ? handleAddDatabase : undefined}
                    />
                </div>
            </div>

            {/* Database section — full width, outside max-w container */}
            {database ? (
                <div className="px-8 pb-10">
                    <DatabasePage databaseId={database._id} />
                </div>
            ) : null}
        </div>
    );
}
