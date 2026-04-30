"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
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
import { Id } from "../../convex/_generated/dataModel";

type Page = {
    _id: Id<"pages">;
    title: string;
    updatedAt: number;
    parentId?: Id<"pages">;
    icon?: string;
};

export default function PageTreeItem({
    page,
    activePageId,
    depth = 0,
    filter,
}: {
    page: Page;
    activePageId: string | null;
    depth?: number;
    filter: string;
}) {
    const softDeletePage = useMutation(api.pages.softDelete);
    const createPage = useMutation(api.pages.create);
    const router = useRouter();

    // Persist expand state per page in sessionStorage
    const storageKey = `tree-expanded-${page._id}`;
    const [expanded, setExpanded] = useState(() => {
        if (typeof window === "undefined") return false;
        return sessionStorage.getItem(storageKey) === "true";
    });

    // Only subscribe to children when expanded or filtering (skip otherwise)
    const children = useQuery(
        api.pages.listChildren,
        expanded || filter ? { parentId: page._id } : "skip",
    );

    const toggleExpanded = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setExpanded((prev) => {
            const next = !prev;
            sessionStorage.setItem(storageKey, String(next));
            return next;
        });
    };

    const handleAddSubpage = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const pageId = await createPage({ title: "", parentId: page._id });
        // Expand parent to show new child
        setExpanded(true);
        sessionStorage.setItem(storageKey, "true");
        router.push(`/page/${pageId}`);
    };

    const isActive = page._id === activePageId;
    const hasChildren = children && children.length > 0;

    // When filtering, show all matching pages regardless of tree structure
    const filteredChildren = filter
        ? children?.filter((c) =>
              (c.title || "Untitled").toLowerCase().includes(filter.toLowerCase()),
          )
        : children;

    // If filtering and this page doesn't match and has no matching children, hide it
    if (filter) {
        const selfMatches = (page.title || "Untitled").toLowerCase().includes(filter.toLowerCase());
        const childMatches = filteredChildren && filteredChildren.length > 0;
        if (!selfMatches && !childMatches) return null;
    }

    return (
        <div>
            <div className="group/item flex items-center" style={{ paddingLeft: depth * 12 }}>
                {/* Expand/collapse toggle */}
                <button
                    onClick={toggleExpanded}
                    className={`w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent transition-colors ${
                        !hasChildren && !expanded ? "invisible" : ""
                    }`}
                >
                    <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform duration-150 ${expanded ? "rotate-90" : ""}`}
                    >
                        <path d="M3.5 1.5L7 5L3.5 8.5" />
                    </svg>
                </button>

                {/* Page link */}
                <Link
                    href={`/page/${page._id}`}
                    className={`flex items-center gap-1.5 px-1.5 py-[5px] rounded-md text-[13px] cursor-pointer whitespace-nowrap transition-colors flex-1 min-w-0 ${
                        isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                >
                    <span className="text-[13px] shrink-0">
                        {page.icon || (hasChildren || expanded ? "📁" : "📄")}
                    </span>
                    <span className="truncate flex-1">{page.title || "Untitled"}</span>
                </Link>

                {/* Action buttons - shown on hover */}
                <div className="flex items-center shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    {/* Add subpage */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-muted-foreground hover:text-foreground"
                        onClick={handleAddSubpage}
                        title="Add subpage"
                    >
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        >
                            <line x1="6" y1="2" x2="6" y2="10" />
                            <line x1="2" y1="6" x2="10" y2="6" />
                        </svg>
                    </Button>

                    {/* Delete */}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-muted-foreground hover:text-destructive"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 0 1 1.34-1.34h2.66a1.33 1.33 0 0 1 1.34 1.34V4m2 0v9.33a1.33 1.33 0 0 1-1.34 1.34H4.67a1.33 1.33 0 0 1-1.34-1.34V4h9.34Z" />
                                </svg>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Move to trash</AlertDialogTitle>
                                <AlertDialogDescription>
                                    &quot;{page.title || "Untitled"}&quot; and all its subpages will
                                    be moved to trash.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={async () => {
                                        await softDeletePage({ id: page._id });
                                        toast.success("Page moved to trash");
                                        if (isActive) {
                                            router.push("/home");
                                        }
                                    }}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Move to trash
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* Children */}
            {expanded && filteredChildren && filteredChildren.length > 0 && (
                <div>
                    {filteredChildren.map((child) => (
                        <PageTreeItem
                            key={child._id}
                            page={child}
                            activePageId={activePageId}
                            depth={depth + 1}
                            filter={filter}
                        />
                    ))}
                </div>
            )}

            {/* Show "No pages inside" when expanded but empty */}
            {expanded && children && children.length === 0 && (
                <p
                    className="text-[11px] text-muted-foreground/60 py-1"
                    style={{ paddingLeft: (depth + 1) * 12 + 20 }}
                >
                    No pages inside
                </p>
            )}
        </div>
    );
}
