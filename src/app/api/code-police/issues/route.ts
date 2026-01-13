import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { generateFixes, applyMultipleFixes, type Fix } from "@/lib/agents/code-police/fix-generator";
import { createFixPullRequest } from "@/lib/agents/code-police/pr-creator";
import { fetchFileContent } from "@/lib/agents/code-police/github";
import { detectLanguage } from "@/lib/agents/code-police/analyzer";
import type { CodeIssue } from "@/types";

/**
 * ============================================================================
 * CODE POLICE - ISSUES API
 * ============================================================================
 * GET /api/code-police/issues?runId=xxx - Get issues for a specific analysis run
 * POST /api/code-police/issues - Generate fixes and create PR for issues
 */

// Helper to remove undefined values for Firestore
const sanitizeForFirestore = <T extends Record<string, unknown>>(obj: T): T => {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
            result[key] = value;
        }
    }
    return result as T;
};

export async function GET(request: NextRequest) {
    console.log("[Issues API] GET - Fetching issues");

    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const runId = searchParams.get("runId");

        if (!runId) {
            return NextResponse.json({ error: "Missing runId parameter" }, { status: 400 });
        }

        const adminDb = getAdminDb();
        if (!adminDb) {
            return NextResponse.json({ error: "Database not configured" }, { status: 503 });
        }

        // Fetch issues from subcollection
        const issuesSnapshot = await adminDb
            .collection("analysis_runs")
            .doc(runId)
            .collection("issues")
            .get();

        const issues = issuesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        console.log(`[Issues API] Found ${issues.length} issues for run ${runId}`);

        return NextResponse.json({ issues });
    } catch (error) {
        console.error("[Issues API] GET error:", error);
        return NextResponse.json({ error: "Failed to fetch issues" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    console.log("[Issues API] POST - Generating fixes and creating PR");

    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { projectId, runId, issueIds } = body;

        if (!projectId || !runId) {
            return NextResponse.json({ error: "Missing projectId or runId" }, { status: 400 });
        }

        const adminDb = getAdminDb();
        if (!adminDb) {
            return NextResponse.json({ error: "Database not configured" }, { status: 503 });
        }

        // Get project details
        const projectDoc = await adminDb.collection("projects").doc(projectId).get();
        if (!projectDoc.exists) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }
        const project = projectDoc.data();

        // Get analysis run
        const runDoc = await adminDb.collection("analysis_runs").doc(runId).get();
        if (!runDoc.exists) {
            return NextResponse.json({ error: "Analysis run not found" }, { status: 404 });
        }
        const run = runDoc.data();

        // Get GitHub token
        let githubToken: string | null = null;
        try {
            const clerkResponse = await fetch(
                `https://api.clerk.com/v1/users/${userId}/oauth_access_tokens/oauth_github`,
                {
                    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
                }
            );
            if (clerkResponse.ok) {
                const tokens = await clerkResponse.json();
                if (tokens?.[0]?.token) {
                    githubToken = tokens[0].token;
                }
            }
        } catch (e) {
            console.warn("[Issues API] Failed to get Clerk token:", e);
        }

        if (!githubToken) {
            const userDoc = await adminDb.collection("users").doc(userId).get();
            githubToken = userDoc.data()?.githubAccessToken || null;
        }

        if (!githubToken) {
            return NextResponse.json({ error: "GitHub token not found" }, { status: 400 });
        }

        // Fetch issues
        let issuesQuery = adminDb.collection("analysis_runs").doc(runId).collection("issues");
        const issuesSnapshot = await issuesQuery.get();
        let issues: CodeIssue[] = issuesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as CodeIssue[];

        // Filter to specific issues if provided
        if (issueIds && issueIds.length > 0) {
            issues = issues.filter(i => issueIds.includes(i.id));
        }

        if (issues.length === 0) {
            return NextResponse.json({ error: "No issues to fix" }, { status: 400 });
        }

        console.log(`[Issues API] Generating fixes for ${issues.length} issues`);

        const owner = project?.githubOwner;
        const repo = project?.githubRepoName;
        const commitSha = run?.commitSha;
        const branch = run?.branch || "main";

        if (!owner || !repo || !commitSha) {
            return NextResponse.json({ error: "Missing repository information" }, { status: 400 });
        }

        // Group issues by file
        const issuesByFile = new Map<string, CodeIssue[]>();
        for (const issue of issues) {
            const existing = issuesByFile.get(issue.filePath) || [];
            existing.push(issue);
            issuesByFile.set(issue.filePath, existing);
        }

        // Generate fixes for each file
        const allFixes: Fix[] = [];
        const fileChanges = new Map<string, string>();
        const errors: string[] = [];

        for (const [filePath, fileIssues] of issuesByFile.entries()) {
            console.log(`[Issues API] Generating fixes for ${filePath} (${fileIssues.length} issues)`);

            try {
                const fileContent = await fetchFileContent(githubToken, owner, repo, filePath, commitSha);
                const language = detectLanguage(filePath);

                const fixResult = await generateFixes({
                    fileContent,
                    filePath,
                    language,
                    issues: fileIssues,
                });

                allFixes.push(...fixResult.fixes);

                // Apply ALL fixes - the super generator ensures they're all safe to apply
                console.log(`[Issues API] Applying ${fixResult.fixes.length} fixes for ${filePath}`);
                if (fixResult.fixes.length > 0) {
                    const newContent = applyMultipleFixes(fileContent, fixResult.fixes);
                    if (newContent !== fileContent) {
                        fileChanges.set(filePath, newContent);
                        console.log(`[Issues API] ✅ File changes saved for ${filePath}`);
                    } else {
                        console.warn(`[Issues API] ⚠️ No changes after applying fixes to ${filePath}`);
                        errors.push(`${filePath}: Fixes generated but could not be applied to file`);
                    }
                }
            } catch (e) {
                console.warn(`[Issues API] Failed to process ${filePath}:`, e);
                errors.push(`${filePath}: ${e instanceof Error ? e.message : 'Failed to fetch file'}`);
            }
        }

        // Create PR if we have changes
        if (fileChanges.size > 0) {
            console.log(`[Issues API] Creating PR with ${fileChanges.size} file changes`);

            const prResult = await createFixPullRequest({
                accessToken: githubToken,
                owner,
                repo,
                baseBranch: branch,
                commitSha,
                fixes: allFixes,
                unfixableIssues: [], // Always empty now
                issues,
                fileChanges,
            });

            if (prResult.success) {
                // Update analysis run with PR info
                await adminDb.collection("analysis_runs").doc(runId).update(sanitizeForFirestore({
                    prNumber: prResult.prNumber,
                    prUrl: prResult.prUrl,
                    fixBranch: prResult.branchName,
                    fixesGenerated: allFixes.length,
                }));

                return NextResponse.json({
                    success: true,
                    prNumber: prResult.prNumber,
                    prUrl: prResult.prUrl,
                    fixesGenerated: allFixes.length,
                });
            } else {
                return NextResponse.json({ error: prResult.error || "Failed to create PR" }, { status: 500 });
            }
        } else {
            // No file changes - provide detailed error info
            console.log(`[Issues API] No changes applied. Fixes generated: ${allFixes.length}`);

            let message = "No fixes could be auto-applied. ";
            if (allFixes.length === 0) {
                message += "The AI could not generate any fixes for the identified issues. This might be because the issues require complex architectural changes.";
            } else {
                message += "Fixes were generated but could not be matched to the source code. This may happen if the code has changed since the analysis.";
            }

            return NextResponse.json({
                success: false,
                message,
                fixesGenerated: allFixes.length,
                errors: errors.slice(0, 5), // Include first 5 errors
            });
        }
    } catch (error) {
        console.error("[Issues API] POST error:", error);
        return NextResponse.json({
            error: "Failed to generate fixes",
            details: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}
