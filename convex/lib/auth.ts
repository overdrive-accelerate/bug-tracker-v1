import { QueryCtx, MutationCtx } from "../_generated/server";

/** For queries: returns null if unauthenticated (queries must not throw). */
export async function getQueryUserId(ctx: QueryCtx): Promise<string | null> {
    const identity = await ctx.auth.getUserIdentity();
    return identity?.subject ?? null;
}

/** For mutations: throws if unauthenticated. */
export async function getAuthUserId(ctx: MutationCtx): Promise<string> {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return identity.subject;
}
