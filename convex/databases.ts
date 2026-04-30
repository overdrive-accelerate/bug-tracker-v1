import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getQueryUserId, getAuthUserId } from "./lib/auth";

// ---------- Property & View types (serialized as JSON) ----------

// Property types: text, number, select, multiSelect, status, date, checkbox, url, phone, email, person, file, progress, id, createdTime, updatedTime, createdBy, lastEditedBy
// PropertyDefinition: { id, name, type, options? (for select/multiSelect/status) }
// ViewConfig: { id, name, type: "table"|"board"|"list", groupByPropertyId?, filter?, sort? }
// Auto-populated property types: createdTime, updatedTime, createdBy, lastEditedBy, id

const DEFAULT_PROPERTIES = JSON.stringify([
    { id: "title", name: "Name", type: "text" },
    { id: "status", name: "Status", type: "select", options: ["Backlog", "In progress", "In review", "Done"] },
    { id: "priority", name: "Priority", type: "select", options: ["Low", "Medium", "High"] },
    { id: "assign", name: "Assign", type: "person" },
]);

const DEFAULT_VIEWS = JSON.stringify([
    { id: "table-default", name: "Table", type: "table" },
    { id: "board-default", name: "Board", type: "board", groupByPropertyId: "status" },
]);

// ---------- Database CRUD ----------

export const getByPage = query({
    args: { pageId: v.id("pages") },
    handler: async (ctx, args) => {
        const userId = await getQueryUserId(ctx);
        if (!userId) return null;
        const db = await ctx.db
            .query("databases")
            .withIndex("by_page", (q) => q.eq("pageId", args.pageId))
            .first();
        if (!db || db.userId !== userId) return null;
        return db;
    },
});

export const get = query({
    args: { id: v.id("databases") },
    handler: async (ctx, args) => {
        const userId = await getQueryUserId(ctx);
        if (!userId) return null;
        const db = await ctx.db.get(args.id);
        if (!db || db.userId !== userId) return null;
        return db;
    },
});

export const create = mutation({
    args: { pageId: v.id("pages") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        // Verify page ownership
        const page = await ctx.db.get(args.pageId);
        if (!page || page.userId !== userId) throw new Error("Not authorized");

        // Check if a database already exists for this page
        const existing = await ctx.db
            .query("databases")
            .withIndex("by_page", (q) => q.eq("pageId", args.pageId))
            .first();
        if (existing) throw new Error("Database already exists for this page");

        const databaseId = await ctx.db.insert("databases", {
            pageId: args.pageId,
            userId,
            properties: DEFAULT_PROPERTIES,
            views: DEFAULT_VIEWS,
        });

        return databaseId;
    },
});

export const updateProperties = mutation({
    args: { id: v.id("databases"), properties: v.string() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const db = await ctx.db.get(args.id);
        if (!db || db.userId !== userId) throw new Error("Not authorized");

        if (args.properties.length > 50_000) throw new Error("Properties data too large");
        let parsed;
        try {
            parsed = JSON.parse(args.properties);
        } catch {
            throw new Error("Invalid JSON for properties");
        }
        if (!Array.isArray(parsed)) throw new Error("Properties must be an array");
        for (const prop of parsed) {
            if (!prop.id || typeof prop.id !== "string") throw new Error("Each property must have a string id");
            if (!prop.name || typeof prop.name !== "string") throw new Error("Each property must have a string name");
            if (!prop.type || typeof prop.type !== "string") throw new Error("Each property must have a string type");
        }

        await ctx.db.patch(args.id, { properties: args.properties });
    },
});

export const updateViews = mutation({
    args: { id: v.id("databases"), views: v.string() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const db = await ctx.db.get(args.id);
        if (!db || db.userId !== userId) throw new Error("Not authorized");

        if (args.views.length > 50_000) throw new Error("Views data too large");
        let parsed;
        try {
            parsed = JSON.parse(args.views);
        } catch {
            throw new Error("Invalid JSON for views");
        }
        if (!Array.isArray(parsed)) throw new Error("Views must be an array");
        for (const view of parsed) {
            if (!view.id || typeof view.id !== "string") throw new Error("Each view must have a string id");
            if (!view.name || typeof view.name !== "string") throw new Error("Each view must have a string name");
            if (!view.type || typeof view.type !== "string") throw new Error("Each view must have a string type");
        }

        await ctx.db.patch(args.id, { views: args.views });
    },
});

// ---------- Row CRUD ----------

