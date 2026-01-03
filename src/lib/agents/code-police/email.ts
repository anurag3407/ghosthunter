/**
 * ============================================================================
 * CODE POLICE - EMAIL SERVICE
 * ============================================================================
 * Send analysis reports via email using Resend.
 */

import { Resend } from "resend";
import type { AnalysisRun, CodeIssue, IssueSeverity } from "@/types";

let resendClient: Resend | null = null;

/**
 * Get Resend client instance
 */
function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

/**
 * Send analysis report email
 */
export async function sendAnalysisReport(input: {
  to: string;
  run: AnalysisRun;
  issues: CodeIssue[];
  summary: string;
  repoName: string;
  commitUrl: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resend = getResendClient();
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || "noreply@ghostfounder.com";

  const html = generateReportHtml(input);

  try {
    const result = await resend.emails.send({
      from: `GhostFounder Code Police <${fromAddress}>`,
      to: input.to,
      subject: getEmailSubject(input.run, input.issues),
      html,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Generate email subject based on analysis results
 */
function getEmailSubject(run: AnalysisRun, issues: CodeIssue[]): string {
  const { critical, high } = run.issueCounts;
  const commitShort = run.commitSha.slice(0, 7);

  if (critical > 0) {
    return `🚨 Critical Issues Found - ${commitShort}`;
  }
  if (high > 0) {
    return `⚠️ High Priority Issues - ${commitShort}`;
  }
  if (issues.length > 0) {
    return `📋 Code Review Report - ${commitShort}`;
  }
  return `✅ Clean Commit - ${commitShort}`;
}

/**
 * Generate HTML email content
 */
function generateReportHtml(input: {
  run: AnalysisRun;
  issues: CodeIssue[];
  summary: string;
  repoName: string;
  commitUrl: string;
}): string {
  const { run, issues, summary, repoName, commitUrl } = input;
  const commitShort = run.commitSha.slice(0, 7);

  const severityColors: Record<IssueSeverity, string> = {
    critical: "#dc2626",
    high: "#ea580c",
    medium: "#ca8a04",
    low: "#2563eb",
    info: "#6b7280",
  };

  const severityEmoji: Record<IssueSeverity, string> = {
    critical: "🔴",
    high: "🟠",
    medium: "🟡",
    low: "🔵",
    info: "ℹ️",
  };

  /**
   * Format code snippet with VS Code-style dark theme
   */
  const formatCodeSnippet = (snippet: string | undefined): string => {
    if (!snippet) return '';
    
    // Escape HTML entities
    const escaped = snippet
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    return `
      <div style="margin-top: 12px; border-radius: 8px; overflow: hidden; border: 1px solid #3c3c3c;">
        <div style="background-color: #252526; padding: 8px 12px; border-bottom: 1px solid #3c3c3c;">
          <span style="color: #858585; font-size: 11px; font-family: 'SF Mono', Consolas, monospace;">Code Snippet</span>
        </div>
        <pre style="margin: 0; padding: 16px; background-color: #1e1e1e; overflow-x: auto;"><code style="color: #d4d4d4; font-size: 13px; font-family: 'SF Mono', 'Fira Code', Consolas, 'Courier New', monospace; line-height: 1.5; white-space: pre;">${escaped}</code></pre>
      </div>
    `;
  };

  // Generate detailed issue cards with code snippets
  const issueCards = issues
    .slice(0, 10) // Limit to 10 detailed issues in email
    .map(
      (issue) => `
        <div style="background-color: #1f1f23; border: 1px solid #27272a; border-left: 4px solid ${severityColors[issue.severity]}; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 16px;">${severityEmoji[issue.severity]}</span>
            <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; color: white; background-color: ${severityColors[issue.severity]}; text-transform: uppercase;">
              ${issue.severity}
            </span>
            <span style="color: #71717a; font-size: 12px; text-transform: capitalize;">${issue.category}</span>
          </div>
          <h3 style="color: #fafafa; font-size: 15px; font-weight: 600; margin: 0 0 8px 0;">
            ${issue.message}
          </h3>
          <p style="color: #71717a; font-size: 13px; margin: 0 0 8px 0; font-family: 'SF Mono', Consolas, monospace;">
            📁 ${issue.filePath}:${issue.line}${issue.endLine ? `-${issue.endLine}` : ''}
          </p>
          <p style="color: #a1a1aa; font-size: 14px; line-height: 1.5; margin: 0;">
            ${issue.explanation}
          </p>
          ${formatCodeSnippet(issue.codeSnippet)}
          ${issue.suggestedFix ? `
            <div style="margin-top: 12px; padding: 12px; background-color: rgba(74, 222, 128, 0.1); border: 1px solid rgba(74, 222, 128, 0.2); border-radius: 6px;">
              <p style="color: #4ade80; font-size: 13px; margin: 0;">
                <strong>💡 Suggested Fix:</strong> ${issue.suggestedFix}
              </p>
            </div>
          ` : ''}
        </div>
      `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 640px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #a78bfa; font-size: 24px; margin: 0 0 8px 0;">
              🛡️ Code Police Report
            </h1>
            <p style="color: #71717a; margin: 0;">
              ${repoName} • ${run.branch}
            </p>
          </div>

          <!-- Summary Card -->
          <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #fafafa; font-size: 18px; margin: 0 0 16px 0;">
              Summary
            </h2>
            <p style="color: #a1a1aa; line-height: 1.6; margin: 0;">
              ${summary.replace(/\n/g, "<br>")}
            </p>
          </div>

          <!-- Stats Grid -->
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 24px;">
            ${Object.entries(run.issueCounts)
              .map(
                ([severity, count]) => `
                  <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 12px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold; color: ${severityColors[severity as IssueSeverity]};">
                      ${count}
                    </div>
                    <div style="font-size: 12px; color: #71717a; text-transform: capitalize;">
                      ${severity}
                    </div>
                  </div>
                `
              )
              .join("")}
          </div>

          <!-- Issues List -->
          ${issues.length > 0 ? `
            <div style="margin-bottom: 24px;">
              <h2 style="color: #fafafa; font-size: 16px; margin: 0 0 16px 0;">
                🔍 Issues Found (${issues.length})
              </h2>
              ${issueCards}
              ${issues.length > 10 ? `
                <div style="padding: 16px; text-align: center; color: #71717a; font-size: 14px; background-color: #18181b; border: 1px solid #27272a; border-radius: 8px;">
                  ... and ${issues.length - 10} more issues. View full report on the dashboard.
                </div>
              ` : ""}
            </div>
          ` : `
            <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px;">
              <div style="font-size: 48px; margin-bottom: 16px;">✨</div>
              <h3 style="color: #fafafa; margin: 0 0 8px 0;">No Issues Found</h3>
              <p style="color: #71717a; margin: 0;">Great job! Your code looks clean.</p>
            </div>
          `}

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${commitUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              View Commit on GitHub
            </a>
          </div>

          <!-- Footer -->
          <div style="text-align: center; color: #52525b; font-size: 12px;">
            <p>
              Sent by <a href="https://ghostfounder.com" style="color: #a78bfa; text-decoration: none;">GhostFounder</a> Code Police
            </p>
            <p>
              Commit: ${commitShort} • ${new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
