import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAdminDb } from "@/lib/firebase/admin";

/**
 * GET /api/equity/check-minted?repoId=123
 * Check if tokens have already been minted for a specific repository
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const repoId = searchParams.get("repoId");
    const repoFullName = searchParams.get("repoFullName");

    if (!repoId && !repoFullName) {
      return NextResponse.json(
        { error: "Missing repoId or repoFullName parameter" },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    // Query for existing project with this repo
    let query = adminDb.collection("equity_projects");
    
    if (repoId) {
      query = query.where("githubRepoId", "==", parseInt(repoId)) as typeof query;
    } else if (repoFullName) {
      query = query.where("githubRepoFullName", "==", repoFullName) as typeof query;
    }

    const snapshot = await query.limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json({
        minted: false,
        message: "No tokens have been minted for this repository yet.",
      });
    }

    const doc = snapshot.docs[0];
    const project = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    };

    return NextResponse.json({
      minted: true,
      project,
      message: "Tokens have already been minted for this repository.",
    });
  } catch (error) {
    console.error("[Equity:CheckMinted] Error:", error);
    return NextResponse.json(
      { error: "Failed to check minting status" },
      { status: 500 }
    );
  }
}
