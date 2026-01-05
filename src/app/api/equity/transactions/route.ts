import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAdminDb } from "@/lib/firebase/admin";

/**
 * GET /api/equity/transactions
 * Get transaction history for a user or project
 * Query params:
 *   - projectId: Get transactions for a specific project
 *   - type: Filter by 'mint' or 'transfer'
 *   - limit: Number of transactions to return (default: 50)
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "50");

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    // Build query - simplified to avoid compound index requirements
    // Firestore requires composite indexes for multiple where + orderBy
    // For now, we just filter by the primary field and sort in memory
    let query: FirebaseFirestore.Query = adminDb.collection("equity_transactions");
    
    if (projectId) {
      // When projectId is provided, filter by projectId only
      query = query.where("projectId", "==", projectId);
    }
    // Note: If no projectId, we fetch all and filter by userId in memory

    const snapshot = await query.get();

    // Define transaction type
    interface TransactionData {
      id: string;
      projectId?: string;
      userId?: string;
      type?: string;
      from?: string;
      to?: string;
      amount?: string;
      percentage?: number | null;
      txHash?: string;
      createdAt: string | null;
    }

    // Filter and transform results
    let transactions: TransactionData[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      } as TransactionData;
    });

    // Apply in-memory filters if no projectId was specified
    if (!projectId) {
      transactions = transactions.filter((t) => t.userId === userId);
    }

    // Apply type filter if provided
    if (type && (type === "mint" || type === "transfer")) {
      transactions = transactions.filter((t) => t.type === type);
    }

    // Sort by createdAt descending
    transactions.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    // Apply limit
    transactions = transactions.slice(0, limit);

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("[Equity:Transactions] GET Error:", error);
    
    // Check if it's a Firebase index error and provide helpful message
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("index")) {
      return NextResponse.json(
        { 
          error: "Database index required. Please deploy Firestore indexes.",
          details: errorMessage
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/equity/transactions
 * Record a new transaction (mint or transfer)
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, type, from, to, amount, percentage, txHash } = body;

    if (!projectId || !type || !to || !amount || !txHash) {
      return NextResponse.json(
        { error: "Missing required fields: projectId, type, to, amount, txHash" },
        { status: 400 }
      );
    }

    if (type !== "mint" && type !== "transfer") {
      return NextResponse.json(
        { error: "Type must be 'mint' or 'transfer'" },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const transactionRef = adminDb.collection("equity_transactions").doc();
    const transaction = {
      id: transactionRef.id,
      projectId,
      type,
      from: from || "0x0000000000000000000000000000000000000000", // Zero address for mints
      to,
      amount: amount.toString(),
      percentage: percentage || null,
      txHash,
      userId,
      createdAt: new Date(),
    };

    await transactionRef.set(transaction);

    return NextResponse.json({
      transaction: {
        ...transaction,
        createdAt: transaction.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[Equity:Transactions] POST Error:", error);
    return NextResponse.json(
      { error: "Failed to record transaction" },
      { status: 500 }
    );
  }
}
