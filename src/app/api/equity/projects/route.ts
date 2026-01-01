import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAdminDb } from "@/lib/firebase/admin";

/**
 * GET /api/equity/projects
 * Fetch all equity projects for the authenticated user
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const projectsSnapshot = await adminDb
      .collection("equity_projects")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const projects = projectsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        symbol: data.symbol,
        contractAddress: data.contractAddress,
        totalSupply: data.totalSupply,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching equity projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/equity/projects
 * Create a new equity project
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, symbol, contractAddress, totalSupply } = body;

    if (!name || !symbol || !contractAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const projectRef = adminDb.collection("equity_projects").doc();
    const project = {
      id: projectRef.id,
      userId,
      name,
      symbol,
      contractAddress,
      totalSupply: totalSupply || "0",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await projectRef.set(project);

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Error creating equity project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
