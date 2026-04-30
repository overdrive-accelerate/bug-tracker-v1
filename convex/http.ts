import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./betterAuth/auth";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

// Serve uploaded files by storageId
// Note: No auth check here — files are served via <img src> and <a href> tags
// which cannot send Authorization headers. Security relies on storageId opacity
// (unguessable UUIDs) and the files table for programmatic access control.
http.route({
    path: "/file/{storageId}",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
        const url = new URL(request.url);
        const storageId = url.pathname.split("/file/")[1];
        if (!storageId) {
            return new Response("Missing storageId", { status: 400 });
        }

        // Validate storageId format (Convex IDs are alphanumeric with underscores)
        if (!/^[a-zA-Z0-9_]+$/.test(storageId)) {
            return new Response("Invalid storageId", { status: 400 });
        }

        const blob = await ctx.storage.get(storageId as Id<"_storage">);
        if (!blob) {
            return new Response("File not found", { status: 404 });
        }

        return new Response(blob, {
            headers: {
                "Cache-Control": "public, max-age=31536000, immutable",
                "Content-Type": blob.type || "application/octet-stream",
                "X-Content-Type-Options": "nosniff",
            },
        });
    }),
});

export default http;
