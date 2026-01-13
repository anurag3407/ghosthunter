import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAdminDb } from "@/lib/firebase/admin";
import {
    getUniversalSchema,
    getCachedOrFetchSchema,
    detectDatabaseType,
    invalidateSchemaCache
} from "@/lib/agents/database/universal-schema";
import { decrypt } from "@/lib/agents/database/encryption";

/**
 * ============================================================================
 * DATABASE AGENT - SCHEMA DEBUG ENDPOINT
 * ============================================================================
 * Debug endpoint to check schema status and force refresh
 */

/**
 * GET /api/database/debug?connectionId=xxx
 * Get schema debug info for a connection
 */
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const connectionId = searchParams.get("connectionId");
        const forceRefresh = searchParams.get("refresh") === "true";

        if (!connectionId) {
            return NextResponse.json(
                { error: "connectionId is required. Use: /api/database/debug?connectionId=YOUR_ID" },
                { status: 400 }
            );
        }

        const adminDb = getAdminDb();
        if (!adminDb) {
            return NextResponse.json({ error: "Database not configured" }, { status: 503 });
        }

        // Get connection details
        const connectionDoc = await adminDb
            .collection("database_connections")
            .doc(connectionId)
            .get();

        if (!connectionDoc.exists) {
            return NextResponse.json(
                { error: "Connection not found" },
                { status: 404 }
            );
        }

        const connection = connectionDoc.data()!;

        // Verify user owns this connection
        if (connection.userId !== userId) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }

        // Decrypt connection string
        let connectionString: string;
        if (connection.encryptedUri) {
            connectionString = decrypt(connection.encryptedUri);
        } else if (connection.encryptedCredentials) {
            const creds = JSON.parse(decrypt(connection.encryptedCredentials));
            if (connection.type === "mongodb") {
                connectionString = `mongodb://${creds.username}:${encodeURIComponent(creds.password)}@${creds.host}:${creds.port}/${creds.database}`;
            } else {
                connectionString = `postgresql://${creds.username}:${encodeURIComponent(creds.password)}@${creds.host}:${creds.port}/${creds.database}`;
            }
        } else {
            return NextResponse.json(
                { error: "Connection credentials not found" },
                { status: 400 }
            );
        }

        const dbType = detectDatabaseType(connectionString);

        // Force refresh if requested
        if (forceRefresh) {
            console.log("[Debug] Force refreshing schema...");
            await invalidateSchemaCache(connectionId);
        }

        // Check cached schema
        const cachedSchemaData = connection.cachedSchema;

        // Get fresh schema
        console.log("[Debug] Fetching schema...");
        let schema;
        let schemaError = null;

        try {
            schema = await getCachedOrFetchSchema(connectionId, connectionString, forceRefresh);
        } catch (err) {
            schemaError = err instanceof Error ? err.message : String(err);
            console.error("[Debug] Schema fetch error:", err);
        }

        // Build debug response
        const debugInfo = {
            connectionId,
            connectionName: connection.name,
            databaseType: dbType,
            cache: {
                hasCached: !!cachedSchemaData,
                cachedAt: cachedSchemaData?.cachedAt || null,
                cacheAgeMinutes: cachedSchemaData?.cachedAt
                    ? Math.round((Date.now() - new Date(cachedSchemaData.cachedAt).getTime()) / 60000)
                    : null,
            },
            schema: schema ? {
                tablesCount: schema.tables.length,
                tables: schema.tables.map(t => ({
                    name: t.name,
                    fieldsCount: t.fields.length,
                    fields: t.fields.slice(0, 10).map(f => `${f.name}: ${f.type}`),
                })),
                schemaString: schema.schema.substring(0, 1000) + (schema.schema.length > 1000 ? "..." : ""),
                updatedAt: schema.updatedAt,
            } : null,
            error: schemaError,
            instructions: {
                forceRefresh: "Add ?refresh=true to force schema refresh",
                example: `/api/database/debug?connectionId=${connectionId}&refresh=true`,
            }
        };

        return NextResponse.json(debugInfo);
    } catch (error) {
        console.error("Error in schema debug:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Debug failed" },
            { status: 500 }
        );
    }
}
