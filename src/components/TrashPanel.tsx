"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { timeAgo } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useState } from "react";

export default function TrashPanel({ onClose }: { onClose: () => void }) {
    const pages = useQuery(api.pages.listDeleted);
    const restorePage = useMutation(api.pages.restore);
    const removePage = useMutation(api.pages.remove);
    const [search, setSearch] = useState("");

    const filtered = pages?.filter((p) =>
        (p.title || "Untitled").toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div className="w-[340px] h-full border-r border-border bg-card flex flex-col shrink-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2">
                <h2 className="text-sm font-semibold text-foreground">Trash</h2>
                <button
                    onClick={onClose}
                    className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    >
                        <line x1="3" y1="3" x2="11" y2="11" />
                        <line x1="11" y1="3" x2="3" y2="11" />
                    </svg>
                </button>
            </div>

            {/* Search */}
            <div className="px-3 pb-2">
                <Input
                    placeholder="Search pages in Trash"
                    className="h-8 text-[13px] bg-transparent"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-2">
                {filtered === undefined ? (
                    <div className="space-y-1 px-1 pt-2">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-12 rounded-md bg-muted/30 animate-pulse"
                            />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <svg
                            width="28"
                            height="28"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mb-2 opacity-50"
                        >
                            <path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 0 1 1.34-1.34h2.66a1.33 1.33 0 0 1 1.34 1.34V4m2 0v9.33a1.33 1.33 0 0 1-1.34 1.34H4.67a1.33 1.33 0 0 1-1.34-1.34V4h9.34Z" />
                        </svg>
                        <span className="text-[13px]">No results</span>
                    </div>
                ) : (
                    <div className="space-y-0.5">
                        {filtered.map((page) => (
                            <div
                                key={page._id}
                                className="group flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-accent/50 transition-colors"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="text-[13px] font-medium text-foreground truncate">
                                        {page.title || "Untitled"}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Deleted{" "}
                                        {timeAgo(page.deletedAt ?? page.updatedAt)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-6 px-2 text-[11px]"
                                        onClick={async () => {
                                            await restorePage({ id: page._id });
                                            toast.success("Page restored");
                                        }}
                                    >
                                        Restore
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-2 text-[11px] text-destructive hover:text-destructive"
                                            >
                                                Delete
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Delete permanently
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete &quot;
                                                    {page.title || "Untitled"}&quot; and
                                                    all its content. This cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                    Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={async () => {
                                                        await removePage({
                                                            id: page._id,
                                                        });
                                                        toast.success(
                                                            "Page permanently deleted",
                                                        );
                                                    }}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Delete forever
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer note */}
            <div className="px-3 py-2.5 border-t border-border">
                <p className="text-[11px] text-muted-foreground/60">
                    Pages in Trash for 30 days will be automatically deleted.
                </p>
            </div>
        </div>
    );
}
