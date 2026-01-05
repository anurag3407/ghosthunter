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
 * Create a new equity project linked to a GitHub repository
 * Only the repository owner can create a project, and only once per repo
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      name, 
      symbol, 
      contractAddress, 
      totalSupply,
      githubRepoId,
      githubRepoFullName,
      githubRepoOwner,
      ownerWalletAddress,
    } = body;

    // Validate required fields
    if (!name || !symbol || !contractAddress) {
      return NextResponse.json(
        { error: "Missing required fields: name, symbol, contractAddress" },
        { status: 400 }
      );
    }

    if (!githubRepoId || !githubRepoFullName || !githubRepoOwner) {
      return NextResponse.json(
        { error: "Missing required GitHub fields: githubRepoId, githubRepoFullName, githubRepoOwner" },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    // Check if tokens have already been minted for this repository
    const existingProjectSnapshot = await adminDb
      .collection("equity_projects")
      .where("githubRepoId", "==", githubRepoId)
      .limit(1)
      .get();

    if (!existingProjectSnapshot.empty) {
      return NextResponse.json(
        { error: "Tokens have already been minted for this repository" },
        { status: 409 }
      );
    }

    const projectRef = adminDb.collection("equity_projects").doc();
    const project = {
      id: projectRef.id,
      userId,
      name,
      symbol,
      contractAddress,
      totalSupply: totalSupply || "1000000",
      githubRepoId,
      githubRepoFullName,
      githubRepoOwner,
      ownerWalletAddress: ownerWalletAddress || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await projectRef.set(project);

    return NextResponse.json({ 
      project: {
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      }
    });
  } catch (error) {
    console.error("Error creating equity project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

