/**
 * ============================================================================
 * RATE LIMITING UTILITY
 * ============================================================================
 * Simple in-memory rate limiting for API protection.
 * For production scale, consider Redis-based rate limiting.
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory store for rate limits
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;

let cleanupInitialized = false;

function initCleanup() {
    if (cleanupInitialized) return;
    cleanupInitialized = true;

    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of rateLimitStore.entries()) {
            if (now > entry.resetTime) {
                rateLimitStore.delete(key);
            }
        }
    }, CLEANUP_INTERVAL);
}

export interface RateLimitConfig {
    /** Maximum number of requests allowed in the window */
    limit: number;
    /** Time window in seconds */
    windowSeconds: number;
}

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetIn: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (e.g., IP, userId)
 * @param config - Rate limit configuration
 * @returns RateLimitResult with success status and remaining requests
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    initCleanup();

    const now = Date.now();
    const windowMs = config.windowSeconds * 1000;
    const entry = rateLimitStore.get(identifier);

    // No existing entry or window expired
    if (!entry || now > entry.resetTime) {
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + windowMs,
        });
        return {
            success: true,
            remaining: config.limit - 1,
            resetIn: config.windowSeconds,
        };
    }

    // Within window, check count
    if (entry.count >= config.limit) {
        return {
            success: false,
            remaining: 0,
            resetIn: Math.ceil((entry.resetTime - now) / 1000),
        };
    }

    // Increment count
    entry.count++;
    return {
        success: true,
        remaining: config.limit - entry.count,
        resetIn: Math.ceil((entry.resetTime - now) / 1000),
    };
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(
    result: RateLimitResult,
    config: RateLimitConfig
): Record<string, string> {
    return {
        "X-RateLimit-Limit": config.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.resetIn.toString(),
    };
}

// Preset configurations for common use cases
export const RATE_LIMITS = {
    /** Standard API endpoint: 60 requests per minute */
    standard: { limit: 60, windowSeconds: 60 },
    /** Strict for auth/sensitive: 10 requests per minute */
    strict: { limit: 10, windowSeconds: 60 },
    /** Relaxed for read-only: 120 requests per minute */
    relaxed: { limit: 120, windowSeconds: 60 },
    /** Webhook endpoints: 100 requests per minute */
    webhook: { limit: 100, windowSeconds: 60 },
} as const;
