import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { encryptCredentials } from "@/lib/agents/database/encryption";

/**
 * GET /api/database/connections
 * List all database connections for the user
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

    const connectionsSnapshot = await adminDb
      .collection("database_connections")
      .where("userId", "==", userId)
      .orderBy("lastUsedAt", "desc")
      .get();

    const connections = connectionsSnapshot.docs.map((doc) => {
      const data = doc.data();
      // Don't return encrypted credentials
      return {
        id: doc.id,
        name: data.name,
        type: data.type,
        host: data.host,
        port: data.port,
        database: data.database,
        lastUsedAt: data.lastUsedAt?.toDate?.()?.toISOString() || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json({ connections });
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      { error: "Failed to fetch connections" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/database/connections
 * Create a new database connection
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, host, port, database, username, password } = body;

    if (!name || !type || !host || !port || !database || !username || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Encrypt credentials
    const encryptedCredentials = encryptCredentials({
      host,
      port,
      database,
      username,
      password,
    });

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    // Create connection document
    const connectionRef = adminDb.collection("database_connections").doc();
    const connection = {
      id: connectionRef.id,
      userId,
      name,
      type,
      host,
      port,
      database,
      encryptedCredentials,
      createdAt: new Date(),
      lastUsedAt: new Date(),
    };

    await connectionRef.set(connection);

    return NextResponse.json({
      connection: {
        id: connection.id,
        name: connection.name,
        type: connection.type,
        host: connection.host,
        port: connection.port,
        database: connection.database,
      },
    });
  } catch (error) {
    console.error("Error creating connection:", error);
    return NextResponse.json(
      { error: "Failed to create connection" },
      { status: 500 }
    );
  }
}
