"use client";

import { useState, useEffect } from "react";
import { Search, Check, AlertCircle, Lock, Github, Loader2 } from "lucide-react";
import { GhostfounderLoader } from "@/components/ui/ghostfounder-loader";

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

interface RepoSelectorProps {
  onSelect: (repo: Repository) => void;
  selectedRepo: Repository | null;
}

export function RepoSelector({ onSelect, selectedRepo }: RepoSelectorProps) {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [mintedRepos, setMintedRepos] = useState<Set<number>>(new Set());
  const [checkingMinted, setCheckingMinted] = useState<number | null>(null);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch("/api/github/repos");
        const data = await response.json();

        if (data.connected && data.repos) {
          // Filter to only show repos where user is owner
          const ownedRepos = data.repos.filter(
            (repo: Repository) => repo.owner.login === data.repos[0]?.owner?.login
          );
          setRepos(ownedRepos);
        } else {
          setError(data.message || "GitHub not connected");
        }
      } catch (err) {
        setError("Failed to fetch repositories");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepos();
  }, []);

  const checkIfMinted = async (repoId: number) => {
    setCheckingMinted(repoId);
    try {
      const response = await fetch(`/api/equity/check-minted?repoId=${repoId}`);
      const data = await response.json();
      if (data.minted) {
        setMintedRepos((prev) => new Set([...prev, repoId]));
      }
      return data.minted;
    } catch (err) {
      console.error("Failed to check minted status:", err);
      return false;
    } finally {
      setCheckingMinted(null);
    }
  };

  const handleSelect = async (repo: Repository) => {
    if (mintedRepos.has(repo.id)) return;

    const isMinted = await checkIfMinted(repo.id);
    if (!isMinted) {
      onSelect(repo);
    }
  };

  const filteredRepos = repos.filter(
    (repo) =>
      repo.name.toLowerCase().includes(search.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <GhostfounderLoader size="md" text="Loading repositories..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-center">
        <AlertCircle className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
        <p className="text-zinc-300 mb-4">{error}</p>
        <a
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors"
        >
          <Github className="w-4 h-4" />
          Connect GitHub
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your repositories..."
          className="w-full pl-11 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Repository List */}
      <div className="max-h-80 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-zinc-700">
        {filteredRepos.length === 0 ? (
          <p className="text-center text-zinc-500 py-8">No repositories found</p>
        ) : (
          filteredRepos.map((repo) => {
            const isMinted = mintedRepos.has(repo.id);
            const isSelected = selectedRepo?.id === repo.id;
            const isChecking = checkingMinted === repo.id;

            return (
              <button
                key={repo.id}
                onClick={() => handleSelect(repo)}
                disabled={isMinted || isChecking}
                className={`
                  w-full p-4 rounded-xl border transition-all text-left
                  ${isSelected
                    ? "bg-purple-500/10 border-purple-500"
                    : isMinted
                      ? "bg-zinc-900/30 border-zinc-800 opacity-60 cursor-not-allowed"
                      : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-600"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-800">
                      <Github className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{repo.name}</span>
                        {repo.private && (
                          <Lock className="w-3 h-3 text-zinc-500" />
                        )}
                      </div>
                      <p className="text-sm text-zinc-500">{repo.owner.login}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {repo.language && (
                      <span className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-400">
                        {repo.language}
                      </span>
                    )}
                    {isChecking ? (
                      <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                    ) : isMinted ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400">
                        Already Minted
                      </span>
                    ) : isSelected ? (
                      <div className="p-1 rounded-full bg-purple-500">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : null}
                  </div>
                </div>
                {repo.description && (
                  <p className="mt-2 text-sm text-zinc-500 line-clamp-1">
                    {repo.description}
                  </p>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
