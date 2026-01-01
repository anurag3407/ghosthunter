import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAdminDb } from "@/lib/firebase/admin";

/**
 * GET /api/code-police/projects
 * List all projects for the authenticated user
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
      .collection("projects")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const projects = projectsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/code-police/projects
 * Create a new project with Code Police enabled
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { githubRepoId, githubFullName, name, defaultBranch, language } = body;

    if (!githubRepoId || !githubFullName || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    // Check if project already exists
    const existingProject = await adminDb
      .collection("projects")
      .where("githubRepoId", "==", githubRepoId)
      .limit(1)
      .get();

    if (!existingProject.empty) {
      return NextResponse.json(
        { error: "Project already connected" },
        { status: 409 }
      );
    }

    // Generate webhook secret
    const webhookSecret = crypto.randomUUID();

    // Create project
    const projectRef = adminDb.collection("projects").doc();
    const project = {
      id: projectRef.id,
      userId,
      name,
      githubRepoId,
      githubFullName,
      githubOwner: githubFullName.split("/")[0],
      githubRepoName: githubFullName.split("/")[1],
      defaultBranch: defaultBranch || "main",
      language: language || null,
      webhookSecret,
      isActive: true,
      rulesProfile: {
        strictness: "moderate",
        categories: {
          security: true,
          performance: true,
          readability: true,
          bugs: true,
          tests: true,
          style: true,
        },
        ignorePatterns: ["node_modules/**", "*.min.js", "dist/**"],
        severityThreshold: "low",
      },
      notificationPrefs: {
        emailOnPush: true,
        emailOnPR: true,
        minSeverity: "medium",
        additionalEmails: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await projectRef.set(project);

    return NextResponse.json({ 
      project,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/github`,
      webhookSecret,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
