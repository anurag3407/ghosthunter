import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { encrypt, encryptCredentials } from "@/lib/agents/database/encryption";
import { detectDatabaseType } from "@/lib/agents/database/universal-schema";

/**
 * ============================================================================
 * DATABASE CONNECTIONS API
 * ============================================================================
 * Manage database connections with encrypted storage.
 */

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
        conversationsCount: data.conversationsCount || 0,
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
 * Supports both connection string mode and form mode
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, connectionString, host, port, database, username, password } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Connection name is required" },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    let connectionData: Record<string, unknown>;

    if (connectionString) {
      // Connection string mode - auto-detect type
      const detectedType = detectDatabaseType(connectionString);
      const encryptedUri = encrypt(connectionString);
      
      // Extract host and database from connection string for display
      let displayHost = "Unknown";
      let displayDatabase = "Unknown";
      
      try {
        const url = new URL(connectionString);
        displayHost = url.hostname;
        displayDatabase = url.pathname.replace(/^\//, "").split("?")[0] || url.searchParams.get("database") || "default";
      } catch {
        // If URL parsing fails, try regex extraction
        const hostMatch = connectionString.match(/@([^:\/]+)/);
        const dbMatch = connectionString.match(/\/([^?\/]+)/);
        if (hostMatch) displayHost = hostMatch[1];
        if (dbMatch) displayDatabase = dbMatch[1];
      }

      connectionData = {
        userId,
        name,
        type: type || detectedType,
        host: displayHost,
        database: displayDatabase,
        encryptedUri,
        conversationsCount: 0,
        createdAt: new Date(),
        lastUsedAt: new Date(),
      };
    } else {
      // Form mode - require all fields
      if (!type || !host || !port || !database || !username || !password) {
        return NextResponse.json(
          { error: "Missing required fields for manual connection" },
          { status: 400 }
        );
      }

      // Build connection string based on type
      let builtConnectionString: string;
      if (type === "mongodb") {
        builtConnectionString = `mongodb://${username}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
      } else {
        builtConnectionString = `postgresql://${username}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
      }

      // Encrypt the connection string
      const encryptedUri = encrypt(builtConnectionString);

      // Also encrypt legacy format for backward compatibility
      const encryptedCredentials = encryptCredentials({
        host,
        port,
        database,
        username,
        password,
      });

      connectionData = {
        userId,
        name,
        type,
        host,
        port,
        database,
        encryptedUri,
        encryptedCredentials,
        conversationsCount: 0,
        createdAt: new Date(),
        lastUsedAt: new Date(),
      };
    }

    // Create connection document
    const connectionRef = adminDb.collection("database_connections").doc();
    await connectionRef.set({
      id: connectionRef.id,
      ...connectionData,
    });

    return NextResponse.json({
      connection: {
        id: connectionRef.id,
        name: connectionData.name,
        type: connectionData.type,
        host: connectionData.host,
        database: connectionData.database,
      },
    });
  } catch (error) {
    console.error("Error creating connection:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create connection" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/database/connections?id=xxx
 * Delete a database connection
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get("id");

    if (!connectionId) {
      return NextResponse.json(
        { error: "Connection ID is required" },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    // Verify ownership
    const connectionDoc = await adminDb
      .collection("database_connections")
      .doc(connectionId)
      .get();

    if (!connectionDoc.exists) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    const connection = connectionDoc.data()!;
    if (connection.userId !== userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Delete the connection
    await adminDb.collection("database_connections").doc(connectionId).delete();

    // Also delete associated conversations
    const conversationsSnapshot = await adminDb
      .collection("database_conversations")
      .where("connectionId", "==", connectionId)
      .get();

    const batch = adminDb.batch();
    conversationsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting connection:", error);
    return NextResponse.json(
      { error: "Failed to delete connection" },
      { status: 500 }
    );
  }
}

