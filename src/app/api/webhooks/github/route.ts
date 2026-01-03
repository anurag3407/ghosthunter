import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  analyzeCode,
  detectLanguage,
  generateAnalysisSummary,
} from "@/lib/agents/code-police/analyzer";
import { sendAnalysisReport } from "@/lib/agents/code-police/email";
import { fetchCommit, fetchFileContent, postPRComment, formatPRComment, getDependentFiles } from "@/lib/agents/code-police/github";
import type { CodeIssue, IssueSeverity, ProjectStatus } from "@/types";

/**
 * ============================================================================
 * GITHUB WEBHOOK HANDLER
 * ============================================================================
 * POST /api/webhooks/github
 * 
 * Handles push and pull_request events from GitHub.
 */

interface GitHubPushPayload {
  ref: string;
  after: string;
  before: string;
  repository: {
    id: number;
    full_name: string;
    owner: { login: string };
    name: string;
  };
  pusher: { name: string; email: string };
  commits: Array<{
    id: string;
    message: string;
    author: { name: string; email: string };
    added: string[];
    modified: string[];
    removed: string[];
  }>;
}

interface GitHubPRPayload {
  action: string;
  number: number;
  pull_request: {
    head: { sha: string; ref: string };
    base: { ref: string };
    title: string;
    user: { login: string; avatar_url: string };
  };
  repository: {
    id: number;
    full_name: string;
    owner: { login: string };
    name: string;
  };
}

/**
 * Verify GitHub webhook signature
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;
  
  const hmac = crypto.createHmac("sha256", secret);
  const digest = `sha256=${hmac.update(payload).digest("hex")}`;
  
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");
    const event = request.headers.get("x-github-event");

    if (!event) {
      return NextResponse.json({ error: "Missing event header" }, { status: 400 });
    }

    // Parse the payload
    const payload = JSON.parse(rawBody);
    const repoId = payload.repository?.id;

    if (!repoId) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Get Firestore instance
    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    // Find project by repo ID
    const projectsSnapshot = await adminDb
      .collection("projects")
      .where("githubRepoId", "==", repoId)
      .limit(1)
      .get();

    if (projectsSnapshot.empty) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projectDoc = projectsSnapshot.docs[0];
    const project = { id: projectDoc.id, ...projectDoc.data() } as { 
      id: string; 
      userId: string; 
      webhookSecret?: string;
      status?: ProjectStatus;
      customRules?: string[];
      ownerEmail?: string;
      notificationPrefs?: { emailOnPush?: boolean; additionalEmails?: string[] };
      [key: string]: unknown;
    };

    // Check project status (Vercel-style controls)
    const projectStatus = project.status || 'active';
    if (projectStatus === 'paused') {
      console.log(`[Webhook] Project ${project.id} is paused, skipping analysis`);
      return NextResponse.json({ message: 'Project paused, skipping analysis' });
    }
    if (projectStatus === 'stopped') {
      console.log(`[Webhook] Project ${project.id} is stopped`);
      return NextResponse.json({ error: 'Project stopped' }, { status: 404 });
    }

    // Verify signature
    const webhookSecret = project.webhookSecret;
    if (webhookSecret && !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Get user's GitHub token
    const userDoc = await adminDb.collection("users").doc(project.userId as string).get();
    const githubToken = userDoc.data()?.githubAccessToken;

    if (!githubToken) {
      console.error("No GitHub token found for user:", project.userId);
      return NextResponse.json({ error: "No GitHub token" }, { status: 400 });
    }

    // Handle different events
    if (event === "push") {
      await handlePushEvent(
        payload as GitHubPushPayload,
        project as { id: string; userId: string; [key: string]: unknown },
        githubToken
      );
    } else if (event === "pull_request") {
      const prPayload = payload as GitHubPRPayload;
      if (["opened", "synchronize"].includes(prPayload.action)) {
        await handlePREvent(
          prPayload,
          project as { id: string; userId: string; [key: string]: unknown },
          githubToken
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

/**
 * Handle push event - analyze new commits
 */
