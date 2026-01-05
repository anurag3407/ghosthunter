"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Coins,
  Wallet,
  Loader2,
  PieChart,
  TrendingUp,
  ArrowUpRight,
  ExternalLink,
  Briefcase,
  ArrowDownLeft,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useWallet, SEPOLIA_CHAIN_ID_NUM } from "@/components/providers/wallet-provider";
import { TokenStatsCard, TokenStatsGrid } from "@/components/equity/token-stats-card";
import {
  connectWallet,
  getDisplayBalance,
  getTokenInfo,
  hasUserMinted,
} from "@/lib/agents/equity/contract";

/**
 * ============================================================================
 * EQUITY PORTFOLIO PAGE
 * ============================================================================
 * Display user's token holdings from blockchain wallet directly.
 * Primary data source: Ethereum blockchain via wallet connection.
 * Secondary data source: Firestore for project metadata.
 */

interface OwnedProject {
  id: string;
  name: string;
  symbol: string;
  contractAddress: string;
  totalSupply: string;
  githubRepoFullName?: string;
  createdAt: string;
  role: "owner";
}

interface Portfolio {
  ownedProjects: OwnedProject[];
  receivedTokens: Array<{
    projectId: string;
    totalReceived: string;
    transactions: unknown[];
  }>;
  recentTransactions: unknown[];
  summary: {
    totalProjectsOwned: number;
    totalMintedTokens: number;
    totalTransactions: number;
  };
}

interface WalletTokenData {
  balance: string;
  hasMinted: boolean;
  tokenName: string;
  tokenSymbol: string;
  totalSupply: string;
  ownershipPercentage: number;
}

// Navigation tabs
const tabs = [
  { id: "projects", label: "My Projects", href: "/dashboard/equity" },
  { id: "portfolio", label: "Portfolio", href: "/dashboard/equity/portfolio" },
  { id: "history", label: "History", href: "/dashboard/equity/history" },
];

