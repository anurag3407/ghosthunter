import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GhostHunter - Build Something Amazing",
  description: "The modern platform for teams to collaborate, manage projects, and ship products faster than ever before.",
  keywords: ["project management", "collaboration", "team", "productivity"],
  authors: [{ name: "GhostHunter Team" }],
  openGraph: {
    title: "GhostHunter - Build Something Amazing",
    description: "The modern platform for teams to collaborate, manage projects, and ship products faster than ever before.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
