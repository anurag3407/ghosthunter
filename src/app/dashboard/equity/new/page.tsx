"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Coins,
  ArrowLeft,
  Wallet,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useWallet, SEPOLIA_CHAIN_ID_NUM } from "@/components/providers/wallet-provider";
import {
  connectWallet,
  mintInitialTokens,
  hasUserMinted,
  getDisplayBalance,
} from "@/lib/agents/equity/contract";

export default function NewEquityProjectPage() {
  const router = useRouter();
  const { address, isConnected, isConnecting, connect, chainId, switchToSepolia } = useWallet();
  const [projectName, setProjectName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState<"idle" | "minting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [txHash, setTxHash] = useState("");

  const isOnSepolia = chainId === SEPOLIA_CHAIN_ID_NUM;

  const handleMintTokens = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    if (!isOnSepolia) {
      await switchToSepolia();
      return;
    }

    setIsMinting(true);
    setMintStatus("minting");
    setErrorMessage("");

    try {
      const { signer } = await connectWallet();
      
      // Check if already minted
      const alreadyMinted = await hasUserMinted(signer, address!);
      if (alreadyMinted) {
        const balance = await getDisplayBalance(signer, address!);
        setMintStatus("success");
        setTxHash("Already minted - Balance: " + balance + " tokens");
        return;
      }

      // Mint tokens
      const hash = await mintInitialTokens(signer);
      setTxHash(hash);
      setMintStatus("success");
      
      // Redirect to equity dashboard after success
      setTimeout(() => {
        router.push("/dashboard/equity");
      }, 3000);
    } catch (error) {
      console.error("Minting error:", error);
      setMintStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to mint tokens");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/equity"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Equity
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Coins className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Create Equity Project</h1>
            <p className="text-zinc-400">Mint your initial equity tokens</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
        {/* Wallet Connection Status */}
        <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-purple-400" />
              <div>
                <p className="font-medium text-white">Wallet Status</p>
                <p className="text-sm text-zinc-400">
                  {isConnected 
                    ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}`
                    : "Not connected"}
                </p>
              </div>
            </div>
            {isConnected ? (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOnSepolia ? 'bg-green-400' : 'bg-yellow-400'}`} />
                <span className="text-sm text-zinc-400">
                  {isOnSepolia ? 'Sepolia' : 'Wrong Network'}
                </span>
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isConnecting ? "Connecting..." : "Connect"}
              </button>
            )}
          </div>
        </div>

        {/* Network Warning */}
        {isConnected && !isOnSepolia && (
          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-400">Wrong Network</p>
                <p className="text-sm text-zinc-400 mb-3">
                  Please switch to Sepolia testnet to mint tokens.
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

        {/* Project Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My Startup"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Token Symbol
            </label>
            <input
              type="text"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
              placeholder="EQT"
              maxLength={5}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
            />
          </div>
        </div>

        {/* Token Info */}
        <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
          <h3 className="font-medium text-purple-300 mb-2">Token Details</h3>
          <ul className="text-sm text-zinc-400 space-y-1">
            <li>• You will receive 1,000,000 equity tokens</li>
            <li>• Tokens are minted on Sepolia testnet</li>
            <li>• You can transfer % of tokens to team members</li>
            <li>• All transactions are verifiable on-chain</li>
          </ul>
        </div>

        {/* Mint Status */}
        {mintStatus === "success" && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-400">Tokens Minted Successfully!</p>
                <p className="text-sm text-zinc-400 mt-1">
                  {txHash.startsWith("0x") ? (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:underline"
                    >
                      View on Etherscan →
                    </a>
                  ) : txHash}
                </p>
              </div>
            </div>
          </div>
        )}

        {mintStatus === "error" && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-400">Minting Failed</p>
                <p className="text-sm text-zinc-400">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Mint Button */}
        <button
          onClick={handleMintTokens}
          disabled={isMinting || mintStatus === "success" || !isConnected || !isOnSepolia}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isMinting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Minting Tokens...
            </>
          ) : mintStatus === "success" ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Tokens Minted!
            </>
          ) : (
            <>
              <Coins className="w-5 h-5" />
              Mint 1,000,000 Equity Tokens
            </>
          )}
        </button>
      </div>
    </div>
  );
}
