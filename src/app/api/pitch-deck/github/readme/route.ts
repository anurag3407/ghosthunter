import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const LOG_PREFIX = "[PitchDeck:README]";

/**
 * GET /api/pitch-deck/github/readme
 * Fetch README content from a GitHub repository
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `readme-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  console.log(`${LOG_PREFIX} ----------------------------------------`);
  console.log(`${LOG_PREFIX} [${requestId}] README fetch request started`);
  console.log(`${LOG_PREFIX} [${requestId}] Timestamp: ${new Date().toISOString()}`);
  
  try {
    // Parse query params
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");

    console.log(`${LOG_PREFIX} [${requestId}] Query parameters:`);
    console.log(`${LOG_PREFIX} [${requestId}]   - owner: ${owner || "(not provided)"}`);
    console.log(`${LOG_PREFIX} [${requestId}]   - repo: ${repo || "(not provided)"}`);

    if (!owner || !repo) {
      console.error(`${LOG_PREFIX} [${requestId}] ❌ Missing required parameters`);
      return NextResponse.json(
        { error: "owner and repo are required" },
        { status: 400 }
      );
    }

    // Get GitHub OAuth token from cookie
    console.log(`${LOG_PREFIX} [${requestId}] Checking for GitHub token in cookies...`);
    const cookieStore = await cookies();
    const githubTokenCookie = cookieStore.get("github_token");
    
    let githubToken: string | null = null;
    if (githubTokenCookie) {
      console.log(`${LOG_PREFIX} [${requestId}] ✓ github_token cookie found (${githubTokenCookie.value.length} chars)`);
      try {
        const tokenData = JSON.parse(githubTokenCookie.value);
        githubToken = tokenData.access_token;
        console.log(`${LOG_PREFIX} [${requestId}] ✓ Token extracted from cookie`);
        console.log(`${LOG_PREFIX} [${requestId}]   - Token type: ${tokenData.token_type || "unknown"}`);
        console.log(`${LOG_PREFIX} [${requestId}]   - Token length: ${githubToken?.length || 0} chars`);
      } catch (parseError) {
        console.warn(`${LOG_PREFIX} [${requestId}] ⚠ Failed to parse token cookie:`, parseError);
      }
    } else {
      console.warn(`${LOG_PREFIX} [${requestId}] ⚠ No github_token cookie found - will make unauthenticated request`);
    }

    // Build request headers
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GhostFounder-PitchDeck",
    };

    if (githubToken) {
      headers.Authorization = `Bearer ${githubToken}`;
      console.log(`${LOG_PREFIX} [${requestId}] ✓ Authorization header added`);
    }

    // Fetch README from GitHub
    const githubUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
    console.log(`${LOG_PREFIX} [${requestId}] Fetching README from GitHub...`);
    console.log(`${LOG_PREFIX} [${requestId}]   - URL: ${githubUrl}`);
    console.log(`${LOG_PREFIX} [${requestId}]   - Authenticated: ${!!githubToken}`);
    
    const fetchStartTime = Date.now();
    const readmeResponse = await fetch(githubUrl, { headers });
    const fetchDuration = Date.now() - fetchStartTime;
    
    console.log(`${LOG_PREFIX} [${requestId}] GitHub API response received in ${fetchDuration}ms`);
    console.log(`${LOG_PREFIX} [${requestId}]   - Status: ${readmeResponse.status} ${readmeResponse.statusText}`);
    console.log(`${LOG_PREFIX} [${requestId}]   - Rate limit remaining: ${readmeResponse.headers.get("x-ratelimit-remaining") || "unknown"}`);

    if (!readmeResponse.ok) {
      if (readmeResponse.status === 404) {
        console.error(`${LOG_PREFIX} [${requestId}] ❌ README not found in repository`);
        return NextResponse.json(
          { error: "README not found in this repository" },
          { status: 404 }
        );
      }
      
      const errorBody = await readmeResponse.text();
      console.error(`${LOG_PREFIX} [${requestId}] ❌ GitHub API error:`);
      console.error(`${LOG_PREFIX} [${requestId}]   - Status: ${readmeResponse.status}`);
      console.error(`${LOG_PREFIX} [${requestId}]   - Body: ${errorBody.substring(0, 500)}`);
      throw new Error(`GitHub API returned ${readmeResponse.status}: ${errorBody}`);
    }

    // Parse response
    console.log(`${LOG_PREFIX} [${requestId}] Parsing GitHub response...`);
    const readmeData = await readmeResponse.json();
    
    console.log(`${LOG_PREFIX} [${requestId}] README metadata:`);
    console.log(`${LOG_PREFIX} [${requestId}]   - Path: ${readmeData.path}`);
    console.log(`${LOG_PREFIX} [${requestId}]   - SHA: ${readmeData.sha}`);
    console.log(`${LOG_PREFIX} [${requestId}]   - Size: ${readmeData.size} bytes`);
    console.log(`${LOG_PREFIX} [${requestId}]   - Encoding: ${readmeData.encoding}`);
    console.log(`${LOG_PREFIX} [${requestId}]   - Content length (encoded): ${readmeData.content?.length || 0} chars`);
    
    // Decode base64 content
    console.log(`${LOG_PREFIX} [${requestId}] Decoding base64 content...`);
    const decodeStartTime = Date.now();
    const content = Buffer.from(readmeData.content, "base64").toString("utf-8");
    const decodeDuration = Date.now() - decodeStartTime;
    
    console.log(`${LOG_PREFIX} [${requestId}] ✓ Content decoded in ${decodeDuration}ms`);
    console.log(`${LOG_PREFIX} [${requestId}]   - Decoded length: ${content.length} chars`);
    console.log(`${LOG_PREFIX} [${requestId}]   - Content preview: "${content.substring(0, 150).replace(/\n/g, "\\n")}..."`);

    const totalDuration = Date.now() - startTime;
    console.log(`${LOG_PREFIX} [${requestId}] ✓ Request completed successfully in ${totalDuration}ms`);
    console.log(`${LOG_PREFIX} [${requestId}] Timing breakdown:`);
    console.log(`${LOG_PREFIX} [${requestId}]   - GitHub fetch: ${fetchDuration}ms`);
    console.log(`${LOG_PREFIX} [${requestId}]   - Decode: ${decodeDuration}ms`);
    console.log(`${LOG_PREFIX} [${requestId}]   - Other: ${totalDuration - fetchDuration - decodeDuration}ms`);
    console.log(`${LOG_PREFIX} ----------------------------------------`);

    return NextResponse.json({
      content,
      path: readmeData.path,
      size: readmeData.size,
    });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`${LOG_PREFIX} [${requestId}] ❌ Error after ${totalDuration}ms:`, error);
    console.error(`${LOG_PREFIX} [${requestId}] Stack trace:`, error instanceof Error ? error.stack : "No stack trace");
    console.log(`${LOG_PREFIX} ----------------------------------------`);
    
    return NextResponse.json(
      { error: "Failed to fetch README" },
      { status: 500 }
    );
  }
}
