"use client";

import { useState, useEffect } from "react";
import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import type { Preloaded } from "convex/react";
import type { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import TrashPanel from "./TrashPanel";
import TrustIndicator from "./TrustIndicator";

export default function AppShell({
    children,
    preloadedUser,
}: {
    children: React.ReactNode;
    preloadedUser: Preloaded<typeof api.userAuth.getCurrentUser>;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [trashOpen, setTrashOpen] = useState(false);

    // Hydrate collapsed state after mount to avoid SSR mismatch
    useEffect(() => {
        const stored = localStorage.getItem("sidebar-collapsed");
        if (stored === "true") setCollapsed(true);
    }, []);
    const user = usePreloadedAuthQuery(preloadedUser);
    const router = useRouter();

    const toggleSidebar = () => {
        setCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem("sidebar-collapsed", String(next));
            return next;
        });
    };

    // If session expires while on page, user becomes null — redirect
    useEffect(() => {
        if (user === null) {
            router.replace("/login");
        }
    }, [user, router]);

    // Session expired — show spinner while redirect fires
    if (user === null) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <Navbar collapsed={collapsed} onToggleSidebar={toggleSidebar} user={user} />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    collapsed={collapsed}
                    trashOpen={trashOpen}
                    onToggleTrash={() => setTrashOpen((v) => !v)}
                />
                {trashOpen && (
                    <TrashPanel onClose={() => setTrashOpen(false)} />
                )}
                <main className="flex-1 overflow-y-auto bg-background">{children}</main>
            </div>
            <TrustIndicator />
        </div>
    );
}
