"use client";
import React from "react";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import { Shield, Presentation, Coins, Database } from "lucide-react";

const content = [
  {
    title: "Code Police",
    description:
      "AI-powered code review that analyzes your GitHub commits and sends detailed reports. Get automatic PR analysis, security scanning, and performance optimization tips delivered straight to your inbox.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-white">
        <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
          <Shield className="w-12 h-12" />
        </div>
        <span className="font-semibold text-lg">Code Police</span>
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="px-2 py-1 text-xs bg-white/20 rounded-full">PR Analysis</span>
          <span className="px-2 py-1 text-xs bg-white/20 rounded-full">Security Scan</span>
        </div>
      </div>
    ),
  },
  {
    title: "Pitch Deck Generator",
    description:
      "Generate professional pitch decks from your README and project features in seconds. Our AI transforms your repository into investor-ready presentations with custom themes and PDF export.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-white">
        <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
          <Presentation className="w-12 h-12" />
        </div>
        <span className="font-semibold text-lg">Pitch Deck</span>
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="px-2 py-1 text-xs bg-white/20 rounded-full">AI Slides</span>
          <span className="px-2 py-1 text-xs bg-white/20 rounded-full">PDF Export</span>
        </div>
      </div>
    ),
  },
  {
    title: "Equity Distribution",
    description:
      "Manage and distribute equity tokens on the blockchain with a simple interface. Mint tokens, track ownership percentages, and transfer equity to team members and investors seamlessly.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-white">
        <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
          <Coins className="w-12 h-12" />
        </div>
        <span className="font-semibold text-lg">Equity Platform</span>
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="px-2 py-1 text-xs bg-white/20 rounded-full">Mint Tokens</span>
          <span className="px-2 py-1 text-xs bg-white/20 rounded-full">Track Ownership</span>
        </div>
      </div>
    ),
  },
  {
    title: "Database Agent",
    description:
      "Chat with your database using natural language. Connect PostgreSQL, MySQL, or MongoDB and query your data conversationally. Visualize schemas and maintain full query history.",
    content: (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-white">
        <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
          <Database className="w-12 h-12" />
        </div>
        <span className="font-semibold text-lg">Database Agent</span>
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="px-2 py-1 text-xs bg-white/20 rounded-full">Natural Language</span>
          <span className="px-2 py-1 text-xs bg-white/20 rounded-full">Schema View</span>
        </div>
      </div>
    ),
  },
];

export default function StickyScrollRevealDemo() {
  return (
    <section className="w-full py-16 px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Your AI-Powered Startup Toolkit
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Four powerful agents designed to accelerate your startup journey from code to investors.
          </p>
        </div>
        <StickyScroll content={content} />
      </div>
    </section>
  );
}
