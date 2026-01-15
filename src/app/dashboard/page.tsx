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
  Sparkles,
} from "lucide-react";

/**
 * ============================================================================
 * DASHBOARD HOME PAGE - PREMIUM DARK THEME
 * ============================================================================
 * Ultra-sleek dashboard with glassmorphism, accent glows, and micro-animations.
 */

// Types
interface DashboardStats {
  codeReviews: { total: number; thisWeek: number };
  pitchDecks: { total: number; completed: number };
  equityProjects: { total: number; transfers: number };
  databaseQueries: { connections: number; queries: number };
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: "code-review" | "pitch-deck" | "equity" | "database";
  title: string;
  description: string;
  timestamp: string;
}

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Time-based greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

// Agent cards configuration with accent colors
const agents = [
  {
    id: "code-police",
    name: "Code Police",
    description: "AI-powered code review",
    icon: Shield,
    href: "/dashboard/code-police",
    accentClass: "group-hover:glow-violet",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-400",
    dotClass: "accent-dot-violet",
  },
  {
    id: "pitch-deck",
    name: "Pitch Deck",
    description: "Generate stunning decks",
    icon: Presentation,
    href: "/dashboard/pitch-deck",
    accentClass: "group-hover:glow-cyan",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
    dotClass: "accent-dot-cyan",
  },
  {
    id: "equity",
    name: "Equity",
    description: "Token management",
    icon: Coins,
    href: "/dashboard/equity",
    accentClass: "group-hover:glow-emerald",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    dotClass: "accent-dot-emerald",
  },
  {
    id: "database",
    name: "Database",
    description: "Chat with your DB",
    icon: Database,
    href: "/dashboard/database",
    accentClass: "group-hover:glow-orange",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-400",
    dotClass: "accent-dot-orange",
  },
];

