"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Presentation,
  ArrowLeft,
  Github,
  Loader2,
  ChevronRight,
  Search,
  Star,
  Check,
  Sparkles,
  AlertCircle,
  FileText,
} from "lucide-react";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export default function NewPitchDeckPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // Step 1: Repo selection
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [isLoadingRepos, setIsLoadingRepos] = useState(true);
  const [githubConnected, setGithubConnected] = useState(false);
  
  // Step 2: README preview
  const [readme, setReadme] = useState("");
  const [isLoadingReadme, setIsLoadingReadme] = useState(false);
  
  // Step 3: Generation
  const [instructions, setInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  // Fetch repositories
  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch("/api/github/repos");
        const data = await response.json();
        
        if (response.ok) {
          setRepos(data.repos || []);
          setFilteredRepos(data.repos || []);
          setGithubConnected(data.connected);
        } else {
          setGithubConnected(false);
        }
      } catch (err) {
        console.error("Error fetching repos:", err);
      } finally {
        setIsLoadingRepos(false);
      }
    };

    fetchRepos();
  }, []);

  // Filter repos
  useEffect(() => {
    const filtered = repos.filter(
      (repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRepos(filtered);
  }, [searchQuery, repos]);

  // Fetch README when repo is selected
  const handleSelectRepo = async (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setIsLoadingReadme(true);
    setError("");

    try {
      const response = await fetch(
        `/api/pitch-deck/github/readme?owner=${repo.owner.login}&repo=${repo.name}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch README");
      }

      setReadme(data.content);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch README");
    } finally {
      setIsLoadingReadme(false);
    }
  };

  // Generate pitch deck
  const handleGenerate = async () => {
    if (!selectedRepo || !readme) return;

    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/pitch-deck/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          readme,
          instructions,
          repoUrl: `https://github.com/${selectedRepo.full_name}`,
          repoName: selectedRepo.name,
          repoOwner: selectedRepo.owner.login,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate");
      }

      router.push(`/dashboard/pitch-deck/${data.deckId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/pitch-deck"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pitch Decks
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Presentation className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Generate Pitch Deck</h1>
            <p className="text-zinc-400">Create a pitch deck from your GitHub README</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        {[
          { num: 1, label: "Select Repository" },
          { num: 2, label: "Preview README" },
          { num: 3, label: "Generate" },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s.num
                  ? "bg-blue-500 text-white"
                  : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {step > s.num ? <Check className="w-4 h-4" /> : s.num}
            </div>
            <span className={step >= s.num ? "text-white" : "text-zinc-500"}>
              {s.label}
            </span>
            {i < 2 && <ChevronRight className="w-4 h-4 text-zinc-600" />}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Step 1: Select Repository */}
      {step === 1 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          {!githubConnected ? (
            <div className="text-center py-12">
              <Github className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Connect GitHub</h2>
              <p className="text-zinc-400 mb-6">
                Connect your GitHub account to access your repositories.
              </p>
              <a
                href="/dashboard/settings"
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
              >
                <Github className="w-5 h-5" />
                Connect GitHub
              </a>
            </div>
          ) : (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search repositories..."
                  className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {isLoadingRepos ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
              ) : filteredRepos.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  {repos.length === 0 ? "No repositories found" : "No matching repositories"}
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredRepos.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => handleSelectRepo(repo)}
                      disabled={isLoadingReadme}
                      className={`w-full p-4 rounded-xl border transition-all text-left ${
                        selectedRepo?.id === repo.id
                          ? "bg-blue-500/10 border-blue-500/30"
                          : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Github className="w-5 h-5 text-zinc-400" />
                          <div>
                            <p className="font-medium text-white">{repo.name}</p>
                            <p className="text-sm text-zinc-500">{repo.owner.login}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {repo.language && (
                            <span className="text-xs text-zinc-400 px-2 py-1 bg-zinc-800 rounded-full">
                              {repo.language}
                            </span>
                          )}
                          {repo.stargazers_count > 0 && (
                            <span className="flex items-center gap-1 text-sm text-yellow-400">
                              <Star className="w-4 h-4" />
                              {repo.stargazers_count}
                            </span>
                          )}
                          {isLoadingReadme && selectedRepo?.id === repo.id ? (
                            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-zinc-600" />
                          )}
                        </div>
                      </div>
                      {repo.description && (
                        <p className="text-sm text-zinc-400 mt-2 line-clamp-1">{repo.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Step 2: README Preview */}
      {step === 2 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-zinc-400" />
              <h2 className="font-semibold text-white">README.md</h2>
              <span className="text-sm text-zinc-500">from {selectedRepo?.full_name}</span>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-sm text-zinc-400 hover:text-white"
            >
              Change repo
            </button>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 max-h-[300px] overflow-y-auto mb-6">
            <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono">{readme}</pre>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Generate */}
      {step === 3 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Additional Instructions (optional)
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="E.g., Focus on the B2B market, highlight the AI features, use a professional tone..."
              rows={4}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Pitch Deck
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
