"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock,
  Wallet,
  Loader2,
  Filter,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Search,
} from "lucide-react";
import { useWallet, SEPOLIA_CHAIN_ID_NUM } from "@/components/providers/wallet-provider";
import { GhostfounderLoader } from "@/components/ui/ghostfounder-loader";

/**
 * ============================================================================
 * EQUITY TRANSACTION HISTORY PAGE
 * ============================================================================
 * Detailed transaction history with filters and Etherscan links.
 */

interface Transaction {
  id: string;
  projectId: string;
  type: "mint" | "transfer";
  from: string;
  to: string;
  amount: string;
  percentage: number | null;
  txHash: string;
  createdAt: string;
  userId: string;
}

// Navigation tabs
const tabs = [
  { id: "projects", label: "My Projects", href: "/dashboard/equity" },
  { id: "portfolio", label: "Portfolio", href: "/dashboard/equity/portfolio" },
  { id: "history", label: "History", href: "/dashboard/equity/history" },
];

const filterOptions = [
  { id: "all", label: "All Transactions" },
  { id: "mint", label: "Mints Only" },
  { id: "transfer", label: "Transfers Only" },
];

export default function HistoryPage() {
  const pathname = usePathname();
  const { address, isConnected, connect, chainId, isConnecting } = useWallet();
  const isOnSepolia = chainId === SEPOLIA_CHAIN_ID_NUM;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const url = filter === "all"
          ? "/api/equity/transactions"
          : `/api/equity/transactions?type=${filter}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setTransactions(data.transactions || []);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [filter]);

  const formatAddress = (addr: string) => {
    if (addr === "0x0000000000000000000000000000000000000000") return "Mint";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatTime(timestamp);
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      tx.txHash.toLowerCase().includes(query) ||
      tx.from.toLowerCase().includes(query) ||
      tx.to.toLowerCase().includes(query)
    );
  });

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, tx) => {
    const date = new Date(tx.createdAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(tx);
    return groups;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="p-8 lg:p-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Transaction History</h1>
          </div>
          <p className="text-zinc-400 text-lg">
            View all your equity token mints and transfers
          </p>
        </div>

        {/* Wallet */}
        {isConnected ? (
          <div className="flex items-center gap-3 px-5 py-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
            <div className={`w-2.5 h-2.5 rounded-full ${isOnSepolia ? 'bg-green-400' : 'bg-yellow-400'}`} />
            <span className="text-sm text-zinc-300 font-medium">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>
        ) : (
          <button
            onClick={connect}
            disabled={isConnecting}
            className="inline-flex items-center gap-2 px-5 py-3 bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-white font-medium rounded-2xl transition-all"
          >
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </button>
        )}
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by address or tx hash..."
            className="w-full pl-11 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 p-1.5 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <Filter className="w-4 h-4 text-zinc-500 ml-2" />
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                setFilter(option.id);
                setIsLoading(true);
              }}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${filter === option.id
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-white"
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <GhostfounderLoader size="lg" text="Loading transactions..." />
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/30 border border-zinc-800 rounded-3xl">
          <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No transactions yet</h3>
          <p className="text-zinc-400 mb-6">
            Your mints and transfers will appear here
          </p>
          <Link
            href="/dashboard/equity/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors"
          >
            <Coins className="w-4 h-4" />
            Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTransactions).map(([date, txs]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-zinc-500 mb-4 sticky top-0 bg-zinc-950 py-2">
                {date}
              </h3>
              <div className="space-y-3">
                {txs.map((tx) => {
                  const isMint = tx.type === "mint";
                  const isReceived = address && tx.to.toLowerCase() === address.toLowerCase();
                  const isSent = address && tx.from.toLowerCase() === address.toLowerCase() && !isMint;

                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div
                          className={`
                            p-3 rounded-xl
                            ${isMint
                              ? "bg-purple-500/10"
                              : isReceived
                                ? "bg-green-500/10"
                                : "bg-orange-500/10"
                            }
                          `}
                        >
                          {isMint ? (
                            <Coins className="w-5 h-5 text-purple-400" />
                          ) : isReceived ? (
                            <ArrowDownLeft className="w-5 h-5 text-green-400" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-orange-400" />
                          )}
                        </div>

                        {/* Details */}
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-semibold text-white">
                              {isMint
                                ? "Minted Tokens"
                                : isReceived
                                  ? "Received"
                                  : "Transferred"}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {formatRelativeTime(tx.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-zinc-500">
                            {!isMint && (
                              <>
                                <span className="font-mono">{formatAddress(tx.from)}</span>
                                <span>→</span>
                                <span className="font-mono">{formatAddress(tx.to)}</span>
                              </>
                            )}
                            {isMint && (
                              <span>Initial supply minted to wallet</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Amount and Actions */}
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p
                            className={`text-xl font-bold ${isReceived ? "text-green-400" : isSent ? "text-orange-400" : "text-white"
                              }`}
                          >
                            {isReceived ? "+" : isSent ? "-" : ""}
                            {parseInt(tx.amount).toLocaleString()}
                          </p>
                          {tx.percentage && (
                            <p className="text-sm text-zinc-500">{tx.percentage}%</p>
                          )}
                        </div>

                        <a
                          href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 text-zinc-500 hover:text-purple-400 hover:bg-zinc-800 rounded-xl transition-all"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {!isLoading && filteredTransactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
          <div className="text-center p-4">
            <p className="text-2xl font-bold text-purple-400">
              {transactions.filter((t) => t.type === "mint").length}
            </p>
            <p className="text-sm text-zinc-500">Total Mints</p>
          </div>
          <div className="text-center p-4">
            <p className="text-2xl font-bold text-orange-400">
              {transactions.filter((t) => t.type === "transfer").length}
            </p>
            <p className="text-sm text-zinc-500">Total Transfers</p>
          </div>
          <div className="text-center p-4">
            <p className="text-2xl font-bold text-white">
              {transactions
                .reduce((sum, t) => sum + parseInt(t.amount || "0"), 0)
                .toLocaleString()}
            </p>
            <p className="text-sm text-zinc-500">Tokens Moved</p>
          </div>
        </div>
      )}
    </div>
  );
}
