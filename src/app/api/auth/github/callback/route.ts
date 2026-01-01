import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/github/callback
 * Handle OAuth callback from GitHub - exchange code for token
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=no_code", request.url)
    );
  }

  // Parse state to get returnTo URL
  const [, returnTo = "/dashboard/settings"] = state?.split(":") || [];

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=not_configured", request.url)
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("GitHub OAuth error:", tokenData);
      return NextResponse.redirect(
        new URL(`/dashboard/settings?error=${tokenData.error}`, request.url)
      );
    }

    // Get user info from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const userData = await userResponse.json();

    // Create response with redirect
    const response = NextResponse.redirect(
      new URL(`${returnTo}?github_connected=true`, request.url)
    );

    // Store token and user info in HTTP-only cookie
    const cookieData = {
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
      username: userData.login,
      avatar_url: userData.avatar_url,
      connected_at: new Date().toISOString(),
    };

    response.cookies.set("github_token", JSON.stringify(cookieData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    // Clear the state cookie
    response.cookies.delete("github_oauth_state");

    return response;
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=callback_failed", request.url)
    );
  }
}
