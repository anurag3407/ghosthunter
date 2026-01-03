import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Octokit } from "@octokit/rest";

/**
 * GET /api/github/repos
 * Fetches the authenticated user's GitHub repositories using Clerk OAuth
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ 
        repos: [], 
        connected: false, 
        message: "Please sign in to continue" 
      }, { status: 401 });
    }

    // Get GitHub OAuth token from Clerk
    const clerk = await clerkClient();
    let githubToken: string | null = null;
    
    try {
      const tokens = await clerk.users.getUserOauthAccessToken(userId, "github");
      if (tokens.data && tokens.data.length > 0) {
        githubToken = tokens.data[0].token;
      }
    } catch (error) {
      console.log("[GitHub:Repos] No GitHub OAuth token found:", error);
      return NextResponse.json({
        repos: [],
        connected: false,
        message: "GitHub not connected. Please connect your GitHub account in Settings.",
        connectUrl: "/dashboard/settings",
      });
    }

    if (!githubToken) {
      return NextResponse.json({
        repos: [],
        connected: false,
        message: "GitHub not connected. Please connect your GitHub account in Settings.",
        connectUrl: "/dashboard/settings",
      });
    }

    // Fetch repositories from GitHub
    const octokit = new Octokit({ auth: githubToken });
    
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
      affiliation: "owner,collaborator,organization_member",
    });

    // Transform to frontend format
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

    return NextResponse.json({
      repos: repositories,
      connected: true,
    });
  } catch (error) {
    console.error("[GitHub:Repos] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories", repos: [], connected: false },
      { status: 500 }
    );
  }
}