export const listRows = query({
    args: { databaseId: v.id("databases") },
    handler: async (ctx, args) => {
        const userId = await getQueryUserId(ctx);
        if (!userId) return [];
        const db = await ctx.db.get(args.databaseId);
        if (!db || db.userId !== userId) return [];

        const rows = await ctx.db
            .query("databaseRows")
            .withIndex("by_database", (q) => q.eq("databaseId", args.databaseId))
            .collect();
        return rows;
    },
});

export const createRow = mutation({
    args: { databaseId: v.id("databases"), values: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const db = await ctx.db.get(args.databaseId);
        if (!db || db.userId !== userId) throw new Error("Not authorized");

        if (args.values && args.values.length > 100_000) throw new Error("Row values too large");

        // Use atomic counter on the database record for position assignment
        const nextPosition = (db.nextRowPosition ?? 0) + 1;
        await ctx.db.patch(args.databaseId, { nextRowPosition: nextPosition });

        // Auto-populate system properties
        let parsedValues;
        try {
            parsedValues = JSON.parse(args.values ?? "{}");
        } catch {
            throw new Error("Invalid JSON for row values");
        }
        if (typeof parsedValues !== "object" || parsedValues === null || Array.isArray(parsedValues)) {
            throw new Error("Row values must be a JSON object");
        }
        let properties;
        try {
            properties = JSON.parse(db.properties);
        } catch {
            throw new Error("Database has invalid properties");
        }
        const now = new Date().toISOString();
        const identity = await ctx.auth.getUserIdentity();
        const userName = identity?.name ?? identity?.email ?? userId;
        for (const prop of properties) {
            if (prop.type === "createdTime") parsedValues[prop.id] = now;
            if (prop.type === "updatedTime") parsedValues[prop.id] = now;
            if (prop.type === "createdBy") parsedValues[prop.id] = userName;
            if (prop.type === "lastEditedBy") parsedValues[prop.id] = userName;
            if (prop.type === "id") parsedValues[prop.id] = parsedValues[prop.id] ?? `ID-${Date.now().toString(36).toUpperCase()}`;
        }

        const rowId = await ctx.db.insert("databaseRows", {
            databaseId: args.databaseId,
            userId,
            values: JSON.stringify(parsedValues),
            position: nextPosition,
        });
        return rowId;
    },
});

export const updateRow = mutation({
    args: { id: v.id("databaseRows"), values: v.string() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const row = await ctx.db.get(args.id);
        if (!row) throw new Error("Row not found");
        const db = await ctx.db.get(row.databaseId);
        if (!db || db.userId !== userId) throw new Error("Not authorized");

        if (args.values.length > 100_000) throw new Error("Row values too large");

        // Auto-update updatedTime properties
        let parsedValues;
        try {
            parsedValues = JSON.parse(args.values);
        } catch {
            throw new Error("Invalid JSON for row values");
        }
        if (typeof parsedValues !== "object" || parsedValues === null || Array.isArray(parsedValues)) {
            throw new Error("Row values must be a JSON object");
        }
        let properties;
        try {
            properties = JSON.parse(db.properties);
        } catch {
            throw new Error("Database has invalid properties");
        }
        const now = new Date().toISOString();
        const identity = await ctx.auth.getUserIdentity();
        const editUserName = identity?.name ?? identity?.email ?? userId;
        for (const prop of properties) {
            if (prop.type === "updatedTime") parsedValues[prop.id] = now;
            if (prop.type === "lastEditedBy") parsedValues[prop.id] = editUserName;
        }

        await ctx.db.patch(args.id, { values: JSON.stringify(parsedValues) });
    },
});

export const deleteRow = mutation({
    args: { id: v.id("databaseRows") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const row = await ctx.db.get(args.id);
        if (!row) throw new Error("Row not found");
        const db = await ctx.db.get(row.databaseId);
        if (!db || db.userId !== userId) throw new Error("Not authorized");

        // Delete associated comments
        const comments = await ctx.db
            .query("comments")
            .withIndex("by_row", (q) => q.eq("rowId", args.id))
            .collect();
        for (const comment of comments) {
            await ctx.db.delete(comment._id);
        }

        await ctx.db.delete(args.id);
    },
});

export const remove = mutation({
    args: { id: v.id("databases") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const db = await ctx.db.get(args.id);
        if (!db || db.userId !== userId) throw new Error("Not authorized");

        // Delete all rows and their comments
        const rows = await ctx.db
            .query("databaseRows")
            .withIndex("by_database", (q) => q.eq("databaseId", args.id))
            .collect();
        for (const row of rows) {
            const comments = await ctx.db
                .query("comments")
                .withIndex("by_row", (q) => q.eq("rowId", row._id))
                .collect();
            for (const comment of comments) {
                await ctx.db.delete(comment._id);
            }
            await ctx.db.delete(row._id);
        }

        await ctx.db.delete(args.id);
    },
});
