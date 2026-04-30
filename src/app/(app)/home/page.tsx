"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
    const pages = useQuery(api.pages.list);
    const createPage = useMutation(api.pages.create);
    const createDatabase = useMutation(api.databases.create);
    const router = useRouter();

    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    const handleNewPage = async () => {
        const id = await createPage({ title: "" });
        router.push(`/page/${id}`);
    };

    const handleNewDatabase = async () => {
        const id = await createPage({ title: "Untitled Database" });
        await createDatabase({ pageId: id });
        router.push(`/page/${id}`);
    };

    // Show only the 5 most recently updated pages
    const recentPages = pages?.slice(0, 5);

    return (
        <div className="max-w-2xl mx-auto px-6 py-16">
            {/* Greeting */}
            <h1 className="text-3xl font-bold text-foreground text-center mb-12">
                {greeting}
            </h1>

            {/* Quick actions */}
            <div className="flex gap-3 justify-center mb-12">
                <button
                    onClick={handleNewPage}
                    className="flex flex-col items-start gap-2 w-[180px] p-4 rounded-lg border border-border hover:border-primary/30 hover:shadow-sm bg-card transition-all text-left"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                        <rect x="3" y="2" width="14" height="16" rx="2" />
                        <line x1="7" y1="7" x2="13" y2="7" />
                        <line x1="7" y1="11" x2="11" y2="11" />
                    </svg>
                    <span className="text-[14px] font-medium text-foreground">Empty page</span>
                </button>

                <button
                    onClick={handleNewDatabase}
                    className="flex flex-col items-start gap-2 w-[180px] p-4 rounded-lg border border-border hover:border-primary/30 hover:shadow-sm bg-card transition-all text-left"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                        <rect x="2" y="3" width="16" height="14" rx="2" />
                        <line x1="2" y1="7" x2="18" y2="7" />
                        <line x1="2" y1="11" x2="18" y2="11" />
                        <line x1="8" y1="3" x2="8" y2="17" />
                    </svg>
                    <span className="text-[14px] font-medium text-foreground">Empty database</span>
                </button>
            </div>

            {/* Recently visited */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                        <circle cx="8" cy="8" r="6.5" />
                        <polyline points="8,4.5 8,8 10.5,9.5" />
                    </svg>
                    <span className="text-[13px] text-muted-foreground font-medium">Recently visited</span>
                </div>

                {pages === undefined ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-10 w-full rounded-md" />
                        ))}
                    </div>
                ) : recentPages && recentPages.length > 0 ? (
                    <div className="space-y-0.5">
                        {recentPages.map((page) => (
                            <Link
                                key={page._id}
                                href={`/page/${page._id}`}
                                className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-accent transition-colors group"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="text-[15px]">📄</span>
                                    <span className="text-[14px] text-foreground truncate group-hover:text-primary transition-colors">
                                        {page.title || "Untitled"}
                                    </span>
                                </div>
                                <span className="text-[12px] text-muted-foreground/60 shrink-0 ml-4">
                                    {timeAgo(page.updatedAt)}
                                </span>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">No pages yet</p>
                        <p className="text-sm text-muted-foreground/60 mt-1">
                            Click &quot;Empty page&quot; above to create your first page
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