async function handlePushEvent(
  payload: GitHubPushPayload,
  project: { id: string; userId: string; [key: string]: unknown },
  githubToken: string
) {
  const { repository, after: commitSha } = payload;
  const owner = repository.owner.login;
  const repo = repository.name;
  const branch = payload.ref.replace("refs/heads/", "");

  // Get Firestore instance
  const adminDb = getAdminDb();
  if (!adminDb) {
    console.error("[GitHub Webhook] Database not configured");
    return;
  }

  // Create analysis run
  const analysisRef = adminDb.collection("analysis_runs").doc();
  
  await analysisRef.set({
    id: analysisRef.id,
    userId: project.userId,
    projectId: project.id,
    commitSha,
    branch,
    triggerType: "push",
    status: "running",
    issueCounts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
    createdAt: new Date(),
  });

  try {
    // Fetch commit and analyze
    const commit = await fetchCommit(githubToken, owner, repo, commitSha);
    const allIssues: Omit<CodeIssue, "id" | "analysisRunId" | "projectId" | "isMuted">[] = [];

    // Get custom rules from project settings
    const customRules = (project.customRules as string[] | undefined) || [];

    for (const file of commit.files) {
      if (file.status === "removed") continue;

      const content = await fetchFileContent(githubToken, owner, repo, file.filename, commitSha);
      const language = detectLanguage(file.filename);

      // Get dependent files for graph-aware analysis (optional, may fail due to rate limits)
      let dependentContext = '';
      try {
        const dependentFiles = await getDependentFiles(githubToken, owner, repo, file.filename);
        if (dependentFiles.length > 0) {
          dependentContext = dependentFiles
            .map(df => `- ${df.path}:\n${df.snippet}`)
            .join('\n\n');
        }
      } catch (err) {
        console.warn("Graph-aware analysis skipped:", err);
      }

      const issues = await analyzeCode({
        code: content,
        filePath: file.filename,
        language,
        commitMessage: commit.commit.message,
        customRules,
        dependentContext: dependentContext || undefined,
      });

      allIssues.push(...issues);
    }

    // Calculate counts
    const issueCounts: Record<IssueSeverity, number> = {
      critical: allIssues.filter((i) => i.severity === "critical").length,
      high: allIssues.filter((i) => i.severity === "high").length,
      medium: allIssues.filter((i) => i.severity === "medium").length,
      low: allIssues.filter((i) => i.severity === "low").length,
      info: allIssues.filter((i) => i.severity === "info").length,
    };

    // Store issues
    const fullIssues: CodeIssue[] = allIssues.map((issue, idx) => ({
      ...issue,
      id: `${analysisRef.id}-${idx}`,
      analysisRunId: analysisRef.id,
      projectId: project.id,
      isMuted: false,
    }));

    // Generate summary
    const summary = await generateAnalysisSummary({
      repoName: `${owner}/${repo}`,
      commitSha,
      branch,
      issues: fullIssues,
    });

    // Update analysis run
    await analysisRef.update({
      status: "completed",
      completedAt: new Date(),
      issueCounts,
      summary,
      author: {
        name: commit.commit.author.name,
        email: commit.commit.author.email,
      },
    });

    // Send email notification if configured
    const notificationPrefs = project.notificationPrefs as { emailOnPush?: boolean; additionalEmails?: string[] } | undefined;
    if (notificationPrefs?.emailOnPush) {
      // Fetch user email
      const userData = await adminDb.collection("users").doc(project.userId).get();
      const userEmail = userData.data()?.email;
      const recipients = [userEmail, ...(notificationPrefs.additionalEmails || [])].filter(Boolean);

      for (const email of recipients) {
        await sendAnalysisReport({
          to: email,
          run: {
            id: analysisRef.id,
            userId: project.userId,
            projectId: project.id,
            commitSha,
            branch,
            triggerType: "push",
            status: "completed",
            issueCounts,
            author: {
              name: commit.commit.author.name,
              email: commit.commit.author.email,
            },
          } as import("@/types").AnalysisRun,
          issues: fullIssues,
          summary,
          repoName: `${owner}/${repo}`,
          commitUrl: `https://github.com/${owner}/${repo}/commit/${commitSha}`,
        });
      }

      await analysisRef.update({ emailStatus: "sent" });
    }
  } catch (error) {
    console.error("Push event analysis failed:", error);
    await analysisRef.update({
      status: "failed",
      error: error instanceof Error ? error.message : "Analysis failed",
    });
  }
}

