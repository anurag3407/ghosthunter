import Link from "next/link";
import {
  Shield,
  Presentation,
  Coins,
  Database,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";

/**
 * ============================================================================
 * DASHBOARD HOME PAGE
 * ============================================================================
 * Main dashboard page showing agent cards and quick stats.
 */

// Agent cards configuration
const agents = [
  {
    id: "code-police",
    name: "Code Police",
    description: "AI-powered code review that analyzes your GitHub commits and sends detailed reports to your email.",
    icon: Shield,
    color: "from-red-500 to-orange-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    textColor: "text-red-400",
    href: "/dashboard/code-police",
    features: ["Automatic PR analysis", "Security scanning", "Performance tips"],
  },
  {
    id: "pitch-deck",
    name: "Pitch Deck Generator",
    description: "Generate professional pitch decks from your README and project features in seconds.",
    icon: Presentation,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    textColor: "text-blue-400",
    href: "/dashboard/pitch-deck",
    features: ["AI-generated slides", "PDF export", "Custom themes"],
  },
  {
    id: "equity",
    name: "Equity Distribution",
    description: "Manage and distribute equity tokens on the blockchain with a simple interface.",
    icon: Coins,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    textColor: "text-purple-400",
    href: "/dashboard/equity",
    features: ["Mint tokens", "Track ownership", "Transfer equity"],
  },
  {
    id: "database",
    name: "Database Agent",
    description: "Chat with your database using natural language. Connect PostgreSQL, MySQL, or MongoDB.",
    icon: Database,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    textColor: "text-green-400",
    href: "/dashboard/database",
    features: ["Natural language queries", "Schema visualization", "Query history"],
  },
];

export default async function DashboardPage() {
  // Development: Static greeting
  // TODO: Get real user name in production
  const firstName = "Developer";

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-400" />
          <span className="text-sm font-medium text-violet-400">Welcome back</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-white">
          Hey {firstName}! 👋
        </h1>
        <p className="text-zinc-400 max-w-2xl">
          Your AI-powered startup toolkit is ready. Choose an agent below to get started
          or check your recent activity.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatCard
          icon={Shield}
          label="Code Reviews"
          value="12"
          change="+3 this week"
          color="text-red-400"
        />
        <QuickStatCard
          icon={Presentation}
          label="Pitch Decks"
          value="4"
          change="2 completed"
          color="text-blue-400"
        />
        <QuickStatCard
          icon={Coins}
          label="Token Transfers"
          value="8"
          change="100% success"
          color="text-purple-400"
        />
        <QuickStatCard
          icon={Database}
          label="DB Queries"
          value="156"
          change="Last 7 days"
          color="text-green-400"
        />
      </div>

      {/* Agent Cards */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Your Agents</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="space-y-4">
            <ActivityItem
              icon={Shield}
              title="Code review completed"
              description="Found 3 issues in ghostfounder/main"
              time="2 hours ago"
              color="text-red-400"
            />
            <ActivityItem
              icon={Presentation}
              title="Pitch deck generated"
              description="Created deck for 'AI Startup'"
              time="Yesterday"
              color="text-blue-400"
            />
            <ActivityItem
              icon={Coins}
              title="Tokens transferred"
              description="Sent 10% equity to 0x1234...5678"
              time="2 days ago"
              color="text-purple-400"
            />
            <ActivityItem
              icon={Database}
              title="Database connected"
              description="PostgreSQL connection established"
              time="3 days ago"
              color="text-green-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Stat Card Component
function QuickStatCard({
  icon: Icon,
  label,
  value,
  change,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  color: string;
}) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <TrendingUp className="w-4 h-4 text-zinc-500" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="text-xs text-zinc-500 mt-1">{change}</p>
    </div>
  );
}

// Agent Card Component
function AgentCard({
  agent,
}: {
  agent: (typeof agents)[0];
}) {
  return (
    <Link
      href={agent.href}
      className={`group relative overflow-hidden bg-zinc-900/50 border ${agent.borderColor} rounded-2xl p-6 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900`}
    >
      {/* Gradient background on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${agent.bgColor}`}>
            <agent.icon className={`w-6 h-6 ${agent.textColor}`} />
          </div>
          <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-semibold text-white mb-2">{agent.name}</h3>
        <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{agent.description}</p>

        {/* Features */}
        <div className="flex flex-wrap gap-2">
          {agent.features.map((feature) => (
            <span
              key={feature}
              className="px-3 py-1 text-xs font-medium text-zinc-400 bg-zinc-800/50 rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

// Activity Item Component
function ActivityItem({
  icon: Icon,
  title,
  description,
  time,
  color,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  time: string;
  color: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className={`p-2 rounded-lg bg-zinc-800/50`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-white">{title}</p>
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
        </div>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>
      <div className="flex items-center gap-1 text-xs text-zinc-500">
        <Clock className="w-3 h-3" />
        {time}
      </div>
    </div>
  );
}
