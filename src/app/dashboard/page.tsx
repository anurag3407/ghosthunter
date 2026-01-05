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
  Sparkles,
  Clock,
  Activity,
} from "lucide-react";

/**
 * ============================================================================
 * DASHBOARD HOME PAGE - SLEEK DESIGN
 * ============================================================================
 * Modern, compact dashboard with real-time data from Firebase.
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

// Agent cards configuration - compact version
const agents = [
  {
    id: "code-police",
    name: "Code Police",
    description: "AI-powered code review & security scanning",
    icon: Shield,
    gradient: "from-rose-500/20 to-orange-500/20",
    iconColor: "text-rose-400",
    borderHover: "hover:border-rose-500/30",
    href: "/dashboard/code-police",
  },
  {
    id: "pitch-deck",
    name: "Pitch Deck",
    description: "Generate investor-ready presentations",
    icon: Presentation,
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
    borderHover: "hover:border-blue-500/30",
    href: "/dashboard/pitch-deck",
  },
  {
    id: "equity",
    name: "Equity",
    description: "Blockchain token management",
    icon: Coins,
    gradient: "from-violet-500/20 to-fuchsia-500/20",
    iconColor: "text-violet-400",
    borderHover: "hover:border-violet-500/30",
    href: "/dashboard/equity",
  },
  {
    id: "database",
    name: "Database",
    description: "Chat with your database in plain English",
    icon: Database,
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
    borderHover: "hover:border-emerald-500/30",
    href: "/dashboard/database",
  },
];

// Activity icon mapping
const activityIcons = {
  "code-review": { icon: Shield, color: "text-rose-400", bg: "bg-rose-500/10" },
  "pitch-deck": { icon: Presentation, color: "text-blue-400", bg: "bg-blue-500/10" },
  equity: { icon: Coins, color: "text-violet-400", bg: "bg-violet-500/10" },
  database: { icon: Database, color: "text-emerald-400", bg: "bg-emerald-500/10" },
};

export default function DashboardPage() {
  const { user } = useUser();
  const firstName = user?.firstName || "there";

  // Fetch real-time stats
  const { data, isLoading } = useSWR<{ stats: DashboardStats }>(
    "/api/dashboard/stats",
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30 seconds
  );

  const stats = data?.stats;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Compact Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Hey {firstName}! 👋
            </h1>
            <p className="text-sm text-zinc-500">
              Your AI startup toolkit is ready
            </p>
          </div>
        </div>
      </div>

      {/* Sleek Stats Bar */}
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0 lg:divide-x divide-zinc-800/50">
          <StatItem
            icon={Shield}
            label="Code Reviews"
            value={stats?.codeReviews.total ?? 0}
            subtext={`+${stats?.codeReviews.thisWeek ?? 0} this week`}
            color="text-rose-400"
            isLoading={isLoading}
          />
          <StatItem
            icon={Presentation}
            label="Pitch Decks"
            value={stats?.pitchDecks.total ?? 0}
            subtext={`${stats?.pitchDecks.completed ?? 0} completed`}
            color="text-blue-400"
            isLoading={isLoading}
          />
          <StatItem
            icon={Coins}
            label="Equity Projects"
            value={stats?.equityProjects.total ?? 0}
            subtext={`${stats?.equityProjects.transfers ?? 0} transfers`}
            color="text-violet-400"
            isLoading={isLoading}
          />
          <StatItem
            icon={Database}
            label="DB Connections"
            value={stats?.databaseQueries.connections ?? 0}
            subtext={`${stats?.databaseQueries.queries ?? 0} queries`}
            color="text-emerald-400"
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Agent Cards Grid - Compact */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Your Agents
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      {/* Recent Activity - Streamlined */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Recent Activity
        </h2>
        <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/50 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-zinc-800 rounded" />
                    <div className="h-3 w-48 bg-zinc-800/50 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="divide-y divide-zinc-800/50">
              {stats.recentActivity.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-800/50 mx-auto mb-3 flex items-center justify-center">
                <Activity className="w-6 h-6 text-zinc-600" />
              </div>
              <p className="text-zinc-500 text-sm">No activity yet</p>
              <p className="text-zinc-600 text-xs mt-1">
                Start using an agent to see your activity here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact Stat Item
function StatItem({
  icon: Icon,
  label,
  value,
  subtext,
  color,
  isLoading,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  subtext: string;
  color: string;
  isLoading: boolean;
}) {
  return (
    <div className="flex items-center gap-3 lg:px-4 first:lg:pl-0 last:lg:pr-0">
      <div className={`p-2 rounded-lg bg-zinc-800/50`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="min-w-0">
        {isLoading ? (
          <div className="space-y-1 animate-pulse">
            <div className="h-6 w-8 bg-zinc-800 rounded" />
            <div className="h-3 w-16 bg-zinc-800/50 rounded" />
          </div>
        ) : (
          <>
            <p className="text-xl font-bold text-white tabular-nums">{value}</p>
            <p className="text-xs text-zinc-500 truncate">{subtext}</p>
          </>
        )}
      </div>
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
      className={`group relative overflow-hidden bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4 transition-all duration-300 ${agent.borderHover} hover:bg-zinc-900/80`}
    >
      {/* Gradient overlay on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${agent.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-800/50 group-hover:bg-zinc-800 transition-colors">
            <agent.icon className={`w-5 h-5 ${agent.iconColor}`} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">{agent.name}</h3>
            <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">
              {agent.description}
            </p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </div>
    </Link>
  );
}

// Activity Row
function ActivityRow({ activity }: { activity: ActivityItem }) {
  const { icon: Icon, color, bg } = activityIcons[activity.type];

  // Format relative time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-zinc-800/30 transition-colors">
      <div className={`p-2 rounded-lg ${bg}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{activity.title}</p>
        <p className="text-xs text-zinc-500 truncate">{activity.description}</p>
      </div>
      <span className="text-xs text-zinc-600 flex-shrink-0">
        {formatTime(activity.timestamp)}
      </span>
    </div>
  );
}
