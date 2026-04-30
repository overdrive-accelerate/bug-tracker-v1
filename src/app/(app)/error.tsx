"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <div className="h-full flex flex-col items-center justify-center gap-4 p-8">
            <div className="text-4xl">⚠️</div>
            <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
            <p className="text-sm text-muted-foreground text-center max-w-md">
                An unexpected error occurred. Please try again.
            </p>
            <Button variant="outline" onClick={() => reset()}>
                Try again
            </Button>
        </div>
    );
}
