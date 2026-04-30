import Editor from "@/components/Editor";
import { Id } from "../../../../../convex/_generated/dataModel";
import { preloadAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../../convex/_generated/api";

export default async function PageRoute({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const preloadedPage = await preloadAuthQuery(api.pages.get, { id: id as Id<"pages"> });
    return <Editor pageId={id as Id<"pages">} preloadedPage={preloadedPage} />;
}
