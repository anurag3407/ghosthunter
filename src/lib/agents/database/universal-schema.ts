/**
 * ============================================================================
 * UNIVERSAL SCHEMA LOADER
 * ============================================================================
 * Auto-detect database type and fetch schema from PostgreSQL/Supabase or MongoDB.
 */

import { Pool } from "pg";
import { MongoClient } from "mongodb";

export type DetectedDatabaseType = "postgres" | "mongodb" | "supabase";

export interface UniversalSchema {
  type: DetectedDatabaseType;
  schema: string; // Minified schema string for AI context
  tables: TableInfo[];
  updatedAt: string;
}

export interface TableInfo {
  name: string;
  fields: FieldInfo[];
}

export interface FieldInfo {
  name: string;
  type: string;
  nullable?: boolean;
}

/**
 * Detect database type from connection string
 */
export function detectDatabaseType(connectionString: string): DetectedDatabaseType {
  const trimmed = connectionString.trim().toLowerCase();
  
  // MongoDB detection
  if (trimmed.startsWith("mongodb://") || trimmed.startsWith("mongodb+srv://")) {
    return "mongodb";
  }
  
  // Supabase detection (has supabase.co in the host)
  if (trimmed.includes("supabase.co") || trimmed.includes("supabase.com")) {
    return "supabase";
  }
  
  // PostgreSQL detection
  if (trimmed.startsWith("postgres://") || trimmed.startsWith("postgresql://")) {
    return "postgres";
  }
  
  // Default to postgres for other SQL-like strings
  return "postgres";
}

/**
 * Get universal schema from any supported database
 */
export async function getUniversalSchema(
  connectionString: string
): Promise<UniversalSchema> {
  const type = detectDatabaseType(connectionString);
  
  if (type === "mongodb") {
    return getMongoDBSchema(connectionString);
  } else {
    return getPostgresSchema(connectionString, type);
  }
}

/**
 * Fetch PostgreSQL/Supabase schema
 */
async function getPostgresSchema(
  connectionString: string,
  type: "postgres" | "supabase"
): Promise<UniversalSchema> {
  const pool = new Pool({
    connectionString,
    ssl: type === "supabase" ? { rejectUnauthorized: false } : false,
    max: 1,
    connectionTimeoutMillis: 10000,
  });

  try {
    // Query information_schema for tables and columns
    const query = `
      SELECT 
        t.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable
      FROM information_schema.tables t
      JOIN information_schema.columns c 
        ON t.table_name = c.table_name 
        AND t.table_schema = c.table_schema
      WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_name, c.ordinal_position;
    `;

    const result = await pool.query(query);
    
    // Group by table
    const tableMap = new Map<string, FieldInfo[]>();
    
    for (const row of result.rows) {
      const tableName = row.table_name;
      if (!tableMap.has(tableName)) {
        tableMap.set(tableName, []);
      }
      tableMap.get(tableName)!.push({
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === "YES",
      });
    }

    const tables: TableInfo[] = [];
    for (const [name, fields] of tableMap) {
      tables.push({ name, fields });
    }

    // Create minified schema string
    const schema = minifySchema(tables, type);

    return {
      type,
      schema,
      tables,
      updatedAt: new Date().toISOString(),
    };
  } finally {
    await pool.end();
  }
}

/**
 * Fetch MongoDB schema by sampling collections
 */
async function getMongoDBSchema(connectionString: string): Promise<UniversalSchema> {
  const client = new MongoClient(connectionString, {
    connectTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  });

  try {
    await client.connect();
    
    // Extract database name from connection string
    const dbName = extractMongoDbName(connectionString);
    const db = client.db(dbName);
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    const tables: TableInfo[] = [];

    for (const collInfo of collections) {
      // Skip system collections
      if (collInfo.name.startsWith("system.")) {
        continue;
      }
      
      const collection = db.collection(collInfo.name);
      
      // Sample one document to infer schema
      const sampleDoc = await collection.findOne();
      
      if (sampleDoc) {
        const fields = inferMongoFields(sampleDoc);
        tables.push({
          name: collInfo.name,
          fields,
        });
      } else {
        // Empty collection
        tables.push({
          name: collInfo.name,
          fields: [{ name: "_id", type: "ObjectId" }],
        });
      }
    }

    // Create minified schema string
    const schema = minifySchema(tables, "mongodb");

    return {
      type: "mongodb",
      schema,
      tables,
      updatedAt: new Date().toISOString(),
    };
  } finally {
    await client.close();
  }
}

