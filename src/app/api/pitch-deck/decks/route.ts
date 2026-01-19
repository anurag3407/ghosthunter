import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAdminDb } from "@/lib/firebase/admin";

/**
 * GET /api/pitch-deck/decks
 * Fetch all pitch decks for the authenticated user
 */
export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminDb = getAdminDb();
        if (!adminDb) {
            return NextResponse.json({ decks: [] });
        }

        const decksSnapshot = await adminDb
            .collection("pitch-decks")
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .get();

        const decks = decksSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                projectName: data.projectName,
                tagline: data.tagline,
                status: data.status || "draft",
                slidesCount: data.slides?.length || 0,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
            };
        });

        return NextResponse.json({ decks });
    } catch (error) {
        console.error("[PitchDeck:Decks] GET Error:", error);
        return NextResponse.json({ decks: [] });
    }
}
