"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Coins,
  Plus,
  Wallet,
  ArrowRightLeft,
  PieChart,
  ArrowRight,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useWallet, SEPOLIA_CHAIN_ID_NUM } from "@/components/providers/wallet-provider";

/**
 * ============================================================================
 * EQUITY - MAIN PAGE
 * ============================================================================
 * Manage equity token distribution for projects.
 * Fetches real projects from Firestore.
 */

interface EquityProject {
  id: string;
  name: string;
  symbol: string;
  contractAddress: string;
  totalSupply: string;
  createdAt: Date;
}

export default function EquityPage() {
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

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Coins className="w-5 h-5 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Equity Distribution</h1>
          </div>
          <p className="text-zinc-400">
            Manage and distribute equity tokens on the blockchain
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-xl">
              <div className={`w-2 h-2 rounded-full ${isOnSepolia ? 'bg-green-400' : 'bg-yellow-400'}`} />
              <span className="text-sm text-zinc-300">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              {!isOnSepolia && (
                <button 
                  onClick={switchToSepolia}
                  className="text-xs text-yellow-400 hover:underline"
                >
                  Switch to Sepolia
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
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
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState onConnectWallet={handleConnectWallet} walletConnected={isConnected} isConnecting={isConnecting} />
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
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
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-purple-500/10 flex items-center justify-center">
        <Coins className="w-8 h-8 text-purple-400" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">
        No equity projects yet
      </h2>
      <p className="text-zinc-400 mb-6 max-w-md mx-auto">
        Create a project to mint equity tokens and distribute them to your team, investors, and contributors.
      </p>
      
      {!walletConnected ? (
        <button
          onClick={onConnectWallet}
          disabled={isConnecting}
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          {isConnecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Wallet className="w-4 h-4" />
          )}
          Connect Wallet to Start
        </button>
      ) : (
        <Link
          href="/dashboard/equity/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Your First Project
        </Link>
      )}

      {/* Features */}
      <div className="mt-10 pt-8 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        <div className="p-4 rounded-xl bg-zinc-800/50">
          <PieChart className="w-6 h-6 text-purple-400 mb-3" />
          <h3 className="font-medium text-white mb-1">Token Distribution</h3>
          <p className="text-sm text-zinc-400">
            Create ERC-20 tokens representing equity in your project.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-800/50">
          <ArrowRightLeft className="w-6 h-6 text-purple-400 mb-3" />
          <h3 className="font-medium text-white mb-1">Easy Transfers</h3>
          <p className="text-sm text-zinc-400">
            Transfer tokens by percentage, not complex amounts.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-800/50">
          <ExternalLink className="w-6 h-6 text-purple-400 mb-3" />
          <h3 className="font-medium text-white mb-1">Sepolia Testnet</h3>
          <p className="text-sm text-zinc-400">
            Test your equity distribution before going to mainnet.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: EquityProject }) {
  return (
    <Link
      href={`/dashboard/equity/${project.id}`}
      className="group flex items-center justify-between p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-purple-500/10">
          <Coins className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
              {project.name}
            </h3>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-500/10 text-purple-400">
              {project.symbol}
            </span>
          </div>
          <p className="text-sm text-zinc-500 font-mono">
            {project.contractAddress?.slice(0, 10)}...{project.contractAddress?.slice(-8)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-sm text-zinc-400">Total Supply</p>
          <p className="font-semibold text-white">{project.totalSupply}</p>
        </div>
        <a
          href={`https://sepolia.etherscan.io/address/${project.contractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-zinc-500 hover:text-white transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-5 h-5" />
        </a>
        <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}
