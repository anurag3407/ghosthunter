"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  GitCommit,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileCode,
  ChevronDown,
  ChevronUp,
  Settings,
  RefreshCw,
  Loader2,
  Play,
  Pause,
  Square,
} from "lucide-react";

import { ProjectSettings } from "@/components/code-police/ProjectSettings";

/**
 * ============================================================================
 * CODE POLICE - PROJECT DETAIL PAGE
 * ============================================================================
 * Shows project analysis history with real Firestore data.
 */

interface Project {
  id: string;
  name: string;
  githubFullName: string;
  githubOwner?: string;
  githubRepoName?: string;
  language: string | null;
  defaultBranch: string;
  status: 'active' | 'paused' | 'stopped';
  customRules: string[];
  ownerEmail?: string;
  notificationPrefs?: {
    emailOnPush?: boolean;
    emailOnPR?: boolean;
    minSeverity?: string;
    additionalEmails?: string[];
  };
}

interface AnalysisRun {
  id: string;
  projectId: string;
  commitSha: string;
  branch: string;
  status: string;
  triggerType: 'push' | 'pull_request';
  prNumber?: number;
  author?: { name: string; email?: string; avatar?: string };
  issueCounts: { critical: number; high: number; medium: number; low: number; info: number };
  summary?: string;
  createdAt: string;
  completedAt?: string;
}

interface CodeIssue {
  id: string;
  filePath: string;
  line: number;
  endLine?: number;
  severity: string;
  category: string;
  message: string;
  explanation: string;
  suggestedFix?: string;
  codeSnippet?: string;
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<Project | null>(null);
  const [runs, setRuns] = useState<AnalysisRun[]>([]);
  const [issues, setIssues] = useState<Record<string, CodeIssue[]>>({});
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState("");

  // Fetch project and analysis runs
  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      // Fetch project
      const projectRes = await fetch(`/api/code-police/projects/${projectId}`);
      const projectData = await projectRes.json();
      
      if (!projectRes.ok) {
        throw new Error(projectData.error || "Failed to fetch project");
      }
      
      setProject(projectData.project);

      // Fetch analysis runs
      const runsRes = await fetch(`/api/code-police/analyze?projectId=${projectId}&limit=20`);
      const runsData = await runsRes.json();
      
      if (runsRes.ok && runsData.runs) {
        setRuns(runsData.runs);
        // Expand first run by default
        if (runsData.runs.length > 0 && !expandedRun) {
          setExpandedRun(runsData.runs[0].id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  // Update project settings
  const handleUpdateProject = async (updates: Partial<Project>) => {
    const res = await fetch(`/api/code-police/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || "Failed to update project");
    }

    setProject(data.project);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "high":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "medium":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "high":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "low":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  const getStatusIcon = (status: 'active' | 'paused' | 'stopped') => {
    switch (status) {
      case 'active':
        return <Play className="w-3 h-3" />;
      case 'paused':
        return <Pause className="w-3 h-3" />;
      case 'stopped':
        return <Square className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: 'active' | 'paused' | 'stopped') => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/10';
      case 'paused':
        return 'text-yellow-400 bg-yellow-500/10';
      case 'stopped':
        return 'text-red-400 bg-red-500/10';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Project</h2>
          <p className="text-zinc-400">{error || "Project not found"}</p>
          <Link
            href="/dashboard/code-police"
            className="inline-flex items-center gap-2 mt-4 text-red-400 hover:text-red-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Code Police
          </Link>
        </div>
      </div>
    );
  }

  const latestRun = runs[0];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/code-police"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Code Police
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {getStatusIcon(project.status)}
                  {project.status}
                </span>
              </div>
              <p className="text-zinc-400">{project.githubFullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-zinc-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              <Settings className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Custom Rules Display */}
        {project.customRules && project.customRules.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.customRules.slice(0, 3).map((rule, i) => (
              <span key={i} className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-lg">
                {rule}
              </span>
            ))}
            {project.customRules.length > 3 && (
              <span className="px-2 py-1 bg-zinc-800 text-zinc-500 text-xs rounded-lg">
                +{project.customRules.length - 3} more rules
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      {latestRun && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {(["critical", "high", "medium", "low", "info"] as const).map((severity) => (
            <div
              key={severity}
              className={`p-4 rounded-xl border ${getSeverityColor(severity)}`}
            >
              <p className="text-2xl font-bold">
                {latestRun.issueCounts[severity] || 0}
              </p>
              <p className="text-sm capitalize">{severity}</p>
            </div>
          ))}
        </div>
      )}

      {/* Analysis Runs */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Analysis History</h2>
        
        {runs.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center">
            <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Analysis Runs Yet</h3>
            <p className="text-zinc-400">
              Push code to your repository to trigger the first analysis.
            </p>
          </div>
        ) : (
          runs.map((run) => (
            <div
              key={run.id}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden"
            >
              {/* Run Header */}
              <button
                onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <GitCommit className="w-5 h-5 text-zinc-500" />
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-white">{run.commitSha.slice(0, 7)}</code>
                      <span className="text-sm text-zinc-500">on {run.branch}</span>
                      {run.triggerType === 'pull_request' && (
                        <span className="px-2 py-0.5 text-xs bg-purple-500/10 text-purple-400 rounded-full">
                          PR #{run.prNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400">{run.author?.name || 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-zinc-500">
                    <Clock className="w-4 h-4" />
                    {formatDate(run.createdAt)}
                  </div>
                  <div className="flex items-center gap-2">
                    {run.issueCounts.critical > 0 && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-500/10 text-red-400 rounded-full">
                        {run.issueCounts.critical} critical
                      </span>
                    )}
                    {run.issueCounts.high > 0 && (
                      <span className="px-2 py-1 text-xs font-medium bg-orange-500/10 text-orange-400 rounded-full">
                        {run.issueCounts.high} high
                      </span>
                    )}
                  </div>
                  {expandedRun === run.id ? (
                    <ChevronUp className="w-5 h-5 text-zinc-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-zinc-500" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {expandedRun === run.id && (
                <div className="border-t border-zinc-800 p-4 space-y-4">
                  {run.summary && (
                    <p className="text-sm text-zinc-400">{run.summary}</p>
                  )}
                  
                  {/* Status indicator */}
                  <div className="flex items-center gap-2">
                    {run.status === 'completed' && (
                      <span className="flex items-center gap-1 text-sm text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed
                      </span>
                    )}
                    {run.status === 'running' && (
                      <span className="flex items-center gap-1 text-sm text-yellow-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Running...
                      </span>
                    )}
                    {run.status === 'failed' && (
                      <span className="flex items-center gap-1 text-sm text-red-400">
                        <XCircle className="w-4 h-4" />
                        Failed
                      </span>
                    )}
                  </div>

                  {/* Issues would be loaded here - for now showing counts */}
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(run.issueCounts).map(([severity, count]) => (
                      <div key={severity} className={`p-2 rounded-lg text-center ${getSeverityColor(severity)}`}>
                        <p className="text-lg font-bold">{count}</p>
                        <p className="text-xs capitalize">{severity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && project && (
        <ProjectSettings
          project={{
            id: project.id,
            status: project.status,
            customRules: project.customRules || [],
            ownerEmail: project.ownerEmail,
            notificationPrefs: project.notificationPrefs,
          }}
          onUpdate={handleUpdateProject}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
