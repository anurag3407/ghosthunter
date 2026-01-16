"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, RefreshCwIcon, GitBranchIcon, FileCodeIcon, TrendingUpIcon, AlertTriangleIcon, CheckCircleIcon } from "lucide-react";

interface IssueCountsByTime {
    date: string;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
}

interface FileStats {
    filePath: string;
    issueCount: number;
    criticalCount: number;
    highCount: number;
    categories: string[];
}

interface AnalyticsData {
    projectId: string;
    projectName: string;
    repoFullName: string;
    totalAnalysisRuns: number;
    totalIssuesFound: number;
    totalIssuesFixed: number;
    codeHealthScore: number;
    issueCounts: {
        critical: number;
        high: number;
        medium: number;
        low: number;
        info: number;
    };
    issueTrends: IssueCountsByTime[];
    topProblematicFiles: FileStats[];
    issuesByCategory: Record<string, number>;
    firstAnalysis?: string;
    lastAnalysis?: string;
}

function CodeHealthGauge({ score }: { score: number }) {
    const getColor = (score: number) => {
        if (score >= 80) return "#22c55e"; // Green
        if (score >= 60) return "#eab308"; // Yellow
        if (score >= 40) return "#f97316"; // Orange
        return "#ef4444"; // Red
    };

    const getLabel = (score: number) => {
        if (score >= 80) return "Excellent";
        if (score >= 60) return "Good";
        if (score >= 40) return "Fair";
        return "Needs Attention";
    };

    const circumference = 2 * Math.PI * 45;
    const progress = (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
                <svg className="transform -rotate-90 w-full h-full">
                    <circle
                        cx="64"
                        cy="64"
                        r="45"
                        stroke="#27272a"
                        strokeWidth="10"
                        fill="transparent"
                    />
                    <circle
                        cx="64"
                        cy="64"
                        r="45"
                        stroke={getColor(score)}
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - progress}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">{score}</span>
                </div>
            </div>
            <span className="mt-2 text-sm font-medium" style={{ color: getColor(score) }}>
                {getLabel(score)}
            </span>
        </div>
    );
}

function IssueBar({ label, count, color, maxCount }: { label: string; count: number; color: string; maxCount: number }) {
    const width = maxCount > 0 ? (count / maxCount) * 100 : 0;

    return (
        <div className="flex items-center gap-3">
            <div className="w-20 text-sm text-zinc-400 capitalize">{label}</div>
            <div className="flex-1 h-6 bg-zinc-800 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${width}%`, backgroundColor: color }}
                />
            </div>
            <div className="w-12 text-right text-sm font-medium text-white">{count}</div>
        </div>
    );
}

