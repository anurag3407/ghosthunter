import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Octokit } from "@octokit/rest";

const LOG_PREFIX = "[GitHub:Repos]";

/**
 * GET /api/github/repos
 * Fetches the authenticated user's GitHub repositories using OAuth token from cookie
 */
export async function GET() {
  const startTime = Date.now();
  const requestId = `repos-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  console.log(`${LOG_PREFIX} ----------------------------------------`);
  console.log(`${LOG_PREFIX} [${requestId}] Repository list request started`);
  console.log(`${LOG_PREFIX} [${requestId}] Timestamp: ${new Date().toISOString()}`);
  
  try {
    // Get GitHub token from cookie
    console.log(`${LOG_PREFIX} [${requestId}] Checking for GitHub token in cookies...`);
    const cookieStore = await cookies();
    const githubTokenCookie = cookieStore.get("github_token");

    if (!githubTokenCookie) {
      console.warn(`${LOG_PREFIX} [${requestId}] ⚠ No github_token cookie found`);
      console.log(`${LOG_PREFIX} ----------------------------------------`);
      return NextResponse.json({
        repos: [],
        connected: false,
        message: "GitHub not connected. Please connect your GitHub account.",
      });
    }
    console.log(`${LOG_PREFIX} [${requestId}] ✓ github_token cookie found (${githubTokenCookie.value.length} chars)`);

    let tokenData;
    try {
      console.log(`${LOG_PREFIX} [${requestId}] Parsing token cookie...`);
      tokenData = JSON.parse(githubTokenCookie.value);
      console.log(`${LOG_PREFIX} [${requestId}] ✓ Token cookie parsed successfully`);
      console.log(`${LOG_PREFIX} [${requestId}]   - Token type: ${tokenData.token_type || "unknown"}`);
      console.log(`${LOG_PREFIX} [${requestId}]   - Scope: ${tokenData.scope || "unknown"}`);
    } catch (parseError) {
      console.error(`${LOG_PREFIX} [${requestId}] ❌ Failed to parse token cookie:`, parseError);
      console.log(`${LOG_PREFIX} ----------------------------------------`);
      return NextResponse.json({
        repos: [],
        connected: false,
        message: "Invalid GitHub token. Please reconnect.",
      });
    }

    const githubToken = tokenData.access_token;

    if (!githubToken) {
      console.error(`${LOG_PREFIX} [${requestId}] ❌ No access_token in token data`);
      console.log(`${LOG_PREFIX} ----------------------------------------`);
      return NextResponse.json({
        repos: [],
        connected: false,
        message: "GitHub token expired. Please reconnect.",
      });
    }
    console.log(`${LOG_PREFIX} [${requestId}] ✓ Access token extracted (${githubToken.length} chars)`);

    // Fetch real repositories from GitHub
    console.log(`${LOG_PREFIX} [${requestId}] Initializing Octokit client...`);
    const octokit = new Octokit({ auth: githubToken });
    console.log(`${LOG_PREFIX} [${requestId}] ✓ Octokit client initialized`);

    console.log(`${LOG_PREFIX} [${requestId}] Fetching repositories from GitHub API...`);
    console.log(`${LOG_PREFIX} [${requestId}]   - Sort: updated`);
    console.log(`${LOG_PREFIX} [${requestId}]   - Per page: 100`);
    console.log(`${LOG_PREFIX} [${requestId}]   - Affiliation: owner,collaborator,organization_member`);
    
    const fetchStartTime = Date.now();
    const { data: repos, headers } = await octokit.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
      affiliation: "owner,collaborator,organization_member",
    });
    const fetchDuration = Date.now() - fetchStartTime;
    
    console.log(`${LOG_PREFIX} [${requestId}] ✓ GitHub API response received in ${fetchDuration}ms`);
    console.log(`${LOG_PREFIX} [${requestId}]   - Total repos returned: ${repos.length}`);
    console.log(`${LOG_PREFIX} [${requestId}]   - Rate limit remaining: ${headers["x-ratelimit-remaining"] || "unknown"}`);
    console.log(`${LOG_PREFIX} [${requestId}]   - Rate limit reset: ${headers["x-ratelimit-reset"] ? new Date(parseInt(headers["x-ratelimit-reset"]) * 1000).toISOString() : "unknown"}`);

    // Log first few repos for debugging
    if (repos.length > 0) {
      console.log(`${LOG_PREFIX} [${requestId}] First 5 repositories:`);
      repos.slice(0, 5).forEach((repo, index) => {
        console.log(`${LOG_PREFIX} [${requestId}]   ${index + 1}. ${repo.full_name} (${repo.language || "no language"}, ${repo.private ? "private" : "public"})`);
      });
      if (repos.length > 5) {
        console.log(`${LOG_PREFIX} [${requestId}]   ... and ${repos.length - 5} more`);
      }
    }

    // Transform to frontend format
    console.log(`${LOG_PREFIX} [${requestId}] Transforming repositories for frontend...`);
    const repositories = repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      language: repo.language,
      default_branch: repo.default_branch,
      private: repo.private,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      updated_at: repo.updated_at,
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url,
      },
    }));

    const totalDuration = Date.now() - startTime;
    console.log(`${LOG_PREFIX} [${requestId}] ✓ Request completed successfully in ${totalDuration}ms`);
    console.log(`${LOG_PREFIX} [${requestId}] Timing breakdown:`);
    console.log(`${LOG_PREFIX} [${requestId}]   - GitHub API fetch: ${fetchDuration}ms`);
    console.log(`${LOG_PREFIX} [${requestId}]   - Other: ${totalDuration - fetchDuration}ms`);
    console.log(`${LOG_PREFIX} ----------------------------------------`);

    return NextResponse.json({
      repos: repositories,
      connected: true,
    });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`${LOG_PREFIX} [${requestId}] ❌ Error after ${totalDuration}ms:`, error);
    
    if (error instanceof Error) {
      console.error(`${LOG_PREFIX} [${requestId}] Error message: ${error.message}`);
      console.error(`${LOG_PREFIX} [${requestId}] Stack trace:`, error.stack);
      
      // Check for specific GitHub API errors
      if (error.message.includes("401") || error.message.includes("Bad credentials")) {
        console.error(`${LOG_PREFIX} [${requestId}] This appears to be an authentication error - token may be expired`);
      }
    }
    
    console.log(`${LOG_PREFIX} ----------------------------------------`);
    
    return NextResponse.json(
      { error: "Failed to fetch repositories", connected: false },
      { status: 500 }
    );
  }
}
