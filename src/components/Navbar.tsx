"use client";

import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sun, Moon } from "lucide-react";

export default function Navbar({
    collapsed,
    onToggleSidebar,
    user,
}: {
    collapsed: boolean;
    onToggleSidebar: () => void;
    user: { name?: string; email?: string; image?: string | null } | null;
}) {
    const { theme, toggleTheme, mounted } = useTheme();
    const router = useRouter();

    const handleLogout = async () => {
        await authClient.signOut();
        toast.success("Signed out successfully");
        router.push("/login");
        router.refresh();
    };

    const userName = user?.name || "User";
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <header className="h-11 bg-card border-b border-border flex items-center px-3 shrink-0 z-50 gap-2">
            {/* Left: Logo + Toggle */}
            <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-[28px] h-[28px] bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center text-white text-[12px] font-extrabold shadow-[0_2px_8px_rgba(99,102,241,0.3)]">
                        T
                    </div>
                    <span className="font-bold text-[15px] text-foreground tracking-[-0.01em]">Taxstar</span>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground"
                    onClick={onToggleSidebar}
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <svg
                        width="15"
                        height="15"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    >
                        <line x1="2" y1="4" x2="14" y2="4" />
                        <line x1="2" y1="8" x2="14" y2="8" />
                        <line x1="2" y1="12" x2="14" y2="12" />
                    </svg>
                </Button>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right: Theme toggle + User */}
            <div className="flex items-center gap-1.5 shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                    onClick={toggleTheme}
                    title="Toggle theme"
                >
                    {mounted && (theme === "dark" ? (
                        <Sun size={15} />
                    ) : (
                        <Moon size={15} />
                    ))}
                </Button>

                <div className="flex items-center gap-1.5 cursor-pointer px-1.5 py-1 rounded-md hover:bg-accent transition-colors">
                    <div className="w-[24px] h-[24px] rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-[10px] font-semibold shrink-0 shadow-[0_1px_4px_rgba(99,102,241,0.25)]">
                        {userInitial}
                    </div>
                    <span className="text-[13px] font-medium text-foreground hidden sm:block">
                        {userName}
                    </span>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[12px] text-muted-foreground"
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </div>
        </header>
    );
}
