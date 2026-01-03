/**
 * ============================================================================
 * CODE POLICE - GITHUB SERVICE
 * ============================================================================
 * GitHub API integration for fetching file contents and webhook management.
 */

import type { GitHubRepo } from "@/types";

const GITHUB_API_BASE = "https://api.github.com";

interface GitHubUser {
  login: string;
  avatar_url: string;
}

/**
 * Fetch repositories for an authenticated user
 */
export async function fetchUserRepos(accessToken: string): Promise<GitHubRepo[]> {
  const response = await fetch(`${GITHUB_API_BASE}/user/repos?per_page=100&sort=updated`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch repos: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch file content from a repository
 */
export async function fetchFileContent(
  accessToken: string,
  owner: string,
  repo: string,
  path: string,
  ref?: string
): Promise<string> {
  const url = new URL(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`);
  if (ref) {
    url.searchParams.set("ref", ref);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3.raw",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`);
  }

  return response.text();
}

/**
 * Fetch commit details
 */
export async function fetchCommit(
  accessToken: string,
  owner: string,
  repo: string,
  sha: string
): Promise<{
  sha: string;
  commit: {
    message: string;
    author: { name: string; email: string };
  };
  files: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patch?: string;
  }>;
}> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits/${sha}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch commit: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a webhook for a repository
 */
export async function createWebhook(
  accessToken: string,
  owner: string,
  repo: string,
  webhookUrl: string,
  secret: string
): Promise<{ id: number }> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/hooks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "web",
        active: true,
        events: ["push", "pull_request"],
        config: {
          url: webhookUrl,
          content_type: "json",
          secret,
          insecure_ssl: "0",
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create webhook: ${error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Delete a webhook from a repository
 */
export async function deleteWebhook(
  accessToken: string,
  owner: string,
  repo: string,
  webhookId: number
): Promise<void> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/hooks/${webhookId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!response.ok && response.status !== 404) {
    throw new Error(`Failed to delete webhook: ${response.statusText}`);
  }
}

/**
 * Fetch README from a repository
 */
export async function fetchReadme(
  accessToken: string,
  owner: string,
  repo: string
): Promise<string | null> {
  const readmeFiles = ["README.md", "readme.md", "README", "README.txt"];

  for (const filename of readmeFiles) {
    try {
      return await fetchFileContent(accessToken, owner, repo, filename);
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Get authenticated user info
 */
export async function getAuthenticatedUser(accessToken: string): Promise<GitHubUser> {
  const response = await fetch(`${GITHUB_API_BASE}/user`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Generate webhook secret
 */
export function generateWebhookSecret(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Verify webhook signature
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );

  const expectedSignature = `sha256=${Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;

  return signature === expectedSignature;
}

/**
 * Search for files that import/depend on a given file (graph-aware analysis)
 * Uses GitHub Code Search API to find import statements
 */
export async function getDependentFiles(
  accessToken: string,
  owner: string,
  repo: string,
  targetFilePath: string
): Promise<Array<{ path: string; snippet: string }>> {
  // Extract the module name from the file path
  const fileName = targetFilePath.split('/').pop()?.replace(/\.(ts|tsx|js|jsx)$/, '');
  if (!fileName) return [];

  // Build search query to find imports of this file
  const searchQueries = [
    `import+from+"${fileName}"`, // ES6 imports
    `require("${fileName}")`,    // CommonJS
    `from+"${targetFilePath.replace(/\.(ts|tsx|js|jsx)$/, '')}"`, // Full path imports
  ];

  const dependentFiles: Array<{ path: string; snippet: string }> = [];

  for (const query of searchQueries.slice(0, 1)) { // Limit API calls
    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/search/code?q=${encodeURIComponent(query)}+repo:${owner}/${repo}&per_page=5`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3.text-match+json",
          },
        }
      );

      if (!response.ok) {
        // Code search may be rate limited, gracefully skip
        console.warn(`Code search failed: ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      
      for (const item of data.items || []) {
        if (item.path === targetFilePath) continue; // Skip self
        
        const textMatches = item.text_matches || [];
        const snippet = textMatches.map((tm: { fragment: string }) => tm.fragment).join('\n...\n');
        
        dependentFiles.push({
          path: item.path,
          snippet: snippet || `Imports ${fileName}`,
        });
      }
    } catch (error) {
      console.warn("getDependentFiles search failed:", error);
    }
  }

  return dependentFiles.slice(0, 5); // Limit to 5 dependent files
}

/**
 * Post a comment on a Pull Request with analysis results
 */
export async function postPRComment(
  accessToken: string,
  owner: string,
  repo: string,
  prNumber: number,
  body: string
): Promise<{ id: number } | null> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${prNumber}/comments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body }),
      }
    );

    if (!response.ok) {
      console.error(`Failed to post PR comment: ${response.statusText}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("postPRComment failed:", error);
    return null;
  }
}

/**
 * Format issues for PR comment (markdown)
 */
export function formatPRComment(
  issues: Array<{
    filePath: string;
    line: number;
    severity: string;
    message: string;
    explanation: string;
    suggestedFix?: string;
    codeSnippet?: string;
  }>,
  commitSha: string
): string {
  if (issues.length === 0) {
    return `## 🛡️ Code Police Report

✅ **No issues found!** Great job keeping the code clean.

---
*Analyzed commit: \`${commitSha.slice(0, 7)}\`*`;
  }

  const severityCounts = {
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length,
    info: issues.filter(i => i.severity === 'info').length,
  };

  const badge = Object.entries(severityCounts)
    .filter(([, count]) => count > 0)
    .map(([sev, count]) => `${count} ${sev}`)
    .join(' | ');

  const issuesList = issues.slice(0, 10).map(issue => {
    const emoji = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵',
      info: 'ℹ️',
    }[issue.severity] || '⚪';

    let block = `### ${emoji} ${issue.message}

**File:** \`${issue.filePath}:${issue.line}\`
**Severity:** ${issue.severity.toUpperCase()}

${issue.explanation}`;

    if (issue.codeSnippet) {
      block += `

\`\`\`typescript
${issue.codeSnippet}
\`\`\``;
    }

    if (issue.suggestedFix) {
      block += `

💡 **Suggested Fix:** ${issue.suggestedFix}`;
    }

    return block;
  }).join('\n\n---\n\n');

  return `## 🛡️ Code Police Report

**Summary:** ${badge}

---

${issuesList}

${issues.length > 10 ? `\n*...and ${issues.length - 10} more issues*\n` : ''}
---
*Analyzed commit: \`${commitSha.slice(0, 7)}\`*`;
}
