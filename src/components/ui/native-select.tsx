"use client";

import { cn } from "@/lib/utils";

type OptionItem = string | { value: string; label: string };

interface NativeSelectProps {
    value: string;
    options: OptionItem[];
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function NativeSelect({
    value,
    options,
    onChange,
    placeholder = "Select\u2026",
    className,
}: NativeSelectProps) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
                "w-full appearance-none bg-transparent border border-border rounded px-2 py-1 text-[13px] text-foreground outline-none cursor-pointer",
                "hover:bg-accent/50 focus:ring-1 focus:ring-ring transition-colors",
                "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22none%22%20stroke%3D%22%238e8d9c%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%3E%3Cpath%20d%3D%22M4%206l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_6px_center] bg-no-repeat pr-6",
                className,
            )}
        >
            <option value="" disabled>
                {placeholder}
            </option>
            {options.map((opt) => {
                const val = typeof opt === "string" ? opt : opt.value;
                const label = typeof opt === "string" ? opt : opt.label;
                return (
                    <option key={val} value={val}>
                        {label}
                    </option>
                );
            })}
        </select>
    );
}
