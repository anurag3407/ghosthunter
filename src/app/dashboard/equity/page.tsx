"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Coins,
  Plus,
  Wallet,
  ArrowRight,
  ExternalLink,
  Loader2,
  Github,
  Briefcase,
  Clock,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { useWallet, SEPOLIA_CHAIN_ID_NUM } from "@/components/providers/wallet-provider";
import { GhostfounderLoader } from "@/components/ui/ghostfounder-loader";

/**
 * ============================================================================
 * EQUITY - MAIN DASHBOARD
 * ============================================================================
 * Sleek, spacious equity token management dashboard.
 * Features: Project list, portfolio summary, navigation tabs.
 */

interface EquityProject {
  id: string;
  name: string;
  symbol: string;
  contractAddress: string;
  totalSupply: string;
  githubRepoFullName?: string;
  githubRepoOwner?: string;
  createdAt: string;
}

// Navigation tabs
const tabs = [
  { id: "projects", label: "My Projects", href: "/dashboard/equity" },
  { id: "portfolio", label: "Portfolio", href: "/dashboard/equity/portfolio" },
  { id: "history", label: "History", href: "/dashboard/equity/history" },
];

export default function EquityPage() {
  const pathname = usePathname();
  const { address, isConnected, isConnecting, connect, chainId, switchToSepolia } = useWallet();
  const isOnSepolia = chainId === SEPOLIA_CHAIN_ID_NUM;
  const [projects, setProjects] = useState<EquityProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/equity/projects");
        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects || []);
        }
      } catch (error) {
        console.error("Error fetching equity projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleConnectWallet = async () => {
    await connect();
  };

  const handleDelete = async (projectId: string) => {
    try {
      const response = await fetch(`/api/equity/projects/${projectId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId));
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <div className="p-8 lg:p-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Coins className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Equity Distribution</h1>
          </div>
          <p className="text-zinc-400 text-lg">
            Mint and distribute equity tokens for your GitHub repositories
          </p>
        </div>

        {/* Wallet & Actions */}
        <div className="flex items-center gap-4">
          {isConnected ? (
            <div className="flex items-center gap-3 px-5 py-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
              <div className={`w-2.5 h-2.5 rounded-full ${isOnSepolia ? 'bg-green-400' : 'bg-yellow-400'}`} />
              <span className="text-sm text-zinc-300 font-medium">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              {!isOnSepolia && (
                <button
                  onClick={switchToSepolia}
                  className="text-xs text-yellow-400 hover:underline ml-2"
                >
                  Switch to Sepolia
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="inline-flex items-center gap-2 px-5 py-3 bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-white font-medium rounded-2xl transition-all"
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wallet className="w-4 h-4" />
              )}
              Connect Wallet
            </button>
          )}
          <Link
            href="/dashboard/equity/new"
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-zinc-900/50 border border-zinc-800 rounded-2xl w-fit">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`
                px-5 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }
              `}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Briefcase className="w-4 h-4" />
            <span className="text-sm">Total Projects</span>
          </div>
          <p className="text-3xl font-bold text-white">{projects.length}</p>
        </div>
        <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Total Tokens</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {projects.reduce((sum, p) => sum + parseInt(p.totalSupply || "0"), 0).toLocaleString()}
          </p>
        </div>
        <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Latest Activity</span>
          </div>
          <p className="text-lg font-medium text-white">
            {projects[0]?.createdAt
              ? new Date(projects[0].createdAt).toLocaleDateString()
              : "No activity"
            }
          </p>
        </div>
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <GhostfounderLoader size="lg" text="Loading projects..." />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState onConnectWallet={handleConnectWallet} walletConnected={isConnected} isConnecting={isConnecting} />
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Your Projects</h2>
          <div className="grid gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({
  onConnectWallet,
  walletConnected,
  isConnecting,
}: {
  onConnectWallet: () => void;
  walletConnected: boolean;
  isConnecting: boolean;
}) {
  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-16 text-center">
      <div className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
        <Coins className="w-10 h-10 text-purple-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">
        No equity projects yet
      </h2>
      <p className="text-zinc-400 mb-8 max-w-md mx-auto text-lg">
        Create a project to mint equity tokens for your GitHub repository and distribute them to your team.
      </p>

      {!walletConnected ? (
        <button
          onClick={onConnectWallet}
          disabled={isConnecting}
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20"
        >
          {isConnecting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Wallet className="w-5 h-5" />
          )}
          Connect Wallet to Start
        </button>
      ) : (
        <Link
          href="/dashboard/equity/new"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-5 h-5" />
          Create Your First Project
        </Link>
      )}

      {/* Features Grid */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <Github className="w-8 h-8 text-purple-400 mb-4" />
          <h3 className="font-semibold text-white mb-2">Repo-Based Tokens</h3>
          <p className="text-sm text-zinc-400">
            Mint tokens tied to your GitHub repositories. Only repo owners can mint.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <TrendingUp className="w-8 h-8 text-purple-400 mb-4" />
          <h3 className="font-semibold text-white mb-2">Easy Distribution</h3>
          <p className="text-sm text-zinc-400">
            Transfer tokens by percentage, not complex amounts.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <ExternalLink className="w-8 h-8 text-purple-400 mb-4" />
          <h3 className="font-semibold text-white mb-2">On-Chain Verified</h3>
          <p className="text-sm text-zinc-400">
            All transactions verifiable on Sepolia Etherscan.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  onDelete
}: {
  project: EquityProject;
  onDelete: (id: string) => void;
}) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Don't navigate if clicking on buttons or external links
    if (target.closest('button') || target.closest('a[href^="https://"]')) {
      return;
    }
    window.location.href = `/dashboard/equity/${project.id}`;
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConfirming) {
      setIsDeleting(true);
      await onDelete(project.id);
      setIsDeleting(false);
    } else {
      setIsConfirming(true);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group flex items-center justify-between p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-purple-500/30 hover:bg-zinc-900/80 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-5">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <Coins className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
              {project.name}
            </h3>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-500/10 text-purple-400">
              {project.symbol}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            {project.githubRepoFullName && (
              <span className="flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5" />
                {project.githubRepoFullName}
              </span>
            )}
            <span className="font-mono">
              {project.contractAddress?.slice(0, 10)}...{project.contractAddress?.slice(-8)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-zinc-400">Total Supply</p>
          <p className="text-xl font-bold text-white">
            {parseInt(project.totalSupply || "0").toLocaleString()}
          </p>
        </div>

        {/* Delete Button */}
        {isConfirming ? (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="px-3 py-2 text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setIsConfirming(false); }}
              disabled={isDeleting}
              className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleDeleteClick}
            className="p-3 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-xl transition-all"
            title="Delete project"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}

        <a
          href={`https://sepolia.etherscan.io/address/${project.contractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-5 h-5" />
        </a>
        <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
}
