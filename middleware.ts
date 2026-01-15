import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * ============================================================================
 * CLERK MIDDLEWARE - CENTRALIZED AUTHENTICATION & SECURITY
 * ============================================================================
 * This middleware protects routes and handles authentication across the app.
 * Also adds security headers to all responses.
 * 
 * Route Protection:
 * - Public routes: Landing page, sign-in, sign-up, public API endpoints
 * - Protected routes: Dashboard and all sub-routes, authenticated API endpoints
 * 
 * The middleware runs on every request and ensures:
 * 1. Public routes are accessible to everyone
 * 2. Protected routes redirect to sign-in if not authenticated
 * 3. API routes return 401 if not authenticated (handled in route handlers)
 * 4. Security headers are added to all responses
 */

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",                    // Landing page
  "/sign-in(.*)",         // Sign in page and sub-routes
  "/sign-up(.*)",         // Sign up page and sub-routes
  "/api/webhooks/(.*)",   // Webhook endpoints (verified by webhook secret)
  "/api/health",          // Health check endpoint
]);

/**
 * Security headers to protect against common attacks
 */
const securityHeaders = {
  // Prevent clickjacking
  "X-Frame-Options": "DENY",
  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",
  // Control referrer information
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Restrict browser features
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  // XSS protection (legacy, but still useful)
  "X-XSS-Protection": "1; mode=block",
};

/**
 * Content Security Policy - adjust as needed for your specific requirements
 */
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com https://*.clerk.accounts.dev https://challenges.cloudflare.com https://prod.spline.design;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https: http:;
  font-src 'self' https://fonts.gstatic.com data:;
  connect-src 'self' https://*.clerk.accounts.dev https://clerk.com https://api.clerk.com https://*.github.com https://api.github.com wss://*.clerk.accounts.dev https://prod.spline.design https://*.firebase.com https://*.firebaseio.com https://*.googleapis.com;
  frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://challenges.cloudflare.com https://prod.spline.design;
  worker-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
`.replace(/\s{2,}/g, ' ').trim();

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // Protect all routes except public ones
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // Get response (will be created by next middleware/handler)
  const response = NextResponse.next();

  // Add security headers
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  // Add CSP header (only in production to avoid dev issues)
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Content-Security-Policy", cspHeader);
  }

  // Add HSTS header (only in production over HTTPS)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