/**
 * Extract database name from MongoDB connection string
 * Handles both mongodb:// and mongodb+srv:// formats
 */
function extractMongoDbName(connectionString: string): string {
  try {
    // For mongodb+srv:// URLs, the database name is in the pathname
    const url = new URL(connectionString);
    const pathname = url.pathname;
    
    if (pathname && pathname.length > 1) {
      // Remove leading slash and any query params
      const dbName = pathname.substring(1).split("?")[0];
      if (dbName && dbName.length > 0) {
        return dbName;
      }
    }
    
    // Check if database is specified in query params
    const dbFromParams = url.searchParams.get("authSource") || url.searchParams.get("database");
    if (dbFromParams) {
      return dbFromParams;
    }
    
    // Default to sample_mflix for MongoDB sample data
    return "sample_mflix";
  } catch {
    return "test";
  }
}

/**
 * Infer field types from a MongoDB document
 */
function inferMongoFields(doc: Record<string, unknown>, prefix = ""): FieldInfo[] {
  const fields: FieldInfo[] = [];
  
  for (const [key, value] of Object.entries(doc)) {
    const fieldName = prefix ? `${prefix}.${key}` : key;
    const fieldType = getMongoFieldType(value);
    
    fields.push({
      name: fieldName,
      type: fieldType,
    });
    
    // Recurse into nested objects (not too deep to avoid huge schemas)
    if (value && typeof value === "object" && !Array.isArray(value) && 
        !(value as unknown as { constructor: { name: string } }).constructor?.name?.includes("ObjectId") &&
        !(value instanceof Date) && prefix.split(".").length < 2) {
      const nestedFields = inferMongoFields(value as Record<string, unknown>, fieldName);
      fields.push(...nestedFields);
    }
  }
  
  return fields;
}

/**
 * Get MongoDB field type string
 */
function getMongoFieldType(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) return "Array";
  if (value instanceof Date) return "Date";
  if (typeof value === "object") {
    const constructorName = (value as unknown as { constructor: { name: string } }).constructor?.name;
    if (constructorName === "ObjectId" || constructorName === "ObjectID") {
      return "ObjectId";
    }
    return "Object";
  }
  if (typeof value === "string") return "String";
  if (typeof value === "number") return "Number";
  if (typeof value === "boolean") return "Boolean";
  return typeof value;
}

/**
 * Minify schema for token efficiency
 * Produces a compact string representation for AI context
 */
function minifySchema(tables: TableInfo[], type: DetectedDatabaseType): string {
  if (type === "mongodb") {
    // MongoDB format: CollectionName(field1:Type,field2:Type)
    return tables
      .map((t) => {
        const fields = t.fields
          .slice(0, 15) // Limit fields per collection
          .map((f) => `${f.name}:${f.type}`)
          .join(",");
        return `${t.name}(${fields})`;
      })
      .join(";");
  } else {
    // SQL format: TableName(column1 type,column2 type)
    return tables
      .map((t) => {
        const fields = t.fields
          .slice(0, 15) // Limit columns per table
          .map((f) => `${f.name} ${f.type}`)
          .join(",");
        return `${t.name}(${fields})`;
      })
      .join(";");
  }
}

/**
 * Test database connection
 */
export async function testConnection(connectionString: string): Promise<{
  success: boolean;
  type: DetectedDatabaseType;
  latency: number;
  error?: string;
}> {
  const type = detectDatabaseType(connectionString);
  const startTime = Date.now();
  
  try {
    if (type === "mongodb") {
      const client = new MongoClient(connectionString, {
        connectTimeoutMS: 30000,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 30000,
      });
      
      await client.connect();
      const dbName = extractMongoDbName(connectionString);
      await client.db(dbName).command({ ping: 1 });
      await client.close();
    } else {
      const pool = new Pool({
        connectionString,
        ssl: type === "supabase" ? { rejectUnauthorized: false } : false,
        max: 1,
        connectionTimeoutMillis: 10000,
      });
      
      await pool.query("SELECT 1");
      await pool.end();
    }
    
    return {
      success: true,
      type,
      latency: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      type,
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}
