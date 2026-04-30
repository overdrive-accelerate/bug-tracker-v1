"use client";

import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const { theme, toggleTheme, mounted } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Toggle theme"
        >
            {mounted && (theme === "dark" ? (
                <Sun size={16} />
            ) : (
                <Moon size={16} />
            ))}
        </button>
    );
}
