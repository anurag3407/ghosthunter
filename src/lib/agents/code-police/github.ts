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
