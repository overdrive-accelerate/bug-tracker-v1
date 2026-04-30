import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        return await ctx.storage.generateUploadUrl();
    },
});

export const saveFileRecord = mutation({
    args: {
        storageId: v.id("_storage"),
        filename: v.string(),
        mimeType: v.string(),
        size: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        const userId = identity.subject;

        // Validate inputs
        if (args.filename.length > 500) throw new Error("Filename too long");
        if (args.mimeType.length > 200) throw new Error("MIME type too long");
        if (args.size < 0 || args.size > 100 * 1024 * 1024) throw new Error("Invalid file size");

        await ctx.db.insert("files", {
            storageId: args.storageId,
            userId,
            filename: args.filename,
            mimeType: args.mimeType,
            size: args.size,
            createdAt: Date.now(),
        });

        return args.storageId;
    },
});

export const getUrl = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        // Verify the user owns this file
        const fileRecord = await ctx.db
            .query("files")
            .withIndex("by_storageId", (q) => q.eq("storageId", args.storageId))
            .first();
        if (!fileRecord || fileRecord.userId !== identity.subject) return null;

        return await ctx.storage.getUrl(args.storageId);
    },
});

export const deleteFile = mutation({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        const userId = identity.subject;

        const fileRecord = await ctx.db
            .query("files")
            .withIndex("by_storageId", (q) => q.eq("storageId", args.storageId))
            .first();
        if (!fileRecord || fileRecord.userId !== userId) throw new Error("Not authorized");

        await ctx.storage.delete(args.storageId);
        await ctx.db.delete(fileRecord._id);
    },
});
