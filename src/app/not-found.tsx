import Link from "next/link";

export default function NotFound() {
    return (
        <div className="h-screen flex flex-col items-center justify-center gap-4 p-8 bg-background text-foreground">
            <div className="text-6xl">📄</div>
            <h2 className="text-2xl font-bold tracking-[-0.02em]">Page not found</h2>
            <p className="text-sm text-muted-foreground text-center max-w-md">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <Link
                href="/home"
                className="mt-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
                Back to home
            </Link>
        </div>
    );
}
