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
  Github,
  ChevronRight,
  Shield,
} from "lucide-react";
import { useWallet, SEPOLIA_CHAIN_ID_NUM } from "@/components/providers/wallet-provider";
import {
  connectWallet,
  mintInitialTokens,
  hasUserMinted,
  getDisplayBalance,
  getTokenInfo,
} from "@/lib/agents/equity/contract";
import { RepoSelector } from "@/components/equity/repo-selector";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  private: boolean;
  owner: {
    login: string;
  };
}

type Step = "select-repo" | "verify-owner" | "mint-tokens" | "complete";

export default function NewEquityProjectPage() {
  const router = useRouter();
  const { address, isConnected, isConnecting, connect, chainId, switchToSepolia } = useWallet();
  const [currentStep, setCurrentStep] = useState<Step>("select-repo");
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState<"idle" | "minting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [txHash, setTxHash] = useState("");

  const isOnSepolia = chainId === SEPOLIA_CHAIN_ID_NUM;

  const handleRepoSelect = (repo: Repository) => {
    setSelectedRepo(repo);
    setCurrentStep("verify-owner");
  };

  const handleVerifyOwnership = async () => {
    if (!selectedRepo) return;

    setIsVerifying(true);
    setErrorMessage("");

    try {
      // Verify ownership via API
      const response = await fetch(`/api/equity/verify-owner?repoId=${selectedRepo.id}`);
      const data = await response.json();

      if (!data.isOwner) {
        setErrorMessage("You are not the owner of this repository.");
        setIsVerifying(false);
        return;
      }

      // Check if already minted
      const mintedResponse = await fetch(`/api/equity/check-minted?repoId=${selectedRepo.id}`);
      const mintedData = await mintedResponse.json();

      if (mintedData.minted) {
        setErrorMessage("Tokens have already been minted for this repository.");
        setIsVerifying(false);
        return;
      }

      setCurrentStep("mint-tokens");
    } catch (error) {
      console.error("Verification error:", error);
      setErrorMessage("Failed to verify repository ownership.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleMintTokens = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    if (!isOnSepolia) {
      await switchToSepolia();
      return;
    }

    if (!selectedRepo) return;

    setIsMinting(true);
    setMintStatus("minting");
    setErrorMessage("");

    try {
      const { signer } = await connectWallet();

      console.log("[Equity Mint] Starting mint process...");
      console.log("[Equity Mint] Wallet address:", address);
      console.log("[Equity Mint] Contract address:", process.env.NEXT_PUBLIC_EQUITY_CONTRACT_ADDRESS);

      // Verify contract exists and is accessible
      try {
        const tokenInfo = await getTokenInfo(signer);
        console.log("[Equity Mint] Contract verified:", tokenInfo);
      } catch (verifyError) {
        console.error("[Equity Mint] Contract verification failed:", verifyError);
        throw new Error("Smart contract not accessible. Please ensure you're on Sepolia testnet.");
      }

      // Check if already minted on contract
      console.log("[Equity Mint] Checking if already minted...");
      const alreadyMinted = await hasUserMinted(signer, address!);
      console.log("[Equity Mint] Already minted:", alreadyMinted);

      if (alreadyMinted) {
        const balance = await getDisplayBalance(signer, address!);
        console.log("[Equity Mint] User already has balance:", balance);

        // Show success but inform user they already minted
        setMintStatus("success");
        setErrorMessage(`You've already minted your initial tokens. Current balance: ${balance} tokens`);
        setTxHash("N/A - Already minted");
        setCurrentStep("complete");

        // Don't try to save to database again, just show the message
        setTimeout(() => {
          router.push("/dashboard/equity");
        }, 3000);

        return;
      }

      // Mint tokens
      console.log("[Equity Mint] Calling mintInitialTokens()...");
      const hash = await mintInitialTokens(signer);
      console.log("[Equity Mint] Mint successful! Hash:", hash);
      setTxHash(hash);

      // Save project to database
      const projectResponse = await fetch("/api/equity/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedRepo.name,
          symbol: selectedRepo.name.substring(0, 5).toUpperCase(),
          contractAddress: process.env.NEXT_PUBLIC_EQUITY_CONTRACT_ADDRESS,
          totalSupply: "1000000",
          githubRepoId: selectedRepo.id,
          githubRepoFullName: selectedRepo.full_name,
          githubRepoOwner: selectedRepo.owner.login,
          ownerWalletAddress: address,
        }),
      });

      const projectData = await projectResponse.json();

      if (!projectResponse.ok) {
        throw new Error(projectData.error || "Failed to save project");
      }

      const projectId = projectData.project?.id;

      if (!projectId) {
        throw new Error("Failed to get project ID from response");
      }

      // Record mint transaction
      const txResponse = await fetch("/api/equity/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: projectId,
          type: "mint",
          from: "0x0000000000000000000000000000000000000000",
          to: address,
          amount: "1000000",
          txHash: hash,
        }),
      });

      if (!txResponse.ok) {
        console.error("Failed to record transaction:", await txResponse.json());
        // Don't throw here - the minting was successful, just the recording failed
      }

      setMintStatus("success");
      setCurrentStep("complete");

      // Redirect after delay
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

  const steps = [
    { id: "select-repo", label: "Select Repository", completed: currentStep !== "select-repo" },
    { id: "verify-owner", label: "Verify Ownership", completed: currentStep === "mint-tokens" || currentStep === "complete" },
    { id: "mint-tokens", label: "Mint Tokens", completed: currentStep === "complete" },
  ];

  return (
    <div className="p-8 lg:p-12 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <Link
          href="/dashboard/equity"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Equity
        </Link>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Coins className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Create Equity Project</h1>
            <p className="text-zinc-400 mt-1">Mint tokens for your GitHub repository</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-10">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              flex items-center gap-2 px-4 py-2 rounded-xl
              ${step.completed
                ? "bg-purple-500/10 text-purple-400"
                : step.id === currentStep
                  ? "bg-zinc-800 text-white"
                  : "bg-zinc-900/50 text-zinc-500"
              }
            `}>
              {step.completed ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <span className="w-5 h-5 flex items-center justify-center text-xs rounded-full bg-zinc-700">
                  {index + 1}
                </span>
              )}
              <span className="text-sm font-medium">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-zinc-600 mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
        {/* Step 1: Select Repository */}
        {currentStep === "select-repo" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Select Repository</h2>
              <p className="text-zinc-400">
                Choose a GitHub repository you own to mint equity tokens for.
              </p>
            </div>
            <RepoSelector onSelect={handleRepoSelect} selectedRepo={selectedRepo} />
          </div>
        )}

        {/* Step 2: Verify Ownership */}
        {currentStep === "verify-owner" && selectedRepo && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Verify Ownership</h2>
              <p className="text-zinc-400">
                Confirm that you are the owner of this repository.
              </p>
            </div>

            {/* Selected Repo Card */}
            <div className="p-5 bg-zinc-800/50 border border-zinc-700 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-zinc-700">
                  <Github className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedRepo.name}</h3>
                  <p className="text-sm text-zinc-400">{selectedRepo.full_name}</p>
                </div>
              </div>
              {selectedRepo.description && (
                <p className="mt-4 text-sm text-zinc-500">{selectedRepo.description}</p>
              )}
            </div>

            {/* Ownership Info */}
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-300">Owner-Only Minting</p>
                  <p className="text-sm text-zinc-400 mt-1">
                    Only the repository owner can mint equity tokens. This ensures proper ownership verification.
                  </p>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentStep("select-repo")}
                className="px-6 py-3 text-zinc-400 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleVerifyOwnership}
                disabled={isVerifying}
                className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Verify & Continue
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Mint Tokens */}
        {currentStep === "mint-tokens" && selectedRepo && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Mint Equity Tokens</h2>
              <p className="text-zinc-400">
                Mint 1,000,000 equity tokens for <span className="text-white">{selectedRepo.full_name}</span>
              </p>
            </div>

            {/* Wallet Status */}
            <div className="p-5 bg-zinc-800/50 border border-zinc-700 rounded-2xl">
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
                    <div className={`w-2.5 h-2.5 rounded-full ${isOnSepolia ? 'bg-green-400' : 'bg-yellow-400'}`} />
                    <span className="text-sm text-zinc-400">
                      {isOnSepolia ? 'Sepolia' : 'Wrong Network'}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={connect}
                    disabled={isConnecting}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
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
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
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

            {/* Token Info */}
            <div className="p-5 rounded-2xl bg-purple-500/5 border border-purple-500/20">
              <h3 className="font-medium text-purple-300 mb-3">Token Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-500">Token Name</p>
                  <p className="text-white font-medium">{selectedRepo.name}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Symbol</p>
                  <p className="text-white font-medium">{selectedRepo.name.substring(0, 5).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Total Supply</p>
                  <p className="text-white font-medium">1,000,000</p>
                </div>
                <div>
                  <p className="text-zinc-500">Network</p>
                  <p className="text-white font-medium">Sepolia Testnet</p>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleMintTokens}
              disabled={isMinting || !isConnected || !isOnSepolia}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isMinting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Minting Tokens...
                </>
              ) : (
                <>
                  <Coins className="w-5 h-5" />
                  Mint 1,000,000 Equity Tokens
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 4: Complete */}
        {currentStep === "complete" && (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Tokens Minted Successfully!</h2>
            <p className="text-zinc-400 mb-6">
              You now have 1,000,000 equity tokens for {selectedRepo?.full_name}
            </p>
            {txHash.startsWith("0x") && (
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-purple-400 hover:underline mb-8"
              >
                View on Etherscan →
              </a>
            )}
            <p className="text-sm text-zinc-500">Redirecting to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}
