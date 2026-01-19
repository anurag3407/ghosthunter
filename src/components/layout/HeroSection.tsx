"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import useSWR from "swr";
import {
  Shield,
  Presentation,
  Coins,
  Database,
  ArrowRight,
  Activity,
  TrendingUp,
  Play,
} from "lucide-react";
import { InfiniteGrid } from "@/components/ui/infinite-grid";
import { Cover } from "@/components/ui/cover";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { motion } from "framer-motion";

/**
 * ============================================================================
 * HERO SECTION - WITH INTEGRATED DASHBOARD PREVIEW
 * ============================================================================
 */

interface DashboardStats {
  codeReviews: { total: number; thisWeek: number };
  pitchDecks: { total: number; completed: number };
  equityProjects: { total: number; transfers: number };
  databaseQueries: { connections: number; queries: number };
}

// Dummy data for non-logged-in users
const dummyStats: DashboardStats = {
  codeReviews: { total: 247, thisWeek: 12 },
  pitchDecks: { total: 89, completed: 76 },
  equityProjects: { total: 34, transfers: 156 },
  databaseQueries: { connections: 8, queries: 1240 },
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Agent cards configuration
const agents = [
  {
    id: "code-police",
    name: "Code Police",
    description: "AI-powered code review",
    icon: Shield,
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-400",
    glowClass: "hover:shadow-[0_0_40px_-8px_rgba(139,92,246,0.5)]",
  },
  {
    id: "pitch-deck",
    name: "Pitch Deck",
    description: "Generate stunning decks",
    icon: Presentation,
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
    glowClass: "hover:shadow-[0_0_40px_-8px_rgba(6,182,212,0.5)]",
  },
  {
    id: "equity",
    name: "Equity",
    description: "Token management",
    icon: Coins,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    glowClass: "hover:shadow-[0_0_40px_-8px_rgba(16,185,129,0.5)]",
  },
  {
    id: "database",
    name: "Database",
    description: "Chat with your DB",
    icon: Database,
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-400",
    glowClass: "hover:shadow-[0_0_40px_-8px_rgba(249,115,22,0.5)]",
  },
];

// Stat card configurations
const statConfigs = [
  { key: "reviews", label: "Code Reviews", icon: Shield, iconBg: "bg-violet-500/10", iconColor: "text-violet-400", borderColor: "border-l-violet-500/30" },
  { key: "decks", label: "Pitch Decks", icon: Presentation, iconBg: "bg-cyan-500/10", iconColor: "text-cyan-400", borderColor: "border-l-cyan-500/30" },
  { key: "projects", label: "Equity Projects", icon: Coins, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-400", borderColor: "border-l-emerald-500/30" },
  { key: "connections", label: "DB Connections", icon: Database, iconBg: "bg-orange-500/10", iconColor: "text-orange-400", borderColor: "border-l-orange-500/30" },
];

export default function HeroSection() {
  const { isSignedIn } = useUser();

  const { data } = useSWR<{ stats: DashboardStats }>(
    isSignedIn ? "/api/dashboard/stats" : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  const stats = isSignedIn && data?.stats ? data.stats : dummyStats;

  const statValues = [
    { value: stats.codeReviews.total, sub: `+${stats.codeReviews.thisWeek} this week` },
    { value: stats.pitchDecks.total, sub: `${stats.pitchDecks.completed} completed` },
    { value: stats.equityProjects.total, sub: `${stats.equityProjects.transfers} transactions` },
    { value: stats.databaseQueries.connections, sub: `${stats.databaseQueries.queries} queries` },
  ];

  return (
    <InfiniteGrid>
      {/* Hero Content */}
      <div className="flex flex-col items-center justify-center pt-32 pb-8 px-4 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            href="#"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-700 bg-neutral-900/80 text-neutral-300 text-sm font-medium hover:bg-neutral-800/80 hover:border-neutral-600 transition-all backdrop-blur-sm"
          >
            <span>Integrating Agents into Start-Ups</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold max-w-5xl mx-auto text-center relative z-20 py-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 via-white to-white"
        >
          Build Start-Ups at the
          <br />
          <Cover>Warp Speed </Cover>
        </motion.h1>

        {/* CTA Buttons - Minimal Dark Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
        >
          {/* Get Started - Primary Minimal Button */}
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-black font-medium text-sm transition-all duration-200 hover:bg-zinc-200"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>

          {/* How to Start - Secondary Minimal Button */}
          <Link
            href="#how-to-start"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-zinc-800 text-zinc-300 font-medium text-sm transition-all duration-200 hover:border-zinc-600 hover:text-white hover:bg-zinc-900/50"
          >
            <Play className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            <span>How to Start</span>
          </Link>
        </motion.div>
      </div>

      {/* Spacer */}
      <div className="h-[150px]" />

      {/* Dashboard Preview - Bigger with matching proportions */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="w-full max-w-6xl mx-auto px-4 pb-20"
      >
        {/* Dashboard Container with Premium Shadow */}
        <div className="relative">
          {/* Glow effect behind dashboard */}
          <div className="absolute -inset-6 bg-gradient-to-r from-violet-500/20 via-cyan-500/10 to-violet-500/20 rounded-3xl blur-3xl opacity-60" />

          {/* Browser Frame */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
            {/* Browser Header */}
            <div className="flex items-center gap-2 px-5 py-3.5 bg-neutral-900/95 border-b border-white/5 relative z-20">
              <div className="flex gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500/80" />
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80" />
                <div className="w-3.5 h-3.5 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-5 py-1.5 rounded-lg bg-neutral-800/50 text-sm text-zinc-400 font-mono">
                  ghostfounder.com/dashboard
                </div>
              </div>
              <div className="w-20" />
            </div>

            {/* Dashboard Content with Background Effects */}
            <div className="relative min-h-[520px] bg-neutral-950 overflow-hidden">
              {/* Background Effects - Same as real dashboard */}
              <div className="absolute inset-0 z-0">
                {/* Ripple Grid Background */}
                <BackgroundRippleEffect rows={10} cols={25} cellSize={48} />

                {/* Shooting Stars */}
                <div className="absolute inset-0 pointer-events-none">
                  <ShootingStars
                    starColor="#fff"
                    trailColor="#444"
                    minSpeed={8}
                    maxSpeed={20}
                    minDelay={2000}
                    maxDelay={5000}
                    starWidth={12}
                    starHeight={1}
                  />
                  <ShootingStars
                    starColor="#888"
                    trailColor="#333"
                    minSpeed={5}
                    maxSpeed={15}
                    minDelay={3000}
                    maxDelay={6000}
                    starWidth={8}
                    starHeight={1}
                  />
                </div>
              </div>

              {/* Dashboard UI Content - Matching real dashboard proportions */}
              <div className="relative z-10 p-6 lg:p-8 space-y-8">
                {/* Welcome Row */}
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400 font-medium">All systems active</span>
                  {!isSignedIn && (
                    <div className="ml-auto px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300">
                      Demo Mode
                    </div>
                  )}
                </div>

                {/* Stats Grid - Matching real dashboard */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {statConfigs.map((config, index) => (
                    <div
                      key={config.key}
                      className={`glass rounded-xl p-5 border-l-2 ${config.borderColor} hover:scale-[1.02] transition-transform duration-300 cursor-pointer`}
                    >
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className={`p-2 rounded-lg ${config.iconBg}`}>
                          <config.icon className={`w-4 h-4 ${config.iconColor}`} />
                        </div>
                        <span className="text-xs text-zinc-400 font-medium">{config.label}</span>
                      </div>
                      <p className="text-3xl font-bold text-white tabular-nums tracking-tight">
                        {statValues[index].value.toLocaleString()}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">{statValues[index].sub}</p>
                    </div>
                  ))}
                </div>

                {/* Agents Section Header */}
                <div className="flex items-center gap-3">
                  <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-widest">AI Agents</h4>
                  <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
                </div>

                {/* Agents Grid - Matching real dashboard */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {agents.map((agent) => (
                    <Link
                      key={agent.id}
                      href="/dashboard"
                      className={`group glass rounded-xl p-4 flex items-center gap-3 transition-all duration-300 hover:scale-[1.02] ${agent.glowClass}`}
                    >
                      <div className={`p-2.5 rounded-xl ${agent.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                        <agent.icon className={`w-5 h-5 ${agent.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-semibold text-zinc-100 group-hover:text-white truncate">
                          {agent.name}
                        </h5>
                        <p className="text-xs text-zinc-500 truncate">{agent.description}</p>
                      </div>
                      <ArrowRight className={`w-4 h-4 ${agent.iconColor} opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all`} />
                    </Link>
                  ))}
                </div>

                {/* Activity Section Header */}
                <div className="flex items-center gap-3">
                  <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Recent Activity</h4>
                  <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
                </div>

                {/* Activity Preview - Matching real dashboard */}
                <div className="glass rounded-xl overflow-hidden">
                  <div className="divide-y divide-white/5">
                    {[
                      { text: "Code review completed", desc: "Analyzed 156 files in react-app", time: "2m ago", color: "bg-violet-500", iconBg: "bg-violet-500/10", iconColor: "text-violet-400", Icon: Shield },
                      { text: "Pitch deck generated", desc: "Series A deck for TechStartup", time: "15m ago", color: "bg-cyan-500", iconBg: "bg-cyan-500/10", iconColor: "text-cyan-400", Icon: Presentation },
                      { text: "Token transfer initiated", desc: "500 tokens to 0x7f3b...", time: "1h ago", color: "bg-emerald-500", iconBg: "bg-emerald-500/10", iconColor: "text-emerald-400", Icon: Coins },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer">
                        <div className={`p-2 rounded-lg ${item.iconBg}`}>
                          <item.Icon className={`w-4 h-4 ${item.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                            <p className="text-sm text-zinc-200 font-medium truncate">{item.text}</p>
                          </div>
                          <p className="text-xs text-zinc-500 truncate mt-0.5">{item.desc}</p>
                        </div>
                        <span className="text-xs text-zinc-600 whitespace-nowrap">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </InfiniteGrid>
  );
}