/**
 * Handle PR event - analyze PR changes
 */
async function handlePREvent(
  payload: GitHubPRPayload,
  project: { id: string; userId: string; [key: string]: unknown },
  githubToken: string
) {
  const { repository, pull_request: pr } = payload;
  const owner = repository.owner.login;
  const repo = repository.name;
  const commitSha = pr.head.sha;
  const branch = pr.head.ref;

  // Get Firestore instance
  const adminDb = getAdminDb();
  if (!adminDb) {
    console.error("[GitHub Webhook] Database not configured");
    return;
  }

  // Create analysis run
  const analysisRef = adminDb.collection("analysis_runs").doc();
  
  await analysisRef.set({
    id: analysisRef.id,
    userId: project.userId,
    projectId: project.id,
    commitSha,
    branch,
    triggerType: "pull_request",
    prNumber: payload.number,
    status: "running",
    issueCounts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
    createdAt: new Date(),
    author: {
      name: pr.user.login,
      avatar: pr.user.avatar_url,
    },
  });

  try {
    // Similar analysis as push event but with PR comment output
    const commit = await fetchCommit(githubToken, owner, repo, commitSha);
    const allIssues: Omit<CodeIssue, "id" | "analysisRunId" | "projectId" | "isMuted">[] = [];

    // Get custom rules from project settings
    const customRules = (project.customRules as string[] | undefined) || [];

    for (const file of commit.files) {
      if (file.status === "removed") continue;

      const content = await fetchFileContent(githubToken, owner, repo, file.filename, commitSha);
      const language = detectLanguage(file.filename);

      // Get dependent files for graph-aware analysis
      let dependentContext = '';
      try {
        const dependentFiles = await getDependentFiles(githubToken, owner, repo, file.filename);
        if (dependentFiles.length > 0) {
          dependentContext = dependentFiles
            .map(df => `- ${df.path}:\n${df.snippet}`)
            .join('\n\n');
        }
      } catch (err) {
        console.warn("Graph-aware analysis skipped:", err);
      }

      const issues = await analyzeCode({
        code: content,
        filePath: file.filename,
        language,
        commitMessage: pr.title,
        customRules,
        dependentContext: dependentContext || undefined,
      });

      allIssues.push(...issues);
    }

    const issueCounts: Record<IssueSeverity, number> = {
      critical: allIssues.filter((i) => i.severity === "critical").length,
      high: allIssues.filter((i) => i.severity === "high").length,
      medium: allIssues.filter((i) => i.severity === "medium").length,
      low: allIssues.filter((i) => i.severity === "low").length,
      info: allIssues.filter((i) => i.severity === "info").length,
    };

    const fullIssues: CodeIssue[] = allIssues.map((issue, idx) => ({
      ...issue,
      id: `${analysisRef.id}-${idx}`,
      analysisRunId: analysisRef.id,
      projectId: project.id,
      isMuted: false,
    }));

    const summary = await generateAnalysisSummary({
      repoName: `${owner}/${repo}`,
      commitSha,
      branch,
      issues: fullIssues,
    });

    await analysisRef.update({
      status: "completed",
      completedAt: new Date(),
      issueCounts,
      summary,
    });

    // Post PR comment (not email) for pull requests
    try {
      const commentBody = formatPRComment(fullIssues, commitSha);
      await postPRComment(githubToken, owner, repo, payload.number, commentBody);
      console.log(`[Webhook] Posted PR comment for PR #${payload.number}`);
    } catch (commentError) {
      console.error("Failed to post PR comment:", commentError);
    }

  } catch (error) {
    console.error("PR event analysis failed:", error);
    await analysisRef.update({
      status: "failed",
      error: error instanceof Error ? error.message : "Analysis failed",
    });
  }
}

// Keep reference to userDoc for email sending in handlePushEvent
// Note: This is resolved by fetching user data within each handler function
