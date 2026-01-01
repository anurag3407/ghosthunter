"use client";

import { useState } from "react";
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
} from "lucide-react";

// Mock data for demonstration
const mockProject = {
  id: "1",
  name: "ghostfounder",
  githubFullName: "user/ghostfounder",
  language: "TypeScript",
  defaultBranch: "main",
  isActive: true,
};

const mockRuns = [
  {
    id: "run1",
    commitSha: "abc1234",
    branch: "main",
    status: "completed",
    author: { name: "John Doe", email: "john@example.com" },
    issueCounts: { critical: 1, high: 2, medium: 5, low: 3, info: 2 },
    createdAt: "2 hours ago",
    summary: "Found 13 issues across 8 files. 1 critical security vulnerability detected.",
  },
  {
    id: "run2",
    commitSha: "def5678",
    branch: "feature/auth",
    status: "completed",
    author: { name: "Jane Smith", email: "jane@example.com" },
    issueCounts: { critical: 0, high: 1, medium: 3, low: 2, info: 5 },
    createdAt: "Yesterday",
    summary: "Minor code style issues. No critical problems found.",
  },
];

const mockIssues = [
  {
    id: "issue1",
    filePath: "src/lib/auth.ts",
    line: 45,
    severity: "critical",
    category: "security",
    message: "Potential SQL injection vulnerability",
    explanation: "User input is directly concatenated into SQL query without sanitization.",
    suggestedFix: "Use parameterized queries or an ORM to prevent SQL injection.",
  },
  {
    id: "issue2",
    filePath: "src/components/Form.tsx",
    line: 23,
    severity: "high",
    category: "performance",
    message: "Unnecessary re-renders detected",
    explanation: "Component re-renders on every parent update due to missing useMemo/useCallback.",
    suggestedFix: "Wrap the expensive computation in useMemo() hook.",
  },
];

export default function ProjectDetailPage() {
  const [expandedRun, setExpandedRun] = useState<string | null>("run1");

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
      default:
        return "bg-green-500/10 text-green-400 border-green-500/20";
    }
  };

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
              <h1 className="text-2xl font-bold text-white">{mockProject.name}</h1>
              <p className="text-zinc-400">{mockProject.githubFullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors">
              <RefreshCw className="w-5 h-5 text-zinc-400" />
            </button>
            <button className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors">
              <Settings className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {["critical", "high", "medium", "low", "info"].map((severity) => (
          <div
            key={severity}
            className={`p-4 rounded-xl border ${getSeverityColor(severity)}`}
          >
            <p className="text-2xl font-bold">
              {mockRuns[0].issueCounts[severity as keyof typeof mockRuns[0]["issueCounts"]]}
            </p>
            <p className="text-sm capitalize">{severity}</p>
          </div>
        ))}
      </div>

      {/* Analysis Runs */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Analysis History</h2>
        {mockRuns.map((run) => (
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
                    <code className="text-sm font-mono text-white">{run.commitSha}</code>
                    <span className="text-sm text-zinc-500">on {run.branch}</span>
                  </div>
                  <p className="text-sm text-zinc-400">{run.author.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-sm text-zinc-500">
                  <Clock className="w-4 h-4" />
                  {run.createdAt}
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
                <p className="text-sm text-zinc-400">{run.summary}</p>
                
                {/* Issues List */}
                <div className="space-y-3">
                  {mockIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700"
                    >
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(issue.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityColor(issue.severity)}`}>
                              {issue.severity}
                            </span>
                            <span className="text-xs text-zinc-500">{issue.category}</span>
                          </div>
                          <p className="font-medium text-white mb-1">{issue.message}</p>
                          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
                            <FileCode className="w-4 h-4" />
                            <span>{issue.filePath}:{issue.line}</span>
                          </div>
                          <p className="text-sm text-zinc-400 mb-2">{issue.explanation}</p>
                          <div className="p-2 bg-green-500/5 border border-green-500/20 rounded-lg">
                            <p className="text-sm text-green-400">
                              <strong>Suggested fix:</strong> {issue.suggestedFix}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
