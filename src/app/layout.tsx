import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GhostFounder - Build Startups at Warp Speed",
  description: "AI-powered platform for startups. Code review, pitch decks, equity distribution, and database management - all in one place.",
  keywords: ["startup", "AI agents", "code review", "pitch deck", "equity", "database"],
  authors: [{ name: "GhostFounder Team" }],
  openGraph: {
    title: "GhostFounder - Build Startups at Warp Speed",
    description: "AI-powered platform for startups. Code review, pitch decks, equity distribution, and database management.",
    type: "website",
  },
};

/**
 * Root Layout - Development Mode
 * NOTE: ClerkProvider removed for development. Re-enable for production.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-black text-white`}>
        <Providers>
          {children}
        </Providers>
        <Toaster 
          position="bottom-right" 
          theme="dark"
          richColors
        />
      </body>
    </html>
  );
}

