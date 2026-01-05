import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAdminDb } from "@/lib/firebase/admin";

/**
 * GET /api/equity/portfolio
 * Get the user's equity portfolio from Firestore.
 * Note: Primary balance data should come from the blockchain via wallet.
 * This API provides supplementary project metadata.
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminDb = getAdminDb();
    
    // If database is not configured, return empty portfolio (not an error)
    if (!adminDb) {
      console.log("[Equity:Portfolio] Database not configured, returning empty portfolio");
      return NextResponse.json({
        portfolio: {
          ownedProjects: [],
          receivedTokens: [],
          recentTransactions: [],
          summary: {
            totalProjectsOwned: 0,
            totalMintedTokens: 0,
            totalTransactions: 0,
          },
        },
      });
    }

    // Get projects created by user
    let ownedProjects: Array<{
      id: string;
      name?: string;
      symbol?: string;
      contractAddress?: string;
      totalSupply?: string;
      githubRepoFullName?: string;
      createdAt: string | null;
      role: "owner";
    }> = [];
    
    try {
      const ownedProjectsSnapshot = await adminDb
        .collection("equity_projects")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

      ownedProjects = ownedProjectsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          symbol: data.symbol,
          contractAddress: data.contractAddress,
          totalSupply: data.totalSupply,
          githubRepoFullName: data.githubRepoFullName,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          role: "owner" as const,
        };
      });
    } catch (projectsError) {
      console.log("[Equity:Portfolio] Could not fetch projects:", projectsError);
      // Continue with empty projects
    }

    // Get recent transactions (simplified query without complex filters)
    let recentTransactions: Array<{
      id: string;
      type?: string;
      amount?: string;
      from?: string;
      to?: string;
      txHash?: string;
      createdAt: string | null;
    }> = [];
    
    try {
      const recentTransactionsSnapshot = await adminDb
        .collection("equity_transactions")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();

      recentTransactions = recentTransactionsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type,
          amount: data.amount,
          from: data.from,
          to: data.to,
          txHash: data.txHash,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        };
      });
    } catch (txError) {
      console.log("[Equity:Portfolio] Could not fetch transactions:", txError);
      // Continue with empty transactions - index might not exist yet
    }

    // Calculate summary stats
    const totalProjectsOwned = ownedProjects.length;
    const totalMintedTokens = ownedProjects.reduce(
      (sum, p) => sum + parseInt(p.totalSupply || "0"),
      0
    );

    return NextResponse.json({
      portfolio: {
        ownedProjects,
        receivedTokens: [], // Received tokens should be fetched from blockchain
        recentTransactions,
        summary: {
          totalProjectsOwned,
          totalMintedTokens,
          totalTransactions: recentTransactions.length,
        },
      },
    });
  } catch (error) {
    console.error("[Equity:Portfolio] Error:", error);
    // Return empty portfolio instead of 500 error for better UX
    return NextResponse.json({
      portfolio: {
        ownedProjects: [],
        receivedTokens: [],
        recentTransactions: [],
        summary: {
          totalProjectsOwned: 0,
          totalMintedTokens: 0,
          totalTransactions: 0,
        },
      },
    });
  }
}