function TrendChart({ trends }: { trends: IssueCountsByTime[] }) {
    if (trends.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-zinc-500">
                No trend data available yet
            </div>
        );
    }

    const maxTotal = Math.max(...trends.map(t => t.total), 1);
    const height = 150;

    return (
        <div className="relative h-48">
            <div className="absolute inset-0 flex items-end gap-1">
                {trends.map((trend, i) => {
                    const barHeight = (trend.total / maxTotal) * height;
                    return (
                        <div key={trend.date} className="flex-1 flex flex-col items-center group">
                            <div
                                className="w-full bg-gradient-to-t from-violet-600 to-violet-400 rounded-t hover:from-violet-500 hover:to-violet-300 transition-colors cursor-pointer"
                                style={{ height: `${barHeight}px` }}
                                title={`${trend.date}: ${trend.total} issues`}
                            />
                            {i % 7 === 0 && (
                                <span className="text-[10px] text-zinc-500 mt-1 rotate-45 origin-left">
                                    {trend.date.slice(5)}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-zinc-500 -ml-8 w-8 text-right">
                <span>{maxTotal}</span>
                <span>{Math.round(maxTotal / 2)}</span>
                <span>0</span>
            </div>
        </div>
    );
}

export default function AnalyticsPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string; // Using 'id' to match existing route

    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAnalytics();
    }, [projectId]);

    async function fetchAnalytics() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/code-police/analytics?projectId=${projectId}`);
            if (!res.ok) {
                throw new Error("Failed to fetch analytics");
            }
            const data = await res.json();
            setAnalytics(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    async function handleAnalyzeRepo() {
        try {
            const res = await fetch(`/api/code-police/analyze-repo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId })
            });
            if (res.ok) {
                // Refresh analytics after analysis
                setTimeout(fetchAnalytics, 2000);
            }
        } catch (err) {
            console.error("Failed to trigger repo analysis:", err);
        }
    }

    const severityColors = {
        critical: "#dc2626",
        high: "#ea580c",
        medium: "#ca8a04",
        low: "#2563eb",
        info: "#6b7280"
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-zinc-400">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error || "Failed to load analytics"}</p>
                    <button
                        onClick={fetchAnalytics}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const maxIssueCount = Math.max(
        analytics.issueCounts.critical,
        analytics.issueCounts.high,
        analytics.issueCounts.medium,
        analytics.issueCounts.low,
        analytics.issueCounts.info,
        1
    );

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/dashboard/code-police/${projectId}`}
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{analytics.projectName} Analytics</h1>
                            <p className="text-zinc-400">{analytics.repoFullName}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchAnalytics}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                        >
                            <RefreshCwIcon className="w-4 h-4" />
                            Refresh
                        </button>
                        <button
                            onClick={handleAnalyzeRepo}
                            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg font-medium transition-colors"
                        >
                            <GitBranchIcon className="w-4 h-4" />
                            Analyze Full Repo
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-violet-500/20 rounded-lg">
                                <TrendingUpIcon className="w-5 h-5 text-violet-400" />
                            </div>
                            <span className="text-zinc-400">Analysis Runs</span>
                        </div>
                        <div className="text-3xl font-bold">{analytics.totalAnalysisRuns}</div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <AlertTriangleIcon className="w-5 h-5 text-red-400" />
                            </div>
                            <span className="text-zinc-400">Issues Found</span>
                        </div>
                        <div className="text-3xl font-bold">{analytics.totalIssuesFound}</div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                            </div>
                            <span className="text-zinc-400">Issues Fixed</span>
                        </div>
                        <div className="text-3xl font-bold">{analytics.totalIssuesFixed}</div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center">
                        <span className="text-zinc-400 text-sm mb-2">Code Health</span>
                        <CodeHealthGauge score={analytics.codeHealthScore} />
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Issue Breakdown */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-6">Issue Breakdown</h2>
                        <div className="space-y-4">
                            <IssueBar label="Critical" count={analytics.issueCounts.critical} color={severityColors.critical} maxCount={maxIssueCount} />
                            <IssueBar label="High" count={analytics.issueCounts.high} color={severityColors.high} maxCount={maxIssueCount} />
                            <IssueBar label="Medium" count={analytics.issueCounts.medium} color={severityColors.medium} maxCount={maxIssueCount} />
                            <IssueBar label="Low" count={analytics.issueCounts.low} color={severityColors.low} maxCount={maxIssueCount} />
                            <IssueBar label="Info" count={analytics.issueCounts.info} color={severityColors.info} maxCount={maxIssueCount} />
                        </div>
                    </div>

                    {/* Issue Trends */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-6">Issue Trends (Last 30 Days)</h2>
                        <TrendChart trends={analytics.issueTrends} />
                    </div>

                    {/* Top Problematic Files */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <FileCodeIcon className="w-5 h-5 text-orange-400" />
                            Top Problematic Files
                        </h2>
                        {analytics.topProblematicFiles.length === 0 ? (
                            <div className="text-zinc-500 text-center py-8">
                                No files with issues found
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {analytics.topProblematicFiles.slice(0, 5).map((file, i) => (
                                    <div key={file.filePath} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="text-zinc-500 text-sm w-5">#{i + 1}</span>
                                            <div>
                                                <div className="text-sm font-mono text-zinc-200 truncate max-w-[200px]">
                                                    {file.filePath.split("/").pop()}
                                                </div>
                                                <div className="text-xs text-zinc-500 truncate max-w-[200px]">
                                                    {file.filePath}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {file.criticalCount > 0 && (
                                                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                                                    {file.criticalCount} critical
                                                </span>
                                            )}
                                            {file.highCount > 0 && (
                                                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded">
                                                    {file.highCount} high
                                                </span>
                                            )}
                                            <span className="text-zinc-400 text-sm">{file.issueCount} total</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Issues by Category */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-6">Issues by Category</h2>
                        {Object.keys(analytics.issuesByCategory).length === 0 ? (
                            <div className="text-zinc-500 text-center py-8">
                                No category data available
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {Object.entries(analytics.issuesByCategory)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([category, count]) => (
                                        <div
                                            key={category}
                                            className="px-4 py-2 bg-zinc-800 rounded-lg border border-zinc-700"
                                        >
                                            <span className="text-zinc-400 capitalize">{category}</span>
                                            <span className="ml-2 font-bold text-white">{count}</span>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center text-sm text-zinc-500">
                    {analytics.firstAnalysis && analytics.lastAnalysis && (
                        <p>
                            Data from {new Date(analytics.firstAnalysis).toLocaleDateString()} to {new Date(analytics.lastAnalysis).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
