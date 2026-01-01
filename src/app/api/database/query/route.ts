import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { generateQuery } from "@/lib/agents/database/query-generator";
import { encrypt } from "@/lib/agents/database/encryption";
import type { DatabaseConnection, DatabaseType, DatabaseSchema } from "@/types";

/**
 * ============================================================================
 * DATABASE AGENT - QUERY ENDPOINT
 * ============================================================================
 * POST /api/database/query
 * 
 * Generates SQL/MongoDB queries from natural language.
 */

// Extended connection data stored in Firestore
interface StoredConnection extends Omit<DatabaseConnection, "encryptedCredentials"> {
  encryptedCredentials: string;
  schemaCache?: DatabaseSchema;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      connectionId,
      question,
      execute = false,
    } = body;

    if (!connectionId || !question) {
      return NextResponse.json(
        { error: "Missing required fields: connectionId, question" },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    // Get connection from Firestore
    const connectionDoc = await adminDb
      .collection("database_connections")
      .doc(connectionId)
      .get();

    if (!connectionDoc.exists) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    const connection = connectionDoc.data() as StoredConnection;

    if (connection.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get schema (use cached or empty)
    const schema: DatabaseSchema = connection.schemaCache || {
      tables: [],
      updatedAt: new Date().toISOString(),
    };

    // Generate query from natural language
    const result = await generateQuery(
      question,
      connection.type,
      schema,
      [] // Empty conversation history for now
    );

    // Store query in history (simplified - could add proper chat history)
    await adminDb
      .collection("database_connections")
      .doc(connectionId)
      .update({
        lastUsedAt: new Date(),
      });

    // Execute query if requested (placeholder)
    let queryResult: { rows?: unknown[]; error?: string } | null = null;

    if (execute && result.query) {
      queryResult = {
        error: "Query execution is not yet implemented. Please copy the query and run it in your database client.",
      };
    }

    return NextResponse.json({
      success: true,
      query: result.query,
      explanation: result.explanation,
      assumptions: result.assumptions,
      warnings: result.warnings,
      executed: execute,
      result: queryResult,
    });
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json(
      { error: "Failed to generate query" },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * DATABASE AGENT - CONNECTIONS ENDPOINT
 * ============================================================================
 * GET /api/database/query - List connections
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get("id");

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    if (connectionId) {
      // Get single connection
      const doc = await adminDb.collection("database_connections").doc(connectionId).get();
      
      if (!doc.exists) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const data = doc.data() as StoredConnection | undefined;
      if (!data || data.userId !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      // Don't return encrypted credentials
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { encryptedCredentials: _, ...safeConnection } = data;
      return NextResponse.json({ connection: { ...safeConnection, connectionId: doc.id } });
    }

    // Get all connections for user
    const snapshot = await adminDb
      .collection("database_connections")
      .where("userId", "==", userId)
      .orderBy("lastUsedAt", "desc")
      .get();

    const connections = snapshot.docs.map((doc: { id: string; data: () => Record<string, unknown> }) => {
      const data = doc.data() as unknown as StoredConnection;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { encryptedCredentials: _, ...safeData } = data;
      return { connectionId: doc.id, ...safeData };
    });

    return NextResponse.json({ connections });
  } catch (error) {
    console.error("Fetch connections error:", error);
    return NextResponse.json(
      { error: "Failed to fetch connections" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/database/query - Create or update connection
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      name,
      type,
      host,
      port,
      database,
      username,
      password,
      schema,
    } = body;

    if (!name || !type || !host || !database) {
      return NextResponse.json(
        { error: "Missing required fields: name, type, host, database" },
        { status: 400 }
      );
    }

    // Encrypt password if provided
    const encryptedPassword = password ? encrypt(password) : undefined;

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const connectionData = {
      userId,
      name,
      type: type as DatabaseType,
      host,
      port: port || getDefaultPort(type),
      database,
      username,
      password: encryptedPassword,
      schema,
      isConnected: false,
      lastUsed: new Date(),
      queryHistory: [],
    };

    if (id) {
      // Update existing
      const docRef = adminDb.collection("database_connections").doc(id);
      const doc = await docRef.get();

      if (!doc.exists || doc.data()?.userId !== userId) {
        return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
      }

      await docRef.update({
        ...connectionData,
        updatedAt: new Date(),
      });

      return NextResponse.json({ success: true, id });
    }

    // Create new
    const docRef = await adminDb.collection("database_connections").add({
      ...connectionData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("Save connection error:", error);
    return NextResponse.json(
      { error: "Failed to save connection" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/database/query - Delete connection
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
      return NextResponse.json({ error: "Connection ID required" }, { status: 400 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const docRef = adminDb.collection("database_connections").doc(connectionId);
    const doc = await docRef.get();

    if (!doc.exists || doc.data()?.userId !== userId) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete connection error:", error);
    return NextResponse.json(
      { error: "Failed to delete connection" },
      { status: 500 }
    );
  }
}

function getDefaultPort(type: string): number {
  switch (type) {
    case "postgresql":
      return 5432;
    case "mysql":
      return 3306;
    case "mongodb":
      return 27017;
    default:
      return 5432;
  }
}
