"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

import { filterSuggestionItems } from "@blocknote/core/extensions";
import { useCreateBlockNote, getDefaultReactSlashMenuItems, SuggestionMenuController } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useRef } from "react";
import { useTheme } from "./ThemeProvider";

export default function BlockNoteEditor({
    pageId,
    initialContent,
    onAddDatabase,
}: {
    pageId: Id<"pages">;
    initialContent?: string;
    onAddDatabase?: () => void;
}) {
    const updateContent = useMutation(api.pages.updateContent);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const saveFileRecord = useMutation(api.files.saveFileRecord);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingRef = useRef<string | null>(null);
    const { theme } = useTheme();

    const parsedContent = (() => {
        if (!initialContent) return undefined;
        try {
            return JSON.parse(initialContent);
        } catch {
            console.error("Failed to parse page content");
            return undefined;
        }
    })();

    const editor = useCreateBlockNote({
        initialContent: parsedContent,
        uploadFile: async (file: File) => {
            const uploadUrl = await generateUploadUrl();
            const result = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            if (!result.ok) throw new Error("Upload failed");
            const { storageId } = await result.json();
            await saveFileRecord({ storageId, filename: file.name, mimeType: file.type, size: file.size });
            const siteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
            return `${siteUrl}/file/${storageId}`;
        },
    });

    const handleChange = () => {
        const json = JSON.stringify(editor.document);
        pendingRef.current = json;

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (pendingRef.current !== null) {
                updateContent({ id: pageId, content: pendingRef.current });
                pendingRef.current = null;
            }
        }, 500);
    };

    const getSlashMenuItems = async (query: string) => {
        const defaultItems = getDefaultReactSlashMenuItems(editor);

        const databaseItem = onAddDatabase
            ? {
                  title: "Inline Database",
                  onItemClick: () => onAddDatabase(),
                  aliases: ["database", "db", "kanban"],
                  group: "Other",
                  subtext: "Add an inline database with views",
              }
            : null;

        const allItems = databaseItem
            ? [...defaultItems, databaseItem]
            : defaultItems;

        return filterSuggestionItems(allItems, query);
    };

    return (
        <BlockNoteView
            editor={editor}
            onChange={handleChange}
            theme={theme === "dark" ? "dark" : "light"}
            slashMenu={false}
        >
            <SuggestionMenuController
                triggerCharacter="/"
                getItems={getSlashMenuItems}
            />
        </BlockNoteView>
    );
}
