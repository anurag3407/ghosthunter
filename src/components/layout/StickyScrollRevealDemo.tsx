"use client";
import React from "react";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import {
  Shield,
  Presentation,
  Coins,
  Database,
  Sparkles,
  Zap,
  Lock,
  MessageSquare,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Clock,
  PieChart,
  Wallet,
  ExternalLink,
  Plus,
  Send,
  Wand2,
  TrendingUp,
} from "lucide-react";

// ============================================================================
// CODE POLICE PREVIEW - Exact replica of the real dashboard
// ============================================================================
const CodePolicePreview = () => (
  <div className="h-full w-full bg-zinc-950 p-4 overflow-hidden">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-red-500/10">
          <Shield className="w-4 h-4 text-red-400" />
        </div>
        <span className="text-sm font-bold text-white">Code Police</span>
      </div>
      <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-500 text-white text-[10px] font-medium rounded-lg">
        <Plus className="w-3 h-3" />
        Connect
      </button>
    </div>

    {/* Project Cards - Like real page */}
    <div className="space-y-2">
      {/* Project 1 */}
      <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-800">
            <GitBranch className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white truncate">react-dashboard</span>
              <span className="px-1.5 py-0.5 text-[9px] font-medium rounded-full bg-green-500/10 text-green-400">active</span>
            </div>
            <span className="text-[10px] text-zinc-500">anurag3407/react-dashboard</span>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-zinc-800/50">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-400" />
            <span className="text-[10px] text-zinc-400">Completed</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10">
            <AlertTriangle className="w-2.5 h-2.5 text-orange-400" />
            <span className="text-[10px] text-orange-400">3 issues</span>
          </div>
          <span className="text-[10px] text-zinc-500 ml-auto">Today</span>
        </div>
      </div>

      {/* Project 2 */}
      <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-800">
            <GitBranch className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white truncate">api-server</span>
              <span className="px-1.5 py-0.5 text-[9px] font-medium rounded-full bg-green-500/10 text-green-400">active</span>
            </div>
            <span className="text-[10px] text-zinc-500">anurag3407/api-server</span>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-zinc-800/50">
          <div className="flex items-center gap-1">
            <XCircle className="w-3 h-3 text-red-400" />
            <span className="text-[10px] text-zinc-400">Critical</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10">
            <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
            <span className="text-[10px] text-red-400">7 issues</span>
          </div>
          <span className="text-[10px] text-zinc-500 ml-auto">Yesterday</span>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// PITCH DECK PREVIEW - Exact replica of the real dashboard
// ============================================================================
const PitchDeckPreview = () => (
  <div className="h-full w-full bg-zinc-950 p-4 overflow-hidden">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-blue-500/10">
          <Presentation className="w-4 h-4 text-blue-400" />
        </div>
        <span className="text-sm font-bold text-white">Pitch Deck</span>
      </div>
      <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[10px] font-medium rounded-lg">
        <Wand2 className="w-3 h-3" />
        Studio
      </button>
    </div>

    {/* Deck Cards */}
    <div className="space-y-2">
      {/* Deck 1 */}
      <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl hover:border-blue-500/30 transition-all">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xs font-semibold text-white">GhostFounder</h3>
            <p className="text-[10px] text-zinc-500">AI-powered startup toolkit</p>
          </div>
          <span className="px-2 py-0.5 text-[9px] font-medium rounded-full bg-green-500/10 text-green-400">completed</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] text-zinc-400">12 slides</span>
          </div>
          <span className="text-[10px] text-zinc-500">2 days ago</span>
        </div>
      </div>

      {/* Deck 2 */}
      <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xs font-semibold text-white">TechStartup</h3>
            <p className="text-[10px] text-zinc-500">Series A funding deck</p>
          </div>
          <span className="px-2 py-0.5 text-[9px] font-medium rounded-full bg-yellow-500/10 text-yellow-400">draft</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] text-zinc-400">8 slides</span>
          </div>
          <span className="text-[10px] text-zinc-500">1 week ago</span>
        </div>
      </div>

      {/* Mini Slide Preview */}
      <div className="mt-3 p-3 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">GF</span>
          </div>
          <span className="text-[10px] text-zinc-400">Slide Preview</span>
        </div>
        <div className="bg-black/40 rounded p-2">
          <p className="text-[9px] text-zinc-300 font-medium">Market Opportunity</p>
          <div className="flex gap-2 mt-1">
            <div className="flex-1 text-center">
              <p className="text-sm font-bold text-cyan-400">$4.2B</p>
              <p className="text-[8px] text-zinc-500">TAM</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-sm font-bold text-purple-400">47%</p>
              <p className="text-[8px] text-zinc-500">Growth</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// EQUITY PORTFOLIO PREVIEW - Exact replica of the real dashboard
