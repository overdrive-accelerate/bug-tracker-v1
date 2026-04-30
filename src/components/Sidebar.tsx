"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { usePathname } from "next/navigation";
import { useState } from "react";
import PageTreeItem from "./PageTreeItem";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Sidebar({
    collapsed,
    trashOpen,
    onToggleTrash,
}: {
    collapsed: boolean;
    trashOpen: boolean;
    onToggleTrash: () => void;
}) {
    const pages = useQuery(api.pages.list);
    const pathname = usePathname();
    const createPage = useMutation(api.pages.create);
    const createDatabase = useMutation(api.databases.create);
    const router = useRouter();
    const [filter, setFilter] = useState("");

    const activePageId = pathname.startsWith("/page/") ? pathname.split("/page/")[1] : null;

    const handleNewPage = async () => {
        const id = await createPage({ title: "" });
        router.push(`/page/${id}`);
    };

    const handleNewDatabase = async () => {
        const id = await createPage({ title: "Untitled Database" });
        await createDatabase({ pageId: id });
        router.push(`/page/${id}`);
    };

    return (
        <aside
            className={`bg-card border-r border-border shrink-0 transition-all duration-250 overflow-hidden ${
                collapsed ? "w-0 border-r-0" : "w-[252px]"
            }`}
        >
            <div className="flex flex-col h-full min-w-[252px] w-[252px]">
            {/* Search */}
            <div className="px-3 pt-3 pb-1">
                <Input
                    placeholder="Search…"
                    className="h-[30px] text-[12px] bg-transparent border-border/60 focus:border-primary/30 transition-colors"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>

            {/* Page tree */}
            <nav className="flex-1 overflow-y-auto px-1.5 pt-2">
                {/* Private section header */}
                <div className="flex items-center justify-between px-2 mb-1">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.1em]">
                        Private
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-muted-foreground hover:text-foreground"
                        onClick={handleNewPage}
                        title="Add a page"
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <line x1="6" y1="2" x2="6" y2="10" />
                            <line x1="2" y1="6" x2="10" y2="6" />
                        </svg>
                    </Button>
                </div>

                {pages === undefined ? (
                    <div className="space-y-1 px-2">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-7 w-full rounded-md" />
                        ))}
                    </div>
                ) : pages.length === 0 ? (
                    <p className="text-[12px] text-muted-foreground/60 px-2.5 py-1">
                        {filter ? "No matches" : "No pages yet"}
                    </p>
                ) : (
                    pages.map((page) => (
                        <PageTreeItem
                            key={page._id}
                            page={page}
                            activePageId={activePageId}
                            depth={0}
                            filter={filter}
                        />
                    ))
                )}

                {/* Add new */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 px-2.5 py-[5px] mt-1 text-[13px] text-muted-foreground/60 hover:text-muted-foreground hover:bg-accent rounded-md w-full transition-colors">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <line x1="6" y1="2" x2="6" y2="10" />
                                <line x1="2" y1="6" x2="10" y2="6" />
                            </svg>
                            Add new
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px]">
                        <DropdownMenuItem onSelect={handleNewPage} className="gap-2.5 py-2">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0">
                                <rect x="3" y="2" width="14" height="16" rx="2" />
                                <line x1="7" y1="7" x2="13" y2="7" />
                                <line x1="7" y1="11" x2="11" y2="11" />
                            </svg>
                            Empty page
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={handleNewDatabase} className="gap-2.5 py-2">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0">
                                <rect x="2" y="3" width="16" height="14" rx="2" />
                                <line x1="2" y1="7" x2="18" y2="7" />
                                <line x1="2" y1="11" x2="18" y2="11" />
                                <line x1="8" y1="3" x2="8" y2="17" />
                            </svg>
                            Empty database
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Trash */}
                <button
                    onClick={onToggleTrash}
                    className={`flex items-center gap-2 px-2.5 py-[6px] mt-1 rounded-md text-[13px] w-full transition-colors ${
                        trashOpen
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground/60 hover:text-muted-foreground hover:bg-accent"
                    }`}
                >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 0 1 1.34-1.34h2.66a1.33 1.33 0 0 1 1.34 1.34V4m2 0v9.33a1.33 1.33 0 0 1-1.34 1.34H4.67a1.33 1.33 0 0 1-1.34-1.34V4h9.34Z" />
                    </svg>
                    Trash
                </button>
            </nav>
            </div>
        </aside>
    );
}
