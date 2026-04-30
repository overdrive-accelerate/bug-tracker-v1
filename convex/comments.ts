import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getQueryUserId, getAuthUserId } from "./lib/auth";

export const listByRow = query({
    args: { rowId: v.id("databaseRows") },
    handler: async (ctx, args) => {
        const userId = await getQueryUserId(ctx);
        if (!userId) return [];

        // Verify row ownership via database
        const row = await ctx.db.get(args.rowId);
        if (!row) return [];
        const db = await ctx.db.get(row.databaseId);
        if (!db || db.userId !== userId) return [];

        return await ctx.db
            .query("comments")
            .withIndex("by_row", (q) => q.eq("rowId", args.rowId))
            .collect();
    },
});

export const create = mutation({
    args: { rowId: v.id("databaseRows"), content: v.string() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (args.content.length === 0) throw new Error("Comment cannot be empty");
        if (args.content.length > 5000) throw new Error("Comment too long");

        // Verify row ownership via database
        const row = await ctx.db.get(args.rowId);
        if (!row) throw new Error("Row not found");
        const db = await ctx.db.get(row.databaseId);
        if (!db || db.userId !== userId) throw new Error("Not authorized");

        const identity = await ctx.auth.getUserIdentity();
        const userName = identity?.name ?? identity?.email ?? "Unknown";

        return await ctx.db.insert("comments", {
            rowId: args.rowId,
            userId,
            userName,
            content: args.content,
            createdAt: Date.now(),
        });
    },
});

export const remove = mutation({
    args: { id: v.id("comments") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const comment = await ctx.db.get(args.id);
        if (!comment) throw new Error("Comment not found");

        // Only the comment author can delete
        if (comment.userId !== userId) throw new Error("Not authorized");

        await ctx.db.delete(args.id);
    },
});
