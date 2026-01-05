"use client";

import { ArrowUpRight, ArrowDownLeft, Coins, ExternalLink } from "lucide-react";

interface TransactionRowProps {
  type: "mint" | "transfer";
  from: string;
  to: string;
  amount: string;
  percentage?: number | null;
  txHash: string;
  timestamp: string;
  projectName?: string;
  currentWallet?: string;
}

export function TransactionRow({
  type,
  from,
  to,
  amount,
  percentage,
  txHash,
  timestamp,
  projectName,
  currentWallet,
}: TransactionRowProps) {
  const isMint = type === "mint";
  const isReceived = currentWallet && to.toLowerCase() === currentWallet.toLowerCase();
  const isSent = currentWallet && from.toLowerCase() === currentWallet.toLowerCase();

  const formatAddress = (addr: string) => {
    if (addr === "0x0000000000000000000000000000000000000000") return "Mint";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-xl hover:border-zinc-700/50 transition-colors">
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div
          className={`
            p-2.5 rounded-xl
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
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">
              {isMint
                ? "Minted Tokens"
                : isReceived
                ? "Received"
                : "Transferred"}
            </span>
            {projectName && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                {projectName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500 mt-0.5">
            {!isMint && (
              <>
                <span>{formatAddress(from)}</span>
                <span>→</span>
                <span>{formatAddress(to)}</span>
              </>
            )}
            {isMint && <span>Initial supply minted</span>}
          </div>
        </div>
      </div>

      {/* Amount and time */}
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p
            className={`font-semibold ${
              isReceived ? "text-green-400" : isSent ? "text-orange-400" : "text-white"
            }`}
          >
            {isReceived ? "+" : isSent ? "-" : ""}
            {parseInt(amount).toLocaleString()}
          </p>
          {percentage && (
            <p className="text-xs text-zinc-500">{percentage}%</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500 min-w-[60px] text-right">
            {formatTime(timestamp)}
          </span>
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-zinc-500 hover:text-purple-400 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

interface TransactionListProps {
  transactions: TransactionRowProps[];
  emptyMessage?: string;
}

export function TransactionList({ transactions, emptyMessage = "No transactions yet" }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <Coins className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx, index) => (
        <TransactionRow key={tx.txHash || index} {...tx} />
      ))}
    </div>
  );
}
