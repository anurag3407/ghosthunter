/**
 * ============================================================================
 * UNIVERSAL SCHEMA LOADER
 * ============================================================================
 * Auto-detect database type and fetch schema from PostgreSQL/Supabase or MongoDB.
 * Includes caching support to reduce latency on repeated queries.
 */

import { Pool } from "pg";
import { MongoClient } from "mongodb";
import { getAdminDb } from "@/lib/firebase/admin";

// Cache TTL in milliseconds (1 hour)
const SCHEMA_CACHE_TTL_MS = 60 * 60 * 1000;

/**
 * Cached schema stored in Firestore
 */
export interface CachedSchemaData {
  schema: UniversalSchema;
  cachedAt: string;
}

export type DetectedDatabaseType = "postgres" | "mongodb" | "supabase";

export interface UniversalSchema {
  type: DetectedDatabaseType;
  schema: string; // Minified schema string for AI context
  tables: TableInfo[];
  sampleDataContext: string; // Enhanced AI context with sample data
  updatedAt: string;
}

export interface TableInfo {
  name: string;
  fields: FieldInfo[];
  sampleDocuments?: Record<string, unknown>[]; // Sample documents/rows for AI context
  documentCount?: number; // Approximate count of documents in collection
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
  console.log(`[Schema] Fetching fresh schema for ${type} database...`);

  if (type === "mongodb") {
    return getMongoDBSchema(connectionString);
  } else {
    return getPostgresSchema(connectionString, type);
  }
}

/**
 * Fetch PostgreSQL/Supabase schema with sample data
 */
async function getPostgresSchema(
  connectionString: string,
  type: "postgres" | "supabase"
): Promise<UniversalSchema> {
  console.log(`[Postgres Schema] Starting schema fetch with sample data for ${type}...`);

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
    const tableNames = Array.from(tableMap.keys());

    // Fetch sample rows for each table
    for (const tableName of tableNames) {
      const fields = tableMap.get(tableName)!;

      try {
        // Get sample rows (limit 5) and approximate count
        const sampleQuery = `SELECT * FROM "${tableName}" LIMIT 5`;
        const countQuery = `SELECT COUNT(*) FROM "${tableName}"`;

        const [sampleResult, countResult] = await Promise.all([
          pool.query(sampleQuery).catch(() => ({ rows: [] })),
          pool.query(countQuery).catch(() => ({ rows: [{ count: 0 }] })),
        ]);

        tables.push({
          name: tableName,
          fields,
          sampleDocuments: sampleResult.rows as Record<string, unknown>[],
          documentCount: parseInt(countResult.rows[0]?.count || "0", 10),
        });
      } catch {
        // If sample fetch fails, still include the table
        tables.push({ name: tableName, fields });
      }
    }

    // Create minified schema string
    const schema = minifySchema(tables, type);

    // Create enhanced AI context with sample data
    const sampleDataContext = generateSampleDataContext(tables, type);

    console.log(`[Postgres Schema] Final schema (${schema.length} chars), sample context (${sampleDataContext.length} chars)`);

    return {
      type,
      schema,
      tables,
      sampleDataContext,
      updatedAt: new Date().toISOString(),
    };
  } finally {
    await pool.end();
  }
}

/**
 * Fetch MongoDB schema by sampling collections with sample data
 */
