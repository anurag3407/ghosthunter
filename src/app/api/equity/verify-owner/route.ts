import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Octokit } from "@octokit/rest";

/**
 * GET /api/equity/verify-owner?repoId=123
 * Verify if the current user is the owner of a GitHub repository
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const repoId = searchParams.get("repoId");
    const repoFullName = searchParams.get("repoFullName");

    if (!repoId && !repoFullName) {
      return NextResponse.json(
        { error: "Missing repoId or repoFullName parameter" },
        { status: 400 }
      );
    }

    // Get GitHub OAuth token from Clerk
    const clerk = await clerkClient();
    let githubToken: string | null = null;

    try {
      // Clerk uses "oauth_github" as the provider name
      const tokens = await clerk.users.getUserOauthAccessToken(userId, "oauth_github");
      if (tokens.data && tokens.data.length > 0) {
        githubToken = tokens.data[0].token;
      }
    } catch {
      // Also try legacy "github" provider name for backwards compatibility
      try {
        const tokens = await clerk.users.getUserOauthAccessToken(userId, "github");
        if (tokens.data && tokens.data.length > 0) {
          githubToken = tokens.data[0].token;
        }
      } catch {
        return NextResponse.json({
          isOwner: false,
          error: "GitHub not connected",
          message: "Please connect your GitHub account to verify repository ownership.",
        });
      }
    }

    if (!githubToken) {
      return NextResponse.json({
        isOwner: false,
        error: "GitHub not connected",
        message: "Please connect your GitHub account to verify repository ownership.",
      });
    }

    const octokit = new Octokit({ auth: githubToken });

    // Get authenticated user's GitHub username
    const { data: githubUser } = await octokit.users.getAuthenticated();
    const currentUsername = githubUser.login;

    let repo;
    
    if (repoFullName) {
      // Fetch by full name (owner/repo)
      const [owner, repoName] = repoFullName.split("/");
      try {
        const { data } = await octokit.repos.get({ owner, repo: repoName });
        repo = data;
      } catch {
        return NextResponse.json({
          isOwner: false,
          error: "Repository not found",
          message: "Could not find the specified repository.",
        });
      }
    } else {
      // Fetch by ID
      try {
        const { data: repos } = await octokit.repos.listForAuthenticatedUser({
          per_page: 100,
          affiliation: "owner",
        });
        repo = repos.find((r) => r.id === parseInt(repoId!));
        
        if (!repo) {
          return NextResponse.json({
            isOwner: false,
            error: "Repository not found or not owned",
            message: "You do not own this repository.",
          });
        }
      } catch {
        return NextResponse.json({
          isOwner: false,
          error: "Failed to fetch repositories",
        });
      }
    }

    // Check if current user is the owner
    const isOwner = repo.owner.login.toLowerCase() === currentUsername.toLowerCase();

    return NextResponse.json({
      isOwner,
      repoInfo: {
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        owner: repo.owner.login,
        description: repo.description,
        htmlUrl: repo.html_url,
        language: repo.language,
        private: repo.private,
      },
      currentUser: currentUsername,
    });
  } catch (error) {
    console.error("[Equity:VerifyOwner] Error:", error);
    return NextResponse.json(
      { error: "Failed to verify ownership", isOwner: false },
      { status: 500 }
    );
  }
}
