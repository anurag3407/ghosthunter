import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAdminDb } from "@/lib/firebase/admin";

/**
 * ============================================================================
 * EQUITY PROJECT API - [id] route
 * ============================================================================
 * GET /api/equity/projects/[id] - Get single project
 * DELETE /api/equity/projects/[id] - Delete project with cascade
 */

/**
 * GET /api/equity/projects/[id]
 * Get a single equity project
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const adminDb = getAdminDb();
        if (!adminDb) {
            return NextResponse.json({ error: "Database not configured" }, { status: 503 });
        }

        const projectDoc = await adminDb.collection("equity_projects").doc(id).get();

        if (!projectDoc.exists) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const project = { id: projectDoc.id, ...projectDoc.data() } as { id: string; userId?: string;[key: string]: unknown };

        // Verify ownership
        if (project.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({ project });
    } catch (error) {
        console.error("[Equity:Projects] GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
    }
}

/**
 * DELETE /api/equity/projects/[id]
 * Delete an equity project and cascade delete all its transactions
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const adminDb = getAdminDb();
        if (!adminDb) {
            return NextResponse.json({ error: "Database not configured" }, { status: 503 });
        }

        // Fetch existing project
        const projectDoc = await adminDb.collection("equity_projects").doc(id).get();

        if (!projectDoc.exists) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const project = projectDoc.data();

        // Verify ownership
        if (project?.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        console.log(`[Equity:Projects] Deleting project ${id} with cascade...`);

        // Delete project document
        await adminDb.collection("equity_projects").doc(id).delete();

        // Cascade delete all transactions for this project
        const transactionsSnapshot = await adminDb
            .collection("equity_transactions")
            .where("projectId", "==", id)
            .get();

        const batch = adminDb.batch();
        transactionsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        console.log(`[Equity:Projects] ✓ Deleted project ${id} and ${transactionsSnapshot.size} transactions`);

        return NextResponse.json({
            success: true,
            message: `Project and ${transactionsSnapshot.size} transactions deleted successfully`
        });
    } catch (error) {
        console.error("[Equity:Projects] DELETE Error:", error);
        return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
    }
}