async function getMongoDBSchema(connectionString: string): Promise<UniversalSchema> {
  console.log("[MongoDB Schema] Starting schema fetch with sample data...");

  const client = new MongoClient(connectionString, {
    connectTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  });

  try {
    console.log("[MongoDB Schema] Connecting to MongoDB...");
    await client.connect();
    console.log("[MongoDB Schema] Connected successfully");

    // Extract database name from connection string
    const dbName = extractMongoDbName(connectionString);
    console.log(`[MongoDB Schema] Using database: ${dbName}`);
    const db = client.db(dbName);

    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(`[MongoDB Schema] Found ${collections.length} collections: ${collections.map(c => c.name).join(", ")}`);

    const tables: TableInfo[] = [];

    for (const collInfo of collections) {
      // Skip system collections
      if (collInfo.name.startsWith("system.")) {
        continue;
      }

      const collection = db.collection(collInfo.name);

      // Fetch sample documents (up to 5 for good AI context)
      const sampleDocs = await collection.find().limit(5).toArray();

      // Get approximate document count
      const docCount = await collection.estimatedDocumentCount();

      if (sampleDocs.length > 0) {
        const fields = inferMongoFields(sampleDocs[0]);
        console.log(`[MongoDB Schema] Collection '${collInfo.name}': ${fields.length} fields, ~${docCount} docs`);

        // Clean sample docs for JSON output (convert ObjectIds to strings, etc.)
        const cleanedSamples = sampleDocs.map(doc => cleanMongoDocument(doc));

        tables.push({
          name: collInfo.name,
          fields,
          sampleDocuments: cleanedSamples,
          documentCount: docCount,
        });
      } else {
        // Empty collection
        console.log(`[MongoDB Schema] Collection '${collInfo.name}': empty`);
        tables.push({
          name: collInfo.name,
          fields: [{ name: "_id", type: "ObjectId" }],
          sampleDocuments: [],
          documentCount: 0,
        });
      }
    }

    // Create minified schema string
    const schema = minifySchema(tables, "mongodb");

    // Create enhanced AI context with sample data
    const sampleDataContext = generateSampleDataContext(tables, "mongodb");

    console.log(`[MongoDB Schema] Final schema (${schema.length} chars), sample context (${sampleDataContext.length} chars)`);

    return {
      type: "mongodb",
      schema,
      tables,
      sampleDataContext,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[MongoDB Schema] Error fetching schema:", error);
    throw error;
  } finally {
    await client.close();
  }
}

/**
 * Clean MongoDB document for JSON serialization
 * Converts ObjectIds, Dates, etc. to readable strings
 */
function cleanMongoDocument(doc: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(doc)) {
    if (value === null || value === undefined) {
      cleaned[key] = value;
    } else if (Array.isArray(value)) {
      cleaned[key] = value.map(item =>
        typeof item === "object" && item !== null
          ? cleanMongoDocument(item as Record<string, unknown>)
          : item
      );
    } else if (value instanceof Date) {
      cleaned[key] = value.toISOString();
    } else if (typeof value === "object") {
      const constructorName = (value as { constructor: { name: string } }).constructor?.name;
      if (constructorName === "ObjectId" || constructorName === "ObjectID") {
        cleaned[key] = String(value);
      } else {
        cleaned[key] = cleanMongoDocument(value as Record<string, unknown>);
      }
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

/**
 * Generate enhanced AI context with sample data
 * This gives the AI actual data examples to understand the database content
 */
function generateSampleDataContext(tables: TableInfo[], type: DetectedDatabaseType): string {
  const sections: string[] = [];

  for (const table of tables) {
    const section: string[] = [];

    if (type === "mongodb") {
      section.push(`## Collection: ${table.name}`);
    } else {
      section.push(`## Table: ${table.name}`);
    }

    // Add document count
    if (table.documentCount !== undefined) {
      section.push(`Documents: ~${table.documentCount.toLocaleString()}`);
    }

    // Add field overview
    section.push(`Fields: ${table.fields.slice(0, 10).map(f => `${f.name}(${f.type})`).join(", ")}`);

    // Add sample documents (max 3 for token efficiency)
    if (table.sampleDocuments && table.sampleDocuments.length > 0) {
      section.push("\nSample Documents:");
      const samplesToShow = table.sampleDocuments.slice(0, 3);
      for (let i = 0; i < samplesToShow.length; i++) {
        // Truncate long values for token efficiency
        const truncatedDoc = truncateDocumentValues(samplesToShow[i]);
        section.push(`${i + 1}. ${JSON.stringify(truncatedDoc)}`);
      }
    }

    sections.push(section.join("\n"));
  }

  return sections.join("\n\n");
}

/**
 * Truncate long string values in a document for token efficiency
 */
function truncateDocumentValues(doc: Record<string, unknown>, maxLength = 100): Record<string, unknown> {
  const truncated: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(doc)) {
    if (typeof value === "string" && value.length > maxLength) {
      truncated[key] = value.substring(0, maxLength) + "...";
    } else if (Array.isArray(value)) {
      // Only show first 3 items of arrays
      truncated[key] = value.slice(0, 3).map(item =>
        typeof item === "object" && item !== null
          ? truncateDocumentValues(item as Record<string, unknown>, maxLength)
          : typeof item === "string" && item.length > maxLength
            ? item.substring(0, maxLength) + "..."
            : item
      );
      if (value.length > 3) {
        (truncated[key] as unknown[]).push(`... and ${value.length - 3} more items`);
      }
    } else if (typeof value === "object" && value !== null) {
      truncated[key] = truncateDocumentValues(value as Record<string, unknown>, maxLength);
    } else {
      truncated[key] = value;
    }
  }

  return truncated;
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

/**
 * Get cached schema or fetch fresh if cache is stale/missing
 * This dramatically reduces latency on repeated queries by avoiding
 * database round-trips for schema information.
 * 
 * @param connectionId - The Firestore document ID for the connection
 * @param connectionString - The database connection string (used if cache miss)
 * @param forceRefresh - Force a fresh schema fetch, bypassing cache
 */
export async function getCachedOrFetchSchema(
  connectionId: string,
  connectionString: string,
  forceRefresh = false
): Promise<UniversalSchema> {
  const adminDb = getAdminDb();

  // If Firestore is not available, fall back to direct fetch
  if (!adminDb) {
    console.log("[Schema Cache] Firestore not available, fetching fresh schema");
    return getUniversalSchema(connectionString);
  }

  try {
    const connectionRef = adminDb.collection("database_connections").doc(connectionId);
    const doc = await connectionRef.get();

    if (!doc.exists) {
      console.log("[Schema Cache] Connection not found, fetching fresh schema");
      return getUniversalSchema(connectionString);
    }

    const data = doc.data();
    const cachedSchema = data?.cachedSchema as CachedSchemaData | undefined;

    // Check if cache is valid
    if (!forceRefresh && cachedSchema?.cachedAt) {
      const cacheAge = Date.now() - new Date(cachedSchema.cachedAt).getTime();

      if (cacheAge < SCHEMA_CACHE_TTL_MS) {
        console.log(`[Schema Cache] HIT - Using cached schema (age: ${Math.round(cacheAge / 1000)}s)`);
        return cachedSchema.schema;
      }
      console.log(`[Schema Cache] EXPIRED - Cache age ${Math.round(cacheAge / 60000)}min exceeds TTL`);
    } else {
      console.log(`[Schema Cache] MISS - ${forceRefresh ? 'Force refresh requested' : 'No cached schema found'}`);
    }

    // Fetch fresh schema
    const freshSchema = await getUniversalSchema(connectionString);

    // Update cache in Firestore (non-blocking)
    const cacheData: CachedSchemaData = {
      schema: freshSchema,
      cachedAt: new Date().toISOString(),
    };

    connectionRef.update({ cachedSchema: cacheData }).catch((err) => {
      console.warn("[Schema Cache] Failed to update cache:", err);
    });

    console.log("[Schema Cache] Cached fresh schema for future requests");
    return freshSchema;

  } catch (error) {
    console.warn("[Schema Cache] Error accessing cache, fetching fresh:", error);
    return getUniversalSchema(connectionString);
  }
}

/**
 * Invalidate the cached schema for a connection
 * Call this when the user wants to refresh their schema
 */
export async function invalidateSchemaCache(connectionId: string): Promise<boolean> {
  const adminDb = getAdminDb();

  if (!adminDb) {
    return false;
  }

  try {
    await adminDb
      .collection("database_connections")
      .doc(connectionId)
      .update({ cachedSchema: null });
    console.log("[Schema Cache] Invalidated cache for connection:", connectionId);
    return true;
  } catch (error) {
    console.warn("[Schema Cache] Failed to invalidate cache:", error);
    return false;
  }
}
