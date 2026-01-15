"use client";

/**
 * Global Error Boundary
 * Required for Next.js 16+ when using client-side providers in layout.
 * This handles errors that occur in the root layout.
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body className="bg-black text-white min-h-screen flex items-center justify-center">
                <div className="text-center p-8">
                    <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
                    <p className="text-zinc-400 mb-6">
                        {error.message || "An unexpected error occurred"}
                    </p>
                    <button
                        onClick={reset}
                        className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
