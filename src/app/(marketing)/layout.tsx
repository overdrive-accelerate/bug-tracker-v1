import { isAuthenticated } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
    const hasToken = await isAuthenticated();
    if (hasToken) {
        redirect("/home");
    }
    return <>{children}</>;
}
