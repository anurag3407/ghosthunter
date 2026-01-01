import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  analyzeCode,
  detectLanguage,
  generateAnalysisSummary,
} from "@/lib/agents/code-police/analyzer";
import { sendAnalysisReport } from "@/lib/agents/code-police/email";
import { fetchCommit, fetchFileContent } from "@/lib/agents/code-police/github";
import type { CodeIssue, AnalysisRun, IssueSeverity } from "@/types";
import type { DocumentData, QueryDocumentSnapshot, Firestore } from "firebase-admin/firestore";

/**
 * ============================================================================
 * CODE POLICE - ANALYZE ENDPOINT
 * ============================================================================
 * POST /api/code-police/analyze
 *
 * Analyzes code from a GitHub repository and optionally sends email report.
 */

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      projectId,
      owner,
      repo,
      commitSha,
      sendEmail = false,
      recipientEmail,
    } = body;

    if (!projectId || !owner || !repo) {
      return NextResponse.json(
        { error: "Missing required fields: projectId, owner, repo" },
        { status: 400 }
      );
    }

    // Get Firestore instance
    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    // Get user's GitHub token from Firestore
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const userData = userDoc.data();
    const githubToken = userData?.githubAccessToken;

    if (!githubToken) {
      return NextResponse.json(
        {
          error: "GitHub token not configured. Please connect GitHub in settings.",
        },
        { status: 400 }
      );
    }

    // Create analysis run record
    const analysisRef = adminDb.collection("analysis_runs").doc();
    const now = new Date();

    const analysisRun: Partial<AnalysisRun> = {
      id: analysisRef.id,
      userId,
      projectId,
      commitSha: commitSha || "latest",
      branch: "main",
      triggerType: "push",
      status: "running",
      issueCounts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
    };

    await analysisRef.set({
      ...analysisRun,
      createdAt: now,
    });

    // Fetch commit details
    const commit = await fetchCommit(githubToken, owner, repo, commitSha);

    // Analyze changed files from commit
    const allIssues: Omit<CodeIssue, "id" | "analysisRunId" | "projectId" | "isMuted">[] = [];

    for (const file of commit.files) {
      if (file.status === "removed") continue;

      // Get file content
      const content = await fetchFileContent(
        githubToken,
        owner,
        repo,
        file.filename,
        commitSha
      );

      const language = detectLanguage(file.filename);

      // Analyze the file
      const issues = await analyzeCode({
        code: content,
        filePath: file.filename,
        language,
        commitMessage: commit.commit.message,
      });

      allIssues.push(...issues);
    }

    // Calculate issue counts
    const issueCounts: Record<IssueSeverity, number> = {
      critical: allIssues.filter((i) => i.severity === "critical").length,
      high: allIssues.filter((i) => i.severity === "high").length,
      medium: allIssues.filter((i) => i.severity === "medium").length,
      low: allIssues.filter((i) => i.severity === "low").length,
      info: allIssues.filter((i) => i.severity === "info").length,
    };

    // Store issues in Firestore
    const fullIssues: CodeIssue[] = allIssues.map((issue, idx) => ({
      ...issue,
      id: `${analysisRef.id}-${idx}`,
      analysisRunId: analysisRef.id,
      projectId,
      isMuted: false,
    }));

    // Add issues to subcollection
    const batch = adminDb.batch();
    for (const issue of fullIssues) {
      const issueRef = analysisRef.collection("issues").doc(issue.id);
      batch.set(issueRef, issue);
    }

    // Generate summary
    const summary = await generateAnalysisSummary({
      repoName: `${owner}/${repo}`,
      commitSha,
      branch: "main",
      issues: fullIssues,
    });

    // Update analysis run with results
    batch.update(analysisRef, {
      status: "completed",
      completedAt: new Date(),
      issueCounts,
      summary,
      author: {
        name: commit.commit.author.name,
        email: commit.commit.author.email,
      },
    });

    await batch.commit();

    // Send email if requested
    if (sendEmail && recipientEmail) {
      try {
        await sendAnalysisReport({
          to: recipientEmail,
          run: {
            ...analysisRun,
            issueCounts,
            author: {
              name: commit.commit.author.name,
              email: commit.commit.author.email,
            },
          } as AnalysisRun,
          issues: fullIssues,
          summary,
          repoName: `${owner}/${repo}`,
          commitUrl: `https://github.com/${owner}/${repo}/commit/${commitSha}`,
        });

        await analysisRef.update({ emailStatus: "sent" });
      } catch (error) {
        console.error("Failed to send email report:", error);
        await analysisRef.update({ emailStatus: "failed" });
      }
    }

    // Update project last analyzed timestamp
    await adminDb.collection("projects").doc(projectId).update({
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      analysisId: analysisRef.id,
      summary: issueCounts,
      issueCount: fullIssues.length,
      report: summary,
    });
  } catch (error) {
    console.error("Code analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze code" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/code-police/analyze
 *
 * Fetches analysis history for a project.
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing projectId parameter" },
        { status: 400 }
      );
    }

    // Get Firestore instance
    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    // Fetch analysis runs for project
    const runsSnapshot = await adminDb
      .collection("analysis_runs")
      .where("projectId", "==", projectId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const runs = runsSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      completedAt: doc.data().completedAt?.toDate?.() || doc.data().completedAt,
    }));

    return NextResponse.json({ runs });
  } catch (error) {
    console.error("Fetch analysis history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis history" },
      { status: 500 }
    );
  }
}
