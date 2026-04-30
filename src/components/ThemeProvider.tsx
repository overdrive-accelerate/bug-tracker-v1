"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";

type ThemeContextValue = {
    theme: "dark" | "light";
    toggleTheme: () => void;
    mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Default to "dark" to match the server-rendered class on <html>
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const [mounted, setMounted] = useState(false);

    // On mount, read from localStorage and sync
    useEffect(() => {
        const stored = localStorage.getItem("theme");
        if (stored === "light") {
            setTheme("light");
        }
        setMounted(true);
    }, []);

    // useLayoutEffect ensures the class is toggled BEFORE the browser paints.
    // disable-transitions kills all CSS transitions/animations during the swap.
    useLayoutEffect(() => {
        if (!mounted) return;
        const root = document.documentElement;
        root.classList.add("disable-transitions");
        root.classList.toggle("dark", theme === "dark");
        localStorage.setItem("theme", theme);
        // Force a reflow so the browser applies styles with transitions disabled,
        // then re-enable transitions on the next frame.
        root.offsetHeight;
        requestAnimationFrame(() => root.classList.remove("disable-transitions"));
    }, [theme, mounted]);

    const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

    return <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
    return ctx;
}
