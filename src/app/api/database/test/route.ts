import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * POST /api/database/test
 * Test a database connection
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, host, port, database, username, password } = body;

    if (!type || !host || !port || !database || !username || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Test connection based on database type
    try {
      if (type === "postgresql") {
        const { Pool } = await import("pg");
        const pool = new Pool({
          host,
          port,
          database,
          user: username,
          password,
          connectionTimeoutMillis: 5000,
        });
        
        await pool.query("SELECT 1");
        await pool.end();
      } else if (type === "mysql") {
        const mysql = await import("mysql2/promise");
        const connection = await mysql.createConnection({
          host,
          port,
          database,
          user: username,
          password,
          connectTimeout: 5000,
        });
        
        await connection.query("SELECT 1");
        await connection.end();
      } else if (type === "mongodb") {
        const { MongoClient } = await import("mongodb");
        const uri = `mongodb://${username}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
        const client = new MongoClient(uri, {
          serverSelectionTimeoutMS: 5000,
        });
        
        await client.connect();
        await client.db().command({ ping: 1 });
        await client.close();
      } else {
        return NextResponse.json(
          { error: "Unsupported database type" },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, message: "Connection successful" });
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { error: dbError instanceof Error ? dbError.message : "Connection failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error testing connection:", error);
    return NextResponse.json(
      { error: "Failed to test connection" },
      { status: 500 }
    );
  }
}