// Activity type configurations
const activityConfig = {
  "code-review": {
    icon: Shield,
    dotClass: "accent-dot-violet",
    iconColor: "text-violet-400",
    bgColor: "bg-violet-500/10",
  },
  "pitch-deck": {
    icon: Presentation,
    dotClass: "accent-dot-cyan",
    iconColor: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
  equity: {
    icon: Coins,
    dotClass: "accent-dot-emerald",
    iconColor: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  database: {
    icon: Database,
    dotClass: "accent-dot-orange",
    iconColor: "text-orange-400",
    bgColor: "bg-orange-500/10",
  },
};

// Stat card configurations with unique colors
const statConfigs = [
  {
    key: "reviews",
    label: "Reviews",
    icon: Shield,
    glowClass: "glow-violet",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-400",
    accentBorder: "border-violet-500/20",
  },
  {
    key: "decks",
    label: "Decks",
    icon: Presentation,
    glowClass: "glow-cyan",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
    accentBorder: "border-cyan-500/20",
  },
  {
    key: "projects",
    label: "Projects",
    icon: Coins,
    glowClass: "glow-emerald",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    accentBorder: "border-emerald-500/20",
  },
  {
    key: "connections",
    label: "Connections",
    icon: Database,
    glowClass: "glow-orange",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-400",
    accentBorder: "border-orange-500/20",
  },
];

export default function DashboardPage() {
  const { user } = useUser();
  const firstName = user?.firstName || "there";

  // Fetch real-time stats
  const { data, isLoading } = useSWR<{ stats: DashboardStats }>(
    "/api/dashboard/stats",
    fetcher,
    { refreshInterval: 30000 }
  );

  const stats = data?.stats;

  // Stat values array for mapping
  const statValues = [
    { value: stats?.codeReviews.total ?? 0, sub: `+${stats?.codeReviews.thisWeek ?? 0} this week` },
    { value: stats?.pitchDecks.total ?? 0, sub: `${stats?.pitchDecks.completed ?? 0} completed` },
    { value: stats?.equityProjects.total ?? 0, sub: `${stats?.equityProjects.transfers ?? 0} transactions` },
    { value: stats?.databaseQueries.connections ?? 0, sub: `${stats?.databaseQueries.queries ?? 0} queries` },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Premium Welcome Section */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-violet-400 animate-float" />
          <span className="text-xs uppercase tracking-widest text-zinc-500 font-medium">
            Dashboard
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold">
          <span className="text-gradient">{getGreeting()}, </span>
          <span className="text-gradient-violet">{firstName}</span>
        </h1>
        <p className="text-sm text-zinc-500 mt-2">
          Your AI-powered workspace overview
        </p>
      </div>

      {/* Stats Grid - Premium Glass Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statConfigs.map((config, index) => (
          <StatCard
            key={config.key}
            config={config}
            value={statValues[index].value}
            sub={statValues[index].sub}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Agent Cards - Premium Glass with Accent Colors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
            AI Agents
          </h2>
          <div className="h-px flex-1 ml-4 bg-gradient-to-r from-zinc-800 to-transparent" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      {/* Recent Activity - Premium Glass List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
            Recent Activity
          </h2>
          <div className="h-px flex-1 ml-4 bg-gradient-to-r from-zinc-800 to-transparent" />
        </div>
        <div className="glass rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-9 h-9 rounded-lg bg-zinc-800/60" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-zinc-800/60 rounded" />
                    <div className="h-3 w-48 bg-zinc-800/40 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="divide-y divide-white/5">
              {stats.recentActivity.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-800/50 mb-3">
                <Activity className="w-5 h-5 text-zinc-500" />
              </div>
              <p className="text-zinc-400 text-sm font-medium">No activity yet</p>
              <p className="text-zinc-600 text-xs mt-1">
                Start using agents to see your activity here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Premium Stat Card with Glass Effect
function StatCard({
  config,
  value,
  sub,
  isLoading,
}: {
  config: (typeof statConfigs)[0];
  value: number;
  sub: string;
  isLoading: boolean;
}) {
  const Icon = config.icon;

  return (
    <div
      className={`
        glass rounded-xl p-5 transition-all duration-300
        hover:scale-[1.02] hover:${config.glowClass}
        border-l-2 ${config.accentBorder}
      `}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`p-2 rounded-lg ${config.iconBg}`}>
          <Icon className={`w-4 h-4 ${config.iconColor}`} />
        </div>
        <span className="text-xs text-zinc-400 font-medium">{config.label}</span>
      </div>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 w-14 bg-zinc-800/60 rounded mb-1" />
          <div className="h-3 w-20 bg-zinc-800/40 rounded" />
        </div>
      ) : (
        <>
          <p className="text-3xl font-bold text-white tabular-nums tracking-tight">
            {value}
          </p>
          <p className="text-xs text-zinc-500 mt-1">{sub}</p>
        </>
      )}
    </div>
  );
}

// Premium Agent Card with Hover Effects
function AgentCard({
  agent,
}: {
  agent: (typeof agents)[0];
}) {
  return (
    <Link
      href={agent.href}
      className={`
        group glass rounded-xl p-4 transition-all duration-300
        hover:scale-[1.02] ${agent.accentClass}
        relative overflow-hidden
      `}
    >
      {/* Accent line on top */}
      <div
        className={`
          absolute inset-x-0 top-0 h-0.5 opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          bg-gradient-to-r from-transparent via-current to-transparent
          ${agent.iconColor}
        `}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${agent.iconBg} transition-transform duration-300 group-hover:scale-110`}>
            <agent.icon className={`w-5 h-5 ${agent.iconColor}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">
              {agent.name}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">{agent.description}</p>
          </div>
        </div>
        <ArrowRight
          className={`
            w-4 h-4 ${agent.iconColor} opacity-0 
            group-hover:opacity-100 group-hover:translate-x-0.5 
            transition-all duration-300 mt-1
          `}
        />
      </div>

      {/* Subtle shimmer on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 shimmer" />
      </div>
    </Link>
  );
}

// Premium Activity Row
function ActivityRow({ activity }: { activity: ActivityItem }) {
  const config = activityConfig[activity.type];
  const Icon = config.icon;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors group cursor-pointer">
      <div className={`p-2 rounded-lg ${config.bgColor} transition-transform duration-200 group-hover:scale-105`}>
        <Icon className={`w-4 h-4 ${config.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className={`accent-dot ${config.dotClass}`} />
          <p className="text-sm text-zinc-200 font-medium truncate group-hover:text-white transition-colors">
            {activity.title}
          </p>
        </div>
        <p className="text-xs text-zinc-500 truncate mt-0.5">{activity.description}</p>
      </div>
      <span className="text-xs text-zinc-600 whitespace-nowrap">
        {formatTime(activity.timestamp)}
      </span>
    </div>
  );
}
