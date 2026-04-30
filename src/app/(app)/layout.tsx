import AppShell from "@/components/AppShell";
import { isAuthenticated, preloadAuthQuery } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { api } from "../../../convex/_generated/api";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const hasToken = await isAuthenticated();
    if (!hasToken) {
        redirect("/login");
    }
    const preloadedUser = await preloadAuthQuery(api.userAuth.getCurrentUser);
    return <AppShell preloadedUser={preloadedUser}>{children}</AppShell>;
}
