import { query, mutation, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { getQueryUserId, getAuthUserId } from "./lib/auth";

export const list = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getQueryUserId(ctx);
        if (!userId) return [];
        const pages = await ctx.db
            .query("pages")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) =>
                q.and(
                    q.neq(q.field("isDeleted"), true),
                    q.eq(q.field("parentId"), undefined),
                ),
            )
            .order("desc")
            .collect();
        return pages;
    },
});

export const listChildren = query({
    args: { parentId: v.id("pages") },
    handler: async (ctx, args) => {
        const userId = await getQueryUserId(ctx);
        if (!userId) return [];
        const pages = await ctx.db
            .query("pages")
            .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
            .filter((q) => q.neq(q.field("isDeleted"), true))
            .collect();
        // Verify ownership
        return pages.filter((p) => p.userId === userId);
    },
});

export const listDeleted = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getQueryUserId(ctx);
        if (!userId) return [];
        const pages = await ctx.db
            .query("pages")
            .withIndex("by_user_deleted", (q) => q.eq("userId", userId).eq("isDeleted", true))
            .collect();
        return pages.sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0));
    },
});

export const get = query({
    args: { id: v.id("pages") },
    handler: async (ctx, args) => {
        const userId = await getQueryUserId(ctx);
        if (!userId) return null;
        const page = await ctx.db.get(args.id);
        if (!page || page.userId !== userId) return null;
        return page;
    },
});

export const create = mutation({
    args: { title: v.string(), parentId: v.optional(v.id("pages")) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (args.title.length > 1000) throw new Error("Title too long");

        // If creating a subpage, verify parent ownership
        if (args.parentId) {
            const parent = await ctx.db.get(args.parentId);
            if (!parent || parent.userId !== userId) throw new Error("Not authorized");
        }

        const pageId = await ctx.db.insert("pages", {
            title: args.title,
            userId,
            updatedAt: Date.now(),
            parentId: args.parentId,
        });

        return pageId;
    },
});

export const updateContent = mutation({
    args: { id: v.id("pages"), content: v.string() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const page = await ctx.db.get(args.id);
        if (!page || page.userId !== userId) throw new Error("Not authorized");

        if (args.content.length > 500_000) throw new Error("Content too large");

        await ctx.db.patch(args.id, {
            content: args.content,
            updatedAt: Date.now(),
        });
    },
});

export const updateTitle = mutation({
    args: { id: v.id("pages"), title: v.string() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const page = await ctx.db.get(args.id);
        if (!page || page.userId !== userId) throw new Error("Not authorized");

        if (args.title.length > 1000) throw new Error("Title too long");

        await ctx.db.patch(args.id, {
            title: args.title,
            updatedAt: Date.now(),
        });
    },
});

export const updateIcon = mutation({
    args: { id: v.id("pages"), icon: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const page = await ctx.db.get(args.id);
        if (!page || page.userId !== userId) throw new Error("Not authorized");

        if (args.icon && args.icon.length > 50) throw new Error("Icon too long");

        await ctx.db.patch(args.id, {
            icon: args.icon,
            updatedAt: Date.now(),
        });
    },
});

export const updateCoverImage = mutation({
    args: { id: v.id("pages"), coverImage: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const page = await ctx.db.get(args.id);
        if (!page || page.userId !== userId) throw new Error("Not authorized");

        if (args.coverImage && args.coverImage.length > 2000) throw new Error("Cover image URL too long");

        await ctx.db.patch(args.id, {
            coverImage: args.coverImage,
            updatedAt: Date.now(),
        });
    },
});

export const updateCoverYPosition = mutation({
    args: { id: v.id("pages"), coverYPosition: v.number() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const page = await ctx.db.get(args.id);
        if (!page || page.userId !== userId) throw new Error("Not authorized");

        if (args.coverYPosition < 0 || args.coverYPosition > 100) throw new Error("Invalid position");

        await ctx.db.patch(args.id, { coverYPosition: args.coverYPosition });
    },
});

export const softDelete = mutation({
    args: { id: v.id("pages") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const page = await ctx.db.get(args.id);
        if (!page || page.userId !== userId) throw new Error("Not authorized");

        const now = Date.now();
        await ctx.db.patch(args.id, {
            isDeleted: true,
            deletedAt: now,
        });

        // Cascade soft-delete to child pages
        const children = await ctx.db
            .query("pages")
            .withIndex("by_parent", (q) => q.eq("parentId", args.id))
            .collect();
        for (const child of children) {
            if (!child.isDeleted) {
                await ctx.db.patch(child._id, { isDeleted: true, deletedAt: now });
            }
        }
    },
});

export const restore = mutation({
    args: { id: v.id("pages") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const page = await ctx.db.get(args.id);
        if (!page || page.userId !== userId) throw new Error("Not authorized");

        const parentDeletedAt = page.deletedAt;

        await ctx.db.patch(args.id, {
            isDeleted: undefined,
            deletedAt: undefined,
            updatedAt: Date.now(),
        });

        // Cascade restore to children that were deleted at the same time as the parent
        if (parentDeletedAt) {
            const children = await ctx.db
                .query("pages")
                .withIndex("by_parent", (q) => q.eq("parentId", args.id))
                .collect();
            for (const child of children) {
                if (child.isDeleted && child.deletedAt === parentDeletedAt) {
                    await ctx.db.patch(child._id, {
                        isDeleted: undefined,
                        deletedAt: undefined,
                        updatedAt: Date.now(),
                    });
                }
            }
        }
    },
});

/** Delete all resources (blocks, database, rows, comments) for a single page. Does NOT delete the page itself. */
async function deletePageResources(ctx: MutationCtx, pageId: Id<"pages">) {
    // Delete blocks
    const blocks = await ctx.db
        .query("blocks")
        .withIndex("by_page", (q) => q.eq("pageId", pageId))
        .collect();
    for (const block of blocks) {
        if (block.type === "image" && block.content) {
            await ctx.storage.delete(block.content as Id<"_storage">);
        }
        await ctx.db.delete(block._id);
    }

    // Delete database + rows + comments
    const db = await ctx.db
        .query("databases")
        .withIndex("by_page", (q) => q.eq("pageId", pageId))
        .first();
    if (db) {
        const rows = await ctx.db
            .query("databaseRows")
            .withIndex("by_database", (q) => q.eq("databaseId", db._id))
            .collect();
        for (const row of rows) {
            const comments = await ctx.db
                .query("comments")
                .withIndex("by_row", (q) => q.eq("rowId", row._id))
                .collect();
            for (const comment of comments) await ctx.db.delete(comment._id);
            await ctx.db.delete(row._id);
        }
        await ctx.db.delete(db._id);
    }
}

export const remove = mutation({
    args: { id: v.id("pages") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const page = await ctx.db.get(args.id);
        if (!page || page.userId !== userId) throw new Error("Not authorized");

        // Recursively delete child pages
        const children = await ctx.db
            .query("pages")
            .withIndex("by_parent", (q) => q.eq("parentId", args.id))
            .collect();
        for (const child of children) {
            await deletePageResources(ctx, child._id);
            await ctx.db.delete(child._id);
        }

        // Delete this page's resources
        await deletePageResources(ctx, args.id);
        await ctx.db.delete(args.id);
    },
});
