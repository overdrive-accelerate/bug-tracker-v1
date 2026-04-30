"use client";

import dynamic from "next/dynamic";

const BlockNoteEditor = dynamic(() => import("./BlockNoteEditor"), {
    ssr: false,
    loading: () => (
        <div className="space-y-3 py-4">
            <div className="h-6 w-full rounded-md bg-muted animate-pulse" />
            <div className="h-6 w-3/4 rounded-md bg-muted animate-pulse" />
            <div className="h-6 w-1/2 rounded-md bg-muted animate-pulse" />
        </div>
    ),
});

export default BlockNoteEditor;
