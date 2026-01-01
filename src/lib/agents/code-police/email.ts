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

  const issueRows = issues
    .slice(0, 20) // Limit to 20 issues in email
    .map(
      (issue) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #27272a;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; color: white; background-color: ${severityColors[issue.severity]};">
              ${issue.severity.toUpperCase()}
            </span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #27272a; color: #a1a1aa;">
            ${issue.filePath}:${issue.line}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #27272a; color: #fafafa;">
            ${issue.message}
          </td>
        </tr>
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

          <!-- Issues Table -->
          ${issues.length > 0 ? `
            <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #27272a;">
                    <th style="padding: 12px; text-align: left; color: #a1a1aa; font-size: 12px; text-transform: uppercase;">
                      Severity
                    </th>
                    <th style="padding: 12px; text-align: left; color: #a1a1aa; font-size: 12px; text-transform: uppercase;">
                      Location
                    </th>
                    <th style="padding: 12px; text-align: left; color: #a1a1aa; font-size: 12px; text-transform: uppercase;">
                      Issue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${issueRows}
                </tbody>
              </table>
              ${issues.length > 20 ? `
                <div style="padding: 12px; text-align: center; color: #71717a; font-size: 14px;">
                  ... and ${issues.length - 20} more issues
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