export default function PortfolioPage() {
  const pathname = usePathname();
  const { address, isConnected, connect, chainId, isConnecting, switchToSepolia } = useWallet();
  const isOnSepolia = chainId === SEPOLIA_CHAIN_ID_NUM;
  
  // API data (project metadata from Firestore)
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Blockchain data (token balances from wallet)
  const [walletData, setWalletData] = useState<WalletTokenData | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  // Fetch project metadata from API
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch("/api/equity/portfolio");
        if (response.ok) {
          const data = await response.json();
          setPortfolio(data.portfolio);
        }
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  // Fetch token data directly from blockchain
  const fetchWalletData = useCallback(async () => {
    if (!isConnected || !isOnSepolia || !address) {
      return;
    }

    setIsLoadingWallet(true);
    setWalletError(null);

    try {
      const { signer } = await connectWallet();
      
      // Fetch all data from blockchain in parallel
      const [balance, hasMinted, tokenInfo] = await Promise.all([
        getDisplayBalance(signer, address),
        hasUserMinted(signer, address),
        getTokenInfo(signer),
      ]);

      // Calculate ownership percentage
      const balanceNum = parseInt(balance) || 0;
      const totalSupplyNum = parseFloat(tokenInfo.totalSupply) || 1000000;
      const ownershipPercentage = (balanceNum / totalSupplyNum) * 100;

      setWalletData({
        balance,
        hasMinted,
        tokenName: tokenInfo.name,
        tokenSymbol: tokenInfo.symbol,
        totalSupply: tokenInfo.totalSupply,
        ownershipPercentage: Math.round(ownershipPercentage * 100) / 100,
      });
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      setWalletError(
        error instanceof Error 
          ? error.message 
          : "Failed to fetch token data from blockchain"
      );
    } finally {
      setIsLoadingWallet(false);
    }
  }, [isConnected, isOnSepolia, address]);

  // Fetch wallet data when connected
  useEffect(() => {
    if (isConnected && isOnSepolia) {
      fetchWalletData();
    }
  }, [isConnected, isOnSepolia, fetchWalletData]);

  // Calculate ownership distribution for pie chart (from wallet data)
  const calculateDistribution = () => {
    if (!walletData || !walletData.hasMinted) return [];
    
    const yourBalance = parseInt(walletData.balance) || 0;
    const totalSupply = parseFloat(walletData.totalSupply) || 1000000;
    const othersBalance = totalSupply - yourBalance;

    const distribution = [];
    
    if (yourBalance > 0) {
      distribution.push({
        name: "Your Holdings",
        value: yourBalance,
        percentage: walletData.ownershipPercentage.toFixed(1),
        color: "from-purple-500 to-pink-500",
      });
    }
    
    if (othersBalance > 0) {
      distribution.push({
        name: "Others",
        value: othersBalance,
        percentage: (100 - walletData.ownershipPercentage).toFixed(1),
        color: "from-zinc-600 to-zinc-500",
      });
    }

    return distribution;
  };

  const distribution = calculateDistribution();

  return (
    <div className="p-8 lg:p-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Briefcase className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Portfolio</h1>
          </div>
          <p className="text-zinc-400 text-lg">
            View your token holdings directly from your wallet
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <div className="flex items-center gap-3 px-5 py-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
                <div className={`w-2.5 h-2.5 rounded-full ${isOnSepolia ? 'bg-green-400' : 'bg-yellow-400'}`} />
                <span className="text-sm text-zinc-300 font-medium">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                {!isOnSepolia && (
                  <button
                    onClick={switchToSepolia}
                    className="text-xs text-yellow-400 hover:text-yellow-300"
                  >
                    Switch to Sepolia
                  </button>
                )}
              </div>
              {isOnSepolia && (
                <button
                  onClick={fetchWalletData}
                  disabled={isLoadingWallet}
                  className="p-3 bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition-all"
                  title="Refresh wallet data"
                >
                  <RefreshCw className={`w-4 h-4 text-zinc-400 ${isLoadingWallet ? 'animate-spin' : ''}`} />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="inline-flex items-center gap-2 px-5 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-2xl transition-all"
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wallet className="w-4 h-4" />
              )}
              Connect Wallet
            </button>
          )}
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

      {/* Wallet Connection Required */}
      {!isConnected && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-purple-500/10 flex items-center justify-center">
            <Wallet className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-zinc-400 mb-6 max-w-md mx-auto">
            Connect your MetaMask wallet to view your equity token holdings directly from the blockchain.
          </p>
          <button
            onClick={connect}
            disabled={isConnecting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors"
          >
            {isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wallet className="w-4 h-4" />
            )}
            Connect Wallet
          </button>
        </div>
      )}

      {/* Wrong Network Warning */}
      {isConnected && !isOnSepolia && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Wrong Network</h3>
              <p className="text-zinc-400 mb-4">
                Please switch to Sepolia testnet to view your equity tokens.
              </p>
              <button
                onClick={switchToSepolia}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors"
              >
                Switch to Sepolia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Error */}
      {walletError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-400 mb-1">Error Loading Wallet Data</h3>
              <p className="text-sm text-zinc-400">{walletError}</p>
              <button
                onClick={fetchWalletData}
                className="mt-3 text-sm text-purple-400 hover:text-purple-300"
              >
                Try again →
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading || isLoadingWallet ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">
              {isLoadingWallet ? "Fetching data from blockchain..." : "Loading portfolio..."}
            </p>
          </div>
        </div>
      ) : isConnected && isOnSepolia ? (
        <>
          {/* Stats Grid - From Blockchain */}
          <TokenStatsGrid columns={4}>
            <TokenStatsCard
              icon={Coins}
              label="Your Balance"
              value={walletData?.balance ? parseInt(walletData.balance).toLocaleString() : "0"}
              subtext={walletData?.tokenSymbol || "EQT"}
              loading={isLoadingWallet}
            />
            <TokenStatsCard
              icon={PieChart}
              label="Your Ownership"
              value={`${walletData?.ownershipPercentage || 0}%`}
              subtext="of total supply"
              loading={isLoadingWallet}
            />
            <TokenStatsCard
              icon={Briefcase}
              label="Projects Owned"
              value={portfolio?.summary.totalProjectsOwned || 0}
              subtext="Active projects"
              loading={isLoading}
            />
            <TokenStatsCard
              icon={TrendingUp}
              label="Total Supply"
              value={walletData?.totalSupply ? parseFloat(walletData.totalSupply).toLocaleString() : "1,000,000"}
              subtext={walletData?.tokenSymbol || "EQT"}
              loading={isLoadingWallet}
            />
          </TokenStatsGrid>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ownership Distribution from Blockchain */}
            <div className="lg:col-span-1 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-400" />
                Ownership Distribution
              </h2>

              {distribution.length > 0 && walletData?.hasMinted ? (
                <>
                  {/* CSS Pie Chart */}
                  <div className="relative w-48 h-48 mx-auto mb-8">
                    <div
                      className="w-full h-full rounded-full"
                      style={{
                        background: `conic-gradient(
                          #a855f7 0% ${walletData.ownershipPercentage}%, 
                          #3f3f46 ${walletData.ownershipPercentage}% 100%
                        )`,
                      }}
                    >
                      <div className="absolute inset-4 bg-zinc-900 rounded-full flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-white">{walletData.ownershipPercentage}%</p>
                          <p className="text-xs text-zinc-500">Your Share</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        <span className="text-sm text-zinc-300">Your Holdings</span>
                      </div>
                      <span className="text-sm font-medium text-white">
                        {parseInt(walletData.balance).toLocaleString()} {walletData.tokenSymbol}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-zinc-600" />
                        <span className="text-sm text-zinc-300">Others</span>
                      </div>
                      <span className="text-sm font-medium text-white">
                        {(100 - walletData.ownershipPercentage).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  <PieChart className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="mb-4">No tokens minted yet</p>
                  <Link
                    href="/dashboard/equity/new"
                    className="text-purple-400 hover:text-purple-300 text-sm"
                  >
                    Mint your first tokens →
                  </Link>
                </div>
              )}
            </div>

            {/* Wallet Token Info */}
            <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-purple-400" />
                Wallet Token Balance
              </h2>

              {walletData?.hasMinted ? (
                <div className="space-y-6">
                  {/* Token Card */}
                  <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="p-4 rounded-xl bg-purple-500/20">
                          <Coins className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{walletData.tokenName}</h3>
                          <p className="text-zinc-400">{walletData.tokenSymbol}</p>
                        </div>
                      </div>
                      <a
                        href={`https://sepolia.etherscan.io/address/${process.env.NEXT_PUBLIC_EQUITY_CONTRACT_ADDRESS}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-zinc-500 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-zinc-400 mb-1">Your Balance</p>
                        <p className="text-3xl font-bold text-white">
                          {parseInt(walletData.balance).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-400 mb-1">Ownership</p>
                        <p className="text-3xl font-bold text-purple-400">
                          {walletData.ownershipPercentage}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-4">
                    <Link
                      href="/dashboard/equity"
                      className="flex-1 p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl hover:border-purple-500/30 transition-all text-center"
                    >
                      <ArrowUpRight className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-white">Transfer Tokens</p>
                    </Link>
                    <Link
                      href="/dashboard/equity/history"
                      className="flex-1 p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl hover:border-purple-500/30 transition-all text-center"
                    >
                      <TrendingUp className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-white">View History</p>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-500">
                  <Coins className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="mb-2">You haven&apos;t minted any tokens yet</p>
                  <p className="text-sm mb-4">Create a project to mint your initial equity tokens</p>
                  <Link
                    href="/dashboard/equity/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors"
                  >
                    <Coins className="w-4 h-4" />
                    Create Project
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Owned Projects from Firestore */}
          {portfolio?.ownedProjects && portfolio.ownedProjects.length > 0 && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-purple-400" />
                Your Projects
              </h2>
              <div className="space-y-4">
                {portfolio.ownedProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/equity/${project.id}`}
                    className="flex items-center justify-between p-5 bg-zinc-800/50 border border-zinc-700/50 rounded-2xl hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-purple-500/10">
                        <Coins className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{project.name}</h3>
                          <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/10 text-purple-400">
                            {project.symbol}
                          </span>
                        </div>
                        {project.githubRepoFullName && (
                          <p className="text-sm text-zinc-500">{project.githubRepoFullName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">
                          {parseInt(project.totalSupply || "0").toLocaleString()}
                        </p>
                        <p className="text-sm text-zinc-500">tokens</p>
                      </div>
                      <a
                        href={`https://sepolia.etherscan.io/address/${project.contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-zinc-500 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
