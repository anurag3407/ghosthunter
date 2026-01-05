"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Coins,
  ArrowLeft,
  Send,
  Wallet,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users,
  PieChart,
  ExternalLink,
  Github,
  Clock,
  Copy,
  Check,
} from "lucide-react";
import { useWallet, SEPOLIA_CHAIN_ID_NUM } from "@/components/providers/wallet-provider";
import {
  connectWallet,
  getDisplayBalance,
  getTokenInfo,
  transferPercent,
} from "@/lib/agents/equity/contract";
import { TokenStatsCard, TokenStatsGrid } from "@/components/equity/token-stats-card";

/**
 * ============================================================================
 * EQUITY PROJECT DETAIL PAGE
 * ============================================================================
 * Sleek, spacious project detail with transfer functionality.
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

interface Transaction {
  id: string;
  type: "mint" | "transfer";
  from: string;
  to: string;
  amount: string;
  percentage: number | null;
  txHash: string;
  createdAt: string;
}

export default function EquityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { address, isConnected, chainId, connect, switchToSepolia } = useWallet();
  const [project, setProject] = useState<EquityProject | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [tokenInfo, setTokenInfo] = useState<{ name: string; symbol: string; totalSupply: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [percentage, setPercentage] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferStatus, setTransferStatus] = useState<"idle" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [copied, setCopied] = useState(false);

  const isOnSepolia = chainId === SEPOLIA_CHAIN_ID_NUM;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch("/api/equity/projects");
        if (response.ok) {
          const data = await response.json();
          const proj = data.projects?.find((p: EquityProject) => p.id === resolvedParams.id);
          if (proj) {
            setProject(proj);
          }
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    };

    const fetchTransactions = async () => {
      try {
        const response = await fetch(`/api/equity/transactions?projectId=${resolvedParams.id}`);
        if (response.ok) {
          const data = await response.json();
          setTransactions(data.transactions || []);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchProject();
    fetchTransactions();
  }, [resolvedParams.id]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isConnected || !isOnSepolia) {
        setIsLoading(false);
        return;
      }

      try {
        const { signer } = await connectWallet();
        const [balanceResult, tokenInfoResult] = await Promise.all([
          getDisplayBalance(signer, address!),
          getTokenInfo(signer),
        ]);
        setBalance(balanceResult);
        setTokenInfo(tokenInfoResult);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isConnected, address, isOnSepolia]);

  const handleTransfer = async () => {
    if (!recipientAddress || !percentage) return;

    setIsTransferring(true);
    setTransferStatus("idle");
    setErrorMessage("");

    try {
      const { signer } = await connectWallet();
      const result = await transferPercent(signer, recipientAddress, parseInt(percentage));
      setTxHash(result.txHash);
      setTransferStatus("success");
      
      // Record transaction
      await fetch("/api/equity/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: resolvedParams.id,
          type: "transfer",
          from: address,
          to: recipientAddress,
          amount: result.amount.replace(/,/g, ""),
          percentage: parseInt(percentage),
          txHash: result.txHash,
        }),
      });

      // Refresh balance
      const newBalance = await getDisplayBalance(signer, address!);
      setBalance(newBalance);
      
      // Reset form
      setRecipientAddress("");
      setPercentage("");
    } catch (error) {
      console.error("Transfer error:", error);
      setTransferStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Transfer failed");
    } finally {
      setIsTransferring(false);
    }
  };

  const copyAddress = () => {
    if (project?.contractAddress) {
      navigator.clipboard.writeText(project.contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    if (addr === "0x0000000000000000000000000000000000000000") return "Mint";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="p-8 lg:p-12 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/equity"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Equity
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-white">
                  {project?.name || tokenInfo?.name || "Equity Token"}
                </h1>
                <span className="px-3 py-1 text-sm font-semibold rounded-lg bg-purple-500/10 text-purple-400">
                  {project?.symbol || tokenInfo?.symbol || "EQT"}
                </span>
              </div>
              {project?.githubRepoFullName && (
                <a
                  href={`https://github.com/${project.githubRepoFullName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <Github className="w-4 h-4" />
                  {project.githubRepoFullName}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={copyAddress}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {project?.contractAddress?.slice(0, 10)}...
            </button>
            <a
              href={`https://sepolia.etherscan.io/address/${project?.contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl transition-colors"
            >
              View on Etherscan
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Not Connected State */}
      {!isConnected && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-12 text-center">
          <Wallet className="w-14 h-14 text-purple-400 mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h2>
          <p className="text-zinc-400 mb-8 text-lg">Connect your wallet to view and manage your equity tokens.</p>
          <button
            onClick={connect}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-purple-500/20"
          >
            Connect Wallet
          </button>
        </div>
      )}

      {/* Wrong Network State */}
      {isConnected && !isOnSepolia && (
        <div className="bg-zinc-900/50 border border-yellow-500/20 rounded-3xl p-12 text-center">
          <AlertCircle className="w-14 h-14 text-yellow-400 mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-white mb-3">Wrong Network</h2>
          <p className="text-zinc-400 mb-8 text-lg">Please switch to Sepolia testnet to interact with your tokens.</p>
          <button
            onClick={switchToSepolia}
            className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-2xl transition-colors"
          >
            Switch to Sepolia
          </button>
        </div>
      )}

      {/* Connected State */}
      {isConnected && isOnSepolia && (
        <>
          {/* Stats Grid */}
          <TokenStatsGrid columns={3}>
            <TokenStatsCard
              icon={Wallet}
              label="Your Balance"
              value={isLoading ? "..." : parseInt(balance).toLocaleString()}
              subtext={project?.symbol || tokenInfo?.symbol || "tokens"}
              loading={isLoading}
            />
            <TokenStatsCard
              icon={PieChart}
              label="Your Ownership"
              value={isLoading ? "..." : `${((parseInt(balance) / 1000000) * 100).toFixed(1)}%`}
              subtext="of total supply"
              loading={isLoading}
            />
            <TokenStatsCard
              icon={Users}
              label="Total Supply"
              value="1,000,000"
              subtext={project?.symbol || tokenInfo?.symbol || "tokens"}
              loading={false}
            />
          </TokenStatsGrid>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transfer Section */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10">
                  <Send className="w-5 h-5 text-purple-400" />
                </div>
                Transfer Equity
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-5 py-4 bg-zinc-800/50 border border-zinc-700 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Percentage to Transfer
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={percentage}
                      onChange={(e) => setPercentage(e.target.value)}
                      placeholder="10"
                      min="1"
                      max="100"
                      className="flex-1 px-5 py-4 bg-zinc-800/50 border border-zinc-700 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="px-5 py-4 bg-zinc-800/50 border border-zinc-700 rounded-2xl text-zinc-400 font-medium">
                      %
                    </span>
                  </div>
                  {percentage && parseInt(balance) > 0 && (
                    <p className="text-sm text-zinc-500 mt-3">
                      ≈ {Math.floor((parseInt(balance) * parseInt(percentage)) / 100).toLocaleString()} tokens
                    </p>
                  )}
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex gap-2">
                  {[10, 25, 50].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setPercentage(pct.toString())}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        percentage === pct.toString()
                          ? "bg-purple-500 text-white"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                {transferStatus === "success" && (
                  <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-3 text-green-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">Transfer successful!</span>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-sm hover:underline"
                      >
                        View on Etherscan →
                      </a>
                    </div>
                  </div>
                )}

                {transferStatus === "error" && (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center gap-3 text-red-400">
                      <AlertCircle className="w-5 h-5" />
                      <span>{errorMessage}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleTransfer}
                  disabled={isTransferring || !recipientAddress || !percentage || parseInt(balance) === 0}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isTransferring ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Transferring...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Transfer Equity
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10">
                  <Clock className="w-5 h-5 text-purple-400" />
                </div>
                Recent Transactions
              </h2>

              {transactions.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-2xl"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl ${
                            tx.type === "mint" ? "bg-purple-500/10" : "bg-orange-500/10"
                          }`}
                        >
                          {tx.type === "mint" ? (
                            <Coins className="w-4 h-4 text-purple-400" />
                          ) : (
                            <Send className="w-4 h-4 text-orange-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">
                            {tx.type === "mint" ? "Minted" : "Transfer"}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {tx.type === "mint"
                              ? "Initial supply"
                              : `${formatAddress(tx.from)} → ${formatAddress(tx.to)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-white">
                          {parseInt(tx.amount).toLocaleString()}
                        </span>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-500 hover:text-purple-400 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                  
                  {transactions.length > 5 && (
                    <Link
                      href="/dashboard/equity/history"
                      className="block text-center py-3 text-sm text-purple-400 hover:underline"
                    >
                      View all transactions →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
