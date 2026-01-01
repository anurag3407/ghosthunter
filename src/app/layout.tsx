import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
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
 * Root Layout with Clerk Authentication
 * ClerkProvider wraps the entire app for authentication context.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#8b5cf6",
          colorBackground: "#18181b",
          colorInputBackground: "#27272a",
          colorInputText: "#ffffff",
        },
        elements: {
          formButtonPrimary: "bg-violet-600 hover:bg-violet-700",
          card: "bg-zinc-900 border-zinc-800",
          headerTitle: "text-white",
          headerSubtitle: "text-zinc-400",
          socialButtonsBlockButton: "bg-zinc-800 border-zinc-700 hover:bg-zinc-700",
          formFieldLabel: "text-zinc-300",
          formFieldInput: "bg-zinc-800 border-zinc-700",
          footerActionLink: "text-violet-400 hover:text-violet-300",
        },
      }}
    >
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
    </ClerkProvider>
  );
}

