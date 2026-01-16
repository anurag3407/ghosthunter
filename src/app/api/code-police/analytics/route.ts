import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { fetchRepoStats } from "@/lib/agents/code-police/github";

/**
 * ============================================================================
 * CODE POLICE - ANALYTICS API
 * ============================================================================
 * GET /api/code-police/analytics?projectId=...
 * 
 * Returns comprehensive analytics for a project including:
 * - Issue trends over time
 * - Code health score
 * - Most problematic files
 * - Contributor statistics
 */

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

interface AnalyticsResponse {
    projectId: string;
    projectName: string;
    repoFullName: string;

    // Summary statistics
    totalAnalysisRuns: number;
    totalIssuesFound: number;
    totalIssuesFixed: number;
    codeHealthScore: number;

    // Issue breakdown
    issueCounts: {
        critical: number;
        high: number;
        medium: number;
        low: number;
        info: number;
    };

    // Trends over time (last 30 days)
    issueTrends: IssueCountsByTime[];

    // Most problematic files
    topProblematicFiles: FileStats[];

    // Category breakdown
    issuesByCategory: Record<string, number>;

    // Time range
    firstAnalysis?: string;
    lastAnalysis?: string;
}

export async function GET(request: NextRequest) {
    try {
        const authResult = await auth();
        const userId = authResult?.userId;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const projectId = request.nextUrl.searchParams.get("projectId");
        if (!projectId) {
            return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
        }

        const adminDb = getAdminDb();
        if (!adminDb) {
            return NextResponse.json({ error: "Database not configured" }, { status: 503 });
        }

        // Get project
        const projectDoc = await adminDb.collection("projects").doc(projectId).get();
        if (!projectDoc.exists) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const project = projectDoc.data();
        if (project?.userId !== userId) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // Get all analysis runs for this project
        const runsSnapshot = await adminDb
            .collection("analysis_runs")
            .where("projectId", "==", projectId)
            .orderBy("createdAt", "desc")
            .limit(100)
            .get();

        const runs = runsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                issueCounts: data.issueCounts as { critical: number; high: number; medium: number; low: number; info: number } | undefined,
                autoFixPrUrl: data.autoFixPrUrl as string | undefined,
                autoFixesGenerated: data.autoFixesGenerated as number | undefined,
                createdAt: data.createdAt?.toDate?.() || new Date()
            };
        });

        // Aggregate issue counts
        let totalCritical = 0;
        let totalHigh = 0;
        let totalMedium = 0;
        let totalLow = 0;
        let totalInfo = 0;
        let totalIssuesFixed = 0;

        const issueTrendMap = new Map<string, IssueCountsByTime>();
        const fileStatsMap = new Map<string, FileStats>();
        const categoryCount: Record<string, number> = {};

        for (const run of runs) {
            const counts = run.issueCounts || { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
            totalCritical += counts.critical || 0;
            totalHigh += counts.high || 0;
            totalMedium += counts.medium || 0;
            totalLow += counts.low || 0;
            totalInfo += counts.info || 0;

            if (run.autoFixPrUrl) {
                totalIssuesFixed += run.autoFixesGenerated || 0;
            }

            // Add to daily trend
            const dateKey = run.createdAt.toISOString().split("T")[0];
            if (!issueTrendMap.has(dateKey)) {
                issueTrendMap.set(dateKey, {
                    date: dateKey,
                    critical: 0,
                    high: 0,
                    medium: 0,
                    low: 0,
                    info: 0,
                    total: 0
                });
            }
            const dayStats = issueTrendMap.get(dateKey)!;
            dayStats.critical += counts.critical || 0;
            dayStats.high += counts.high || 0;
            dayStats.medium += counts.medium || 0;
            dayStats.low += counts.low || 0;
            dayStats.info += counts.info || 0;
            dayStats.total += (counts.critical || 0) + (counts.high || 0) +
                (counts.medium || 0) + (counts.low || 0) + (counts.info || 0);

            // Fetch issues for this run to get file-level and category stats
            try {
                const issuesSnapshot = await adminDb
                    .collection("analysis_runs")
                    .doc(run.id)
                    .collection("issues")
                    .get();

                for (const issueDoc of issuesSnapshot.docs) {
                    const issue = issueDoc.data();

                    // Track file stats
                    const filePath = issue.filePath || "unknown";
                    if (!fileStatsMap.has(filePath)) {
                        fileStatsMap.set(filePath, {
                            filePath,
                            issueCount: 0,
                            criticalCount: 0,
                            highCount: 0,
                            categories: []
                        });
                    }
                    const fileStats = fileStatsMap.get(filePath)!;
                    fileStats.issueCount++;
                    if (issue.severity === "critical") fileStats.criticalCount++;
                    if (issue.severity === "high") fileStats.highCount++;
                    if (issue.category && !fileStats.categories.includes(issue.category)) {
                        fileStats.categories.push(issue.category);
                    }

                    // Track category
                    const category = issue.category || "other";
                    categoryCount[category] = (categoryCount[category] || 0) + 1;
                }
            } catch {
                // Skip if issues subcollection doesn't exist
            }
        }

        const totalIssues = totalCritical + totalHigh + totalMedium + totalLow + totalInfo;

        // Calculate code health score (0-100)
        // Higher score = healthier code (fewer critical/high issues)
        let codeHealthScore = 100;
        if (totalIssues > 0) {
            // Weighted score: critical = 25 points, high = 10 points, medium = 3 points, low = 1 point
            const weightedIssues = (totalCritical * 25) + (totalHigh * 10) + (totalMedium * 3) + totalLow;
            const maxPenalty = 80; // Max penalty is 80 points
            const penalty = Math.min(maxPenalty, weightedIssues);
            codeHealthScore = Math.max(20, 100 - penalty); // Minimum score is 20
        }

        // Sort file stats by issue count
        const topProblematicFiles = Array.from(fileStatsMap.values())
            .sort((a, b) => {
                // Sort by critical first, then high, then total
                if (b.criticalCount !== a.criticalCount) return b.criticalCount - a.criticalCount;
                if (b.highCount !== a.highCount) return b.highCount - a.highCount;
                return b.issueCount - a.issueCount;
            })
            .slice(0, 10);

        // Sort trends by date
        const issueTrends = Array.from(issueTrendMap.values())
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-30); // Last 30 days

        const response: AnalyticsResponse = {
            projectId,
            projectName: project?.name || "Unknown",
            repoFullName: project?.githubFullName || "",

            totalAnalysisRuns: runs.length,
            totalIssuesFound: totalIssues,
            totalIssuesFixed,
            codeHealthScore: Math.round(codeHealthScore),

            issueCounts: {
                critical: totalCritical,
                high: totalHigh,
                medium: totalMedium,
                low: totalLow,
                info: totalInfo
            },

            issueTrends,
            topProblematicFiles,
            issuesByCategory: categoryCount,

            firstAnalysis: runs.length > 0 ? runs[runs.length - 1].createdAt.toISOString() : undefined,
            lastAnalysis: runs.length > 0 ? runs[0].createdAt.toISOString() : undefined
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error("[Analytics API] Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch analytics" },
            { status: 500 }
        );
    }
}
