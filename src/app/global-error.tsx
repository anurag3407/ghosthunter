"use client";

/**
 * Global Error Boundary
 * Required for Next.js 16+ when using client-side providers in layout.
 * Must use inline styles and no external dependencies to avoid SSR issues.
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
            <body
                style={{
                    backgroundColor: "#000",
                    color: "#fff",
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "system-ui, sans-serif",
                    margin: 0,
                }}
            >
                <div style={{ textAlign: "center", padding: "2rem" }}>
                    <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                        Something went wrong
                    </h1>
                    <p style={{ color: "#a1a1aa", marginBottom: "1.5rem" }}>
                        {error?.message || "An unexpected error occurred"}
                    </p>
                    <button
                        onClick={() => reset()}
                        style={{
                            padding: "0.75rem 1.5rem",
                            backgroundColor: "#7c3aed",
                            color: "#fff",
                            border: "none",
                            borderRadius: "0.5rem",
                            cursor: "pointer",
                            fontSize: "1rem",
                        }}
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
