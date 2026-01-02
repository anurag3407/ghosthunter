import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { testConnection, detectDatabaseType } from "@/lib/agents/database/universal-schema";

/**
 * ============================================================================
 * DATABASE TEST CONNECTION API
 * ============================================================================
 * Test database connectivity with auto-detection support.
 */

/**
 * POST /api/database/test
 * Test a database connection
 * Supports both connection string mode and form mode
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { connectionString, type, host, port, database, username, password } = body;

    // Connection string mode
    if (connectionString) {
      const result = await testConnection(connectionString);
      
      return NextResponse.json({
        success: result.success,
        type: result.type,
        latency: result.latency,
        message: result.success ? "Connection successful" : result.error,
        error: result.success ? undefined : result.error,
      });
    }

    // Form mode - build connection string and test
    if (!type || !host || !port || !database || !username || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Build connection string based on type
    let builtConnectionString: string;
    
    if (type === "mongodb") {
      builtConnectionString = `mongodb://${username}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
    } else if (type === "supabase") {
      builtConnectionString = `postgresql://${username}:${encodeURIComponent(password)}@${host}:${port}/${database}?sslmode=require`;
    } else if (type === "postgresql") {
      builtConnectionString = `postgresql://${username}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
    } else if (type === "mysql") {
      // MySQL still needs special handling
      try {
        const mysql = await import("mysql2/promise");
        const connection = await mysql.createConnection({
          host,
          port,
          database,
          user: username,
          password,
          connectTimeout: 5000,
        });
        
        const startTime = Date.now();
        await connection.query("SELECT 1");
        const latency = Date.now() - startTime;
        await connection.end();
        
        return NextResponse.json({
          success: true,
          type: "mysql",
          latency,
          message: "Connection successful",
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          type: "mysql",
          error: error instanceof Error ? error.message : "Connection failed",
        });
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported database type" },
        { status: 400 }
      );
    }

    // Test using universal schema tester
    const result = await testConnection(builtConnectionString);
    
    return NextResponse.json({
      success: result.success,
      type: type,
      latency: result.latency,
      message: result.success ? "Connection successful" : result.error,
      error: result.success ? undefined : result.error,
    });
  } catch (error) {
    console.error("Error testing connection:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to test connection" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/database/test/detect
 * Detect database type from connection string
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const connectionString = searchParams.get("connectionString");

    if (!connectionString) {
      return NextResponse.json(
        { error: "connectionString is required" },
        { status: 400 }
      );
    }

    const type = detectDatabaseType(connectionString);

    return NextResponse.json({ type });
  } catch (error) {
    console.error("Error detecting database type:", error);
    return NextResponse.json(
      { error: "Failed to detect database type" },
      { status: 500 }
    );
  }
}

