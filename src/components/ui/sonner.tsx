"use client";

import * as React from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Toaster as Sonner } from "sonner";
import {
    CheckCircle2,
    Info,
    AlertTriangle,
    XCircle,
    Loader2,
} from "lucide-react";

const Toaster = ({ ...props }) => {
    const { theme = "dark" } = useTheme();

    return (
        <Sonner
            theme={theme}
            className="toaster group"
            icons={{
                success: <CheckCircle2 className="size-4" />,
                info: <Info className="size-4" />,
                warning: <AlertTriangle className="size-4" />,
                error: <XCircle className="size-4" />,
                loading: <Loader2 className="size-4 animate-spin" />,
            }}
            style={
                {
                    "--normal-bg": "var(--popover)",
                    "--normal-text": "var(--popover-foreground)",
                    "--normal-border": "var(--border)",
                    "--border-radius": "var(--radius)",
                } as React.CSSProperties
            }
            toastOptions={{
                classNames: {
                    toast: "cn-toast",
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
