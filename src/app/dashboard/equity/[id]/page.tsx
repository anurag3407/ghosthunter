"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useWallet, SEPOLIA_CHAIN_ID_NUM } from "@/components/providers/wallet-provider";
import {
  connectWallet,
  getDisplayBalance,
  getTokenInfo,
  transferPercent,
  hasUserMinted,
} from "@/lib/agents/equity/contract";

export default function EquityDetailPage() {
  const { address, isConnected, chainId, connect, switchToSepolia } = useWallet();
  const [balance, setBalance] = useState<string>("0");
  const [tokenInfo, setTokenInfo] = useState<{ name: string; symbol: string; totalSupply: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [percentage, setPercentage] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferStatus, setTransferStatus] = useState<"idle" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isOnSepolia = chainId === SEPOLIA_CHAIN_ID_NUM;

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

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/equity"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Equity
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {tokenInfo?.name || "Equity Token"}
              </h1>
              <p className="text-zinc-400">{tokenInfo?.symbol || "EQT"}</p>
            </div>
          </div>
          {isConnected && isOnSepolia && (
            <a
              href={`https://sepolia.etherscan.io/address/${process.env.NEXT_PUBLIC_EQUITY_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
            >
              View Contract <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Not Connected State */}
      {!isConnected && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center">
          <Wallet className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-zinc-400 mb-6">Connect your wallet to view and manage your equity tokens.</p>
          <button
            onClick={connect}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      )}

      {/* Wrong Network State */}
      {isConnected && !isOnSepolia && (
        <div className="bg-zinc-900/50 border border-yellow-500/20 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Wrong Network</h2>
          <p className="text-zinc-400 mb-6">Please switch to Sepolia testnet to interact with your tokens.</p>
          <button
            onClick={switchToSepolia}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-xl transition-colors"
          >
            Switch to Sepolia
          </button>
        </div>
      )}

      {/* Connected State */}
      {isConnected && isOnSepolia && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <Wallet className="w-4 h-4" />
                <span className="text-sm">Your Balance</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {isLoading ? "..." : parseInt(balance).toLocaleString()}
              </p>
              <p className="text-sm text-zinc-500">{tokenInfo?.symbol || "EQT"}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <PieChart className="w-4 h-4" />
                <span className="text-sm">Your Ownership</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {isLoading ? "..." : ((parseInt(balance) / 1000000) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-zinc-500">of total supply</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">Total Supply</span>
              </div>
              <p className="text-3xl font-bold text-white">1,000,000</p>
              <p className="text-sm text-zinc-500">{tokenInfo?.symbol || "EQT"}</p>
            </div>
          </div>

          {/* Transfer Section */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-purple-400" />
              Transfer Equity
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Percentage to Transfer
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    placeholder="10"
                    min="1"
                    max="100"
                    className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-400">%</span>
                </div>
                {percentage && (
                  <p className="text-sm text-zinc-500 mt-2">
                    ≈ {((parseInt(balance) * parseInt(percentage)) / 100).toLocaleString()} tokens
                  </p>
                )}
              </div>

              {transferStatus === "success" && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Transfer successful!</span>
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
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleTransfer}
                disabled={isTransferring || !recipientAddress || !percentage}
                className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        </div>
      )}
    </div>
  );
}
