import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    pages: defineTable({
        title: v.string(),
        userId: v.string(),
        updatedAt: v.number(),
        isDeleted: v.optional(v.boolean()),
        deletedAt: v.optional(v.number()),
        content: v.optional(v.string()),
        parentId: v.optional(v.id("pages")),
        icon: v.optional(v.string()),
        coverImage: v.optional(v.string()),
        coverYPosition: v.optional(v.number()),
    })
        .index("by_updated", ["updatedAt"])
        .index("by_user", ["userId", "updatedAt"])
        .index("by_user_deleted", ["userId", "isDeleted"])
        .index("by_parent", ["parentId"]),

    blocks: defineTable({
        pageId: v.id("pages"),
        type: v.union(v.literal("text"), v.literal("image"), v.literal("table")),
        content: v.string(),
        position: v.number(),
    }).index("by_page", ["pageId", "position"]),

    databases: defineTable({
        pageId: v.id("pages"),
        userId: v.string(),
        properties: v.string(), // JSON: PropertyDefinition[]
        views: v.string(), // JSON: ViewConfig[]
        nextRowPosition: v.optional(v.number()), // Auto-incrementing counter for row ordering
    })
        .index("by_page", ["pageId"])
        .index("by_user", ["userId"]),

    databaseRows: defineTable({
        databaseId: v.id("databases"),
        userId: v.string(),
        values: v.string(), // JSON: Record<string, any>
        position: v.number(),
    }).index("by_database", ["databaseId", "position"]),

    comments: defineTable({
        rowId: v.id("databaseRows"),
        userId: v.string(),
        userName: v.string(),
        content: v.string(),
        createdAt: v.number(),
    }).index("by_row", ["rowId", "createdAt"]),

    files: defineTable({
        storageId: v.id("_storage"),
        userId: v.string(),
        filename: v.string(),
        mimeType: v.string(),
        size: v.number(),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_storageId", ["storageId"]),
});
