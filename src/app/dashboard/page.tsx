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
} from "lucide-react";

/**
 * ============================================================================
 * DASHBOARD HOME PAGE - SUPER DARK MONOCHROME
 * ============================================================================
 * Ultra-minimal, sleek dashboard with monochrome design.
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

// Agent cards configuration - monochrome
const agents = [
  {
    id: "code-police",
    name: "Code Police",
    description: "AI code review",
    icon: Shield,
    href: "/dashboard/code-police",
  },
  {
    id: "pitch-deck",
    name: "Pitch Deck",
    description: "Generate decks",
    icon: Presentation,
    href: "/dashboard/pitch-deck",
  },
  {
    id: "equity",
    name: "Equity",
    description: "Token management",
    icon: Coins,
    href: "/dashboard/equity",
  },
  {
    id: "database",
    name: "Database",
    description: "Chat with DB",
    icon: Database,
    href: "/dashboard/database",
  },
];

// Activity icon mapping - monochrome
const activityIcons = {
  "code-review": Shield,
  "pitch-deck": Presentation,
  equity: Coins,
  database: Database,
};

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

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Minimal Welcome */}
      <div>
        <h1 className="text-xl font-medium text-white">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Your AI workspace overview
        </p>
      </div>

      {/* Stats Grid - Minimal */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Shield}
          label="Reviews"
          value={stats?.codeReviews.total ?? 0}
          sub={`+${stats?.codeReviews.thisWeek ?? 0}`}
          isLoading={isLoading}
        />
        <StatCard
          icon={Presentation}
          label="Decks"
          value={stats?.pitchDecks.total ?? 0}
          sub={`${stats?.pitchDecks.completed ?? 0} done`}
          isLoading={isLoading}
        />
        <StatCard
          icon={Coins}
          label="Projects"
          value={stats?.equityProjects.total ?? 0}
          sub={`${stats?.equityProjects.transfers ?? 0} txns`}
          isLoading={isLoading}
        />
        <StatCard
          icon={Database}
          label="Connections"
          value={stats?.databaseQueries.connections ?? 0}
          sub={`${stats?.databaseQueries.queries ?? 0} queries`}
          isLoading={isLoading}
        />
      </div>

      {/* Agent Cards - Compact Row */}
      <div>
        <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
          Agents
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      {/* Recent Activity - Clean List */}
      <div>
        <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
          Recent Activity
        </h2>
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-7 h-7 rounded bg-zinc-800" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-28 bg-zinc-800 rounded" />
                    <div className="h-2.5 w-40 bg-zinc-800/60 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="divide-y divide-zinc-800/60">
              {stats.recentActivity.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <Activity className="w-5 h-5 text-zinc-600 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm">No activity yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Minimal Stat Card
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  isLoading,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  sub: string;
  isLoading: boolean;
}) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-6 w-10 bg-zinc-800 rounded" />
        </div>
      ) : (
        <>
          <p className="text-2xl font-semibold text-white tabular-nums">{value}</p>
          <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>
        </>
      )}
    </div>
  );
}

// Compact Agent Card
function AgentCard({
  agent,
}: {
  agent: (typeof agents)[0];
}) {
  return (
    <Link
      href={agent.href}
      className="group bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-3 transition-all hover:bg-zinc-800/40 hover:border-zinc-700/60"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-zinc-800/80">
            <agent.icon className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-zinc-200">{agent.name}</h3>
            <p className="text-xs text-zinc-600">{agent.description}</p>
          </div>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-zinc-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}

// Activity Row
function ActivityRow({ activity }: { activity: ActivityItem }) {
  const Icon = activityIcons[activity.type];

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/30 transition-colors">
      <div className="p-1.5 rounded bg-zinc-800/60">
        <Icon className="w-3.5 h-3.5 text-zinc-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-300 truncate">{activity.title}</p>
        <p className="text-xs text-zinc-600 truncate">{activity.description}</p>
      </div>
      <span className="text-xs text-zinc-600">{formatTime(activity.timestamp)}</span>
    </div>
  );
}

