"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface TokenStatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  loading?: boolean;
  className?: string;
}

export function TokenStatsCard({
  icon: Icon,
  label,
  value,
  subtext,
  loading = false,
  className = "",
}: TokenStatsCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden
        bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6
        hover:border-zinc-700 transition-all duration-300
        ${className}
      `}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
      
      <div className="relative">
        <div className="flex items-center gap-2 text-zinc-400 mb-3">
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            {loading ? (
              <div className="h-9 w-24 bg-zinc-800 rounded-lg animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-white tracking-tight">
                {typeof value === "number" ? value.toLocaleString() : value}
              </p>
            )}
            {subtext && (
              <p className="text-sm text-zinc-500 mt-1">{subtext}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TokenStatsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}

export function TokenStatsGrid({ children, columns = 3 }: TokenStatsGridProps) {
  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid gap-4 ${gridCols[columns]}`}>
      {children}
    </div>
  );
}
