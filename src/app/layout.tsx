import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { getToken } from "@/lib/auth-server";
import Script from "next/script";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const plusJakarta = Plus_Jakarta_Sans({
    variable: "--font-plus-jakarta",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
    title: "Taxstar Bug Tracker",
    description: "A collaborative document workspace",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const token = (await getToken()) ?? null;
    return (
        <html
            lang="en"
            className={cn(
                "dark",
                "antialiased",
                plusJakarta.variable,
                jetbrainsMono.variable,
            )}
            suppressHydrationWarning
        >
            <head>
                <Script id="theme-init" strategy="beforeInteractive">
                    {`(function(){try{var t=localStorage.getItem("theme");if(t==="light"){document.documentElement.classList.remove("dark")}}catch(e){}})()`}
                </Script>
            </head>
            <body className="font-sans">
                <ConvexClientProvider initialToken={token}>
                    <ThemeProvider>
                        {children}
                        <Toaster position="top-right" richColors />
                    </ThemeProvider>
                </ConvexClientProvider>
            </body>
        </html>
    );
}
