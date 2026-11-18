/**
 * ============================================================================
 * ADMIN UTILITIES
 * ============================================================================
 * Admin access control and utilities
 */

// Admin emails configured via environment variable ADMIN_EMAILS (comma-separated)
const DEFAULT_ADMIN_EMAILS: string[] = [];

/**
 * Check if a user email has admin access
 */
export function isAdminEmail(email: string | null | undefined): boolean {
    if (!email) return false;

    const adminEmails = process.env.ADMIN_EMAILS
        ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase())
        : DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase());

    return adminEmails.includes(email.toLowerCase());
}

/**
 * Get list of admin emails
 */
export function getAdminEmails(): string[] {
    return process.env.ADMIN_EMAILS
        ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim())
        : DEFAULT_ADMIN_EMAILS;
}