// ============================================================================
const EquityPreview = () => (
  <div className="h-full w-full bg-zinc-950 p-4 overflow-hidden">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
          <Coins className="w-4 h-4 text-purple-400" />
        </div>
        <span className="text-sm font-bold text-white">Portfolio</span>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <span className="text-[10px] text-zinc-300">0x7f3b...4a2c</span>
      </div>
    </div>

    {/* Stats Row */}
    <div className="grid grid-cols-2 gap-2 mb-3">
      <div className="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl">
        <div className="flex items-center gap-1.5 mb-1">
          <Coins className="w-3 h-3 text-purple-400" />
          <span className="text-[9px] text-zinc-500">Balance</span>
        </div>
        <p className="text-lg font-bold text-white">5,000</p>
        <p className="text-[9px] text-zinc-500">GHT</p>
      </div>
      <div className="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl">
        <div className="flex items-center gap-1.5 mb-1">
          <PieChart className="w-3 h-3 text-purple-400" />
          <span className="text-[9px] text-zinc-500">Ownership</span>
        </div>
        <p className="text-lg font-bold text-purple-400">50%</p>
        <p className="text-[9px] text-zinc-500">of supply</p>
      </div>
    </div>

    {/* Pie Chart */}
    <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl mb-3">
      <div className="flex items-center gap-2 mb-2">
        <PieChart className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-[10px] font-medium text-white">Distribution</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full relative" style={{ background: 'conic-gradient(#a855f7 0% 50%, #3f3f46 50% 100%)' }}>
          <div className="absolute inset-1.5 bg-zinc-900 rounded-full flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">50%</span>
          </div>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-[10px] text-zinc-300">You</span>
            </div>
            <span className="text-[10px] font-medium text-white">5,000</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-zinc-600" />
              <span className="text-[10px] text-zinc-300">Others</span>
            </div>
            <span className="text-[10px] font-medium text-white">5,000</span>
          </div>
        </div>
      </div>
    </div>

    {/* Token Card */}
    <div className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20">
            <Coins className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">GhostToken</p>
            <p className="text-[9px] text-zinc-500">GHT</p>
          </div>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
      </div>
    </div>
  </div>
);

// ============================================================================
// DATABASE AGENT PREVIEW - Exact replica of the real chat interface
// ============================================================================
const DatabasePreview = () => (
  <div className="h-full w-full bg-zinc-950 p-4 overflow-hidden flex flex-col">
    {/* Header */}
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-green-500/10">
          <Database className="w-4 h-4 text-green-400" />
        </div>
        <span className="text-sm font-bold text-white">Database Agent</span>
      </div>
      <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-500 text-white text-[10px] font-medium rounded-lg">
        <Plus className="w-3 h-3" />
        Add
      </button>
    </div>

    {/* Connection Card */}
    <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl mb-3">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <Database className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white">Production DB</span>
            <span className="px-1.5 py-0.5 text-[8px] font-medium rounded bg-green-500/10 text-green-400">connected</span>
          </div>
          <span className="text-[10px] text-zinc-500">PostgreSQL • users_db</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
      </div>
    </div>

    {/* Chat Interface */}
    <div className="flex-1 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="space-y-2">
        {/* User Message */}
        <div className="flex justify-end">
          <div className="px-2.5 py-1.5 bg-green-500/20 rounded-lg rounded-tr-sm max-w-[85%]">
            <p className="text-[10px] text-zinc-200">Show users who signed up last week</p>
          </div>
        </div>

        {/* AI Response */}
        <div className="flex justify-start">
          <div className="px-2.5 py-2 bg-zinc-800/80 rounded-lg rounded-tl-sm max-w-[90%]">
            <p className="text-[9px] text-zinc-400 mb-1.5">Found 23 users:</p>
            <div className="p-1.5 bg-black/40 rounded font-mono text-[8px] text-green-400 mb-1.5">
              SELECT * FROM users WHERE<br />
              created_at &gt; NOW() - INTERVAL 7
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-[9px]">
                <div className="w-1 h-1 rounded-full bg-green-400" />
                <span className="text-zinc-400">john@email.com</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px]">
                <div className="w-1 h-1 rounded-full bg-green-400" />
                <span className="text-zinc-400">sarah@startup.io</span>
              </div>
              <span className="text-[8px] text-zinc-600">+21 more...</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Input */}
    <div className="mt-2 flex items-center gap-2 px-2.5 py-2 bg-zinc-900/80 border border-zinc-800 rounded-lg">
      <input
        type="text"
        placeholder="Ask your database..."
        className="flex-1 bg-transparent text-[10px] text-zinc-400 outline-none"
        disabled
      />
      <Send className="w-3.5 h-3.5 text-green-400" />
    </div>
  </div>
);

const content = [
  {
    title: "🛡️ Code Police — Your AI Security Guard",
    description:
      "Stop shipping bugs and vulnerabilities. Our AI agent analyzes every GitHub commit in real-time, catching security flaws before they hit production. Get detailed PR reviews with actionable fixes, automated security scanning, and performance insights delivered to your inbox.",
    content: <CodePolicePreview />,
  },
  {
    title: "📊 Pitch Deck Generator — Impress Investors",
    description:
      "Transform your README into a stunning pitch deck in 60 seconds. Our AI reads your repo, understands your product, and generates investor-ready slides with problem statements, market analysis, and traction metrics. Export to PDF and start pitching today.",
    content: <PitchDeckPreview />,
  },
  {
    title: "💎 Equity Distribution — Blockchain-Powered",
    description:
      "Say goodbye to messy cap tables and awkward equity conversations. Mint tokens representing ownership on the blockchain, track percentages in real-time, and transfer equity to co-founders and investors with one click. Full transparency and immutable records.",
    content: <EquityPreview />,
  },
  {
    title: "🗄️ Database Agent — Chat With Your Data",
    description:
      "Query your database in plain English. Connect PostgreSQL, MySQL, or MongoDB and ask questions like \"show me users who signed up last week.\" Our AI understands your schema, writes optimized queries, and visualizes results instantly.",
    content: <DatabasePreview />,
  },
];

export default function StickyScrollRevealDemo() {
  return (
    <section className="w-full py-20 px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header - Minimal */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
            Your Complete Startup Toolkit
          </h2>
          <p className="text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            Four autonomous AI agents working 24/7 to build, protect, and scale your startup.
            From code security to investor pitches — we&apos;ve got you covered.
          </p>
        </div>

        <StickyScroll content={content} contentClassName="h-[22rem] w-[20rem]" />
      </div>
    </section>
  );
}
