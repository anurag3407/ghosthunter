import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * GET /api/auth/github/status
 * Check if GitHub is connected
 */
export async function GET() {
  const cookieStore = await cookies();
  const githubTokenCookie = cookieStore.get("github_token");

  if (!githubTokenCookie) {
    return NextResponse.json({ connected: false });
  }

  try {
    const tokenData = JSON.parse(githubTokenCookie.value);
    return NextResponse.json({
      connected: true,
      username: tokenData.username,
      avatar_url: tokenData.avatar_url,
      connected_at: tokenData.connected_at,
    });
  } catch {
    return NextResponse.json({ connected: false });
  }
}

/**
 * DELETE /api/auth/github/status
 * Disconnect GitHub
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("github_token");
  return response;
}
