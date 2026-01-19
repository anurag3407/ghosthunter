import { getAdminDb } from "@/lib/firebase/admin";

/**
 * ============================================================================
 * NOTIFICATION SERVICE
 * ============================================================================
 * Centralized service for creating and managing in-app notifications.
 * Notifications are stored in Firestore and displayed in the dashboard.
 */

export type NotificationType =
    | "code_analysis"
    | "critical_issues"
    | "auto_fix"
    | "repo_connected"
    | "equity_transfer"
    | "equity_mint"
    | "pitch_deck"
    | "general";

export interface NotificationData {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
}

/**
 * Create a new notification in Firestore
 */
export async function createNotification(data: NotificationData): Promise<string | null> {
    const adminDb = getAdminDb();
    if (!adminDb) {
        console.error("[Notifications] Database not configured");
        return null;
    }

    try {
        const notificationRef = adminDb.collection("notifications").doc();

        await notificationRef.set({
            id: notificationRef.id,
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            metadata: data.metadata || {},
            isRead: false,
            createdAt: new Date(),
        });

        console.log("[Notifications] Created notification:", notificationRef.id, "for user:", data.userId);
        return notificationRef.id;
    } catch (error) {
        console.error("[Notifications] Error creating notification:", error);
        return null;
    }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
    const adminDb = getAdminDb();
    if (!adminDb) return false;

    try {
        await adminDb.collection("notifications").doc(notificationId).update({
            isRead: true,
            readAt: new Date(),
        });
        return true;
    } catch (error) {
        console.error("[Notifications] Error marking as read:", error);
        return false;
    }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
    const adminDb = getAdminDb();
    if (!adminDb) return false;

    try {
        const snapshot = await adminDb
            .collection("notifications")
            .where("userId", "==", userId)
            .where("isRead", "==", false)
            .get();

        if (snapshot.empty) return true;

        const batch = adminDb.batch();
        snapshot.docs.forEach((doc) => {
            batch.update(doc.ref, { isRead: true, readAt: new Date() });
        });
        await batch.commit();

        console.log("[Notifications] Marked", snapshot.size, "notifications as read for user:", userId);
        return true;
    } catch (error) {
        console.error("[Notifications] Error marking all as read:", error);
        return false;
    }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
    const adminDb = getAdminDb();
    if (!adminDb) return false;

    try {
        await adminDb.collection("notifications").doc(notificationId).delete();
        return true;
    } catch (error) {
        console.error("[Notifications] Error deleting notification:", error);
        return false;
    }
}

// ============================================================================
// HELPER FUNCTIONS FOR COMMON NOTIFICATION TYPES
// ============================================================================

/**
 * Notify about completed code analysis
 */
export async function notifyCodeAnalysisComplete(
    userId: string,
    repoName: string,
    issueCounts: { critical: number; high: number; medium: number; low: number; info: number },
    analysisRunId: string
): Promise<void> {
    const total = issueCounts.critical + issueCounts.high + issueCounts.medium + issueCounts.low + issueCounts.info;
    const hasCritical = issueCounts.critical > 0;
    const hasHigh = issueCounts.high > 0;

    // Create main analysis notification
    await createNotification({
        userId,
        type: hasCritical ? "critical_issues" : "code_analysis",
        title: hasCritical ? "⚠️ Critical Issues Found" : "Code Analysis Complete",
        message: total === 0
            ? `No issues found in ${repoName}. Great job!`
            : `Found ${total} issue${total > 1 ? "s" : ""} in ${repoName}: ${issueCounts.critical} critical, ${issueCounts.high} high, ${issueCounts.medium} medium`,
        metadata: {
            repoName,
            analysisRunId,
            issueCounts,
        },
    });
}

/**
 * Notify about auto-fix PR created
 */
export async function notifyAutoFixPRCreated(
    userId: string,
    repoName: string,
    prNumber: number,
    prUrl: string,
    fixesGenerated: number
): Promise<void> {
    await createNotification({
        userId,
        type: "auto_fix",
        title: "🔧 Auto-Fix PR Created",
        message: `Created PR #${prNumber} with ${fixesGenerated} fix${fixesGenerated > 1 ? "es" : ""} for ${repoName}`,
        metadata: {
            repoName,
            prNumber,
            prUrl,
            fixesGenerated,
        },
    });
}

/**
 * Notify about repository connected
 */
export async function notifyRepoConnected(
    userId: string,
    repoFullName: string,
    projectId: string
): Promise<void> {
    await createNotification({
        userId,
        type: "repo_connected",
        title: "Repository Connected",
        message: `${repoFullName} is now connected to Code Police. Push code to start analyzing.`,
        metadata: {
            repoFullName,
            projectId,
        },
    });
}

/**
 * Notify about equity token transfer
 */
export async function notifyEquityTransfer(
    userId: string,
    projectName: string,
    amount: string,
    toAddress: string,
    txHash: string
): Promise<void> {
    const shortAddress = `${toAddress.slice(0, 6)}...${toAddress.slice(-4)}`;

    await createNotification({
        userId,
        type: "equity_transfer",
        title: "Token Transfer Complete",
        message: `Transferred ${parseInt(amount).toLocaleString()} tokens to ${shortAddress} for ${projectName}`,
        metadata: {
            projectName,
            amount,
            toAddress,
            txHash,
        },
    });
}

/**
 * Notify about equity project minted
 */
export async function notifyEquityMint(
    userId: string,
    projectName: string,
    symbol: string,
    totalSupply: string,
    contractAddress: string
): Promise<void> {
    await createNotification({
        userId,
        type: "equity_mint",
        title: "🎉 Equity Tokens Minted",
        message: `Minted ${parseInt(totalSupply).toLocaleString()} ${symbol} tokens for ${projectName}`,
        metadata: {
            projectName,
            symbol,
            totalSupply,
            contractAddress,
        },
    });
}

/**
 * Notify about pitch deck generated
 */
export async function notifyPitchDeckGenerated(
    userId: string,
    projectName: string,
    deckId: string,
    slideCount: number
): Promise<void> {
    await createNotification({
        userId,
        type: "pitch_deck",
        title: "Pitch Deck Ready",
        message: `Your pitch deck for ${projectName} is ready with ${slideCount} slides`,
        metadata: {
            projectName,
            deckId,
            slideCount,
        },
    });
}
