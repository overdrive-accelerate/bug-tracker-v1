"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <html lang="en">
            <body className="bg-neutral-950 text-white font-sans">
                <div className="h-screen flex flex-col items-center justify-center gap-4 p-8">
                    <div className="text-4xl">💥</div>
                    <h2 className="text-lg font-semibold">Something went wrong</h2>
                    <p className="text-sm text-neutral-400 text-center max-w-md">
                        A critical error occurred. Please try again.
                    </p>
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 rounded-md bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
