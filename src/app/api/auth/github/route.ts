import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/github
 * Initiate GitHub OAuth flow - redirects to GitHub authorization
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "GitHub OAuth not configured" },
      { status: 500 }
    );
  }

  // Generate state for CSRF protection
  const state = Math.random().toString(36).substring(7);
  
  // Get the redirect URL from query params or default to settings
  const { searchParams } = new URL(request.url);
  const returnTo = searchParams.get("returnTo") || "/dashboard/settings";

  // Build GitHub authorization URL
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/github/callback`,
    scope: "read:user repo",
    state: `${state}:${returnTo}`,
  });

  const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  // Set state cookie and redirect
  const response = NextResponse.redirect(githubAuthUrl);
  response.cookies.set("github_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
  });

  return response;
}
