/**
 * ============================================================================
 * QUERY EXECUTOR
 * ============================================================================
 * Unified query execution for MongoDB and PostgreSQL/Supabase databases.
 */

import { MongoClient } from "mongodb";
import { Pool } from "pg";
import { detectDatabaseType, type DetectedDatabaseType } from "./universal-schema";

export interface QueryResult {
  success: boolean;
  data: Record<string, unknown>[];
  rowCount: number;
  executionTime: number;
  error?: string;
}

/**
 * Extract database name from MongoDB connection string
 * Handles both mongodb:// and mongodb+srv:// formats
 */
function extractMongoDbName(connectionString: string): string {
  try {
    // For mongodb+srv:// URLs, the database name is in the pathname
    // Example: mongodb+srv://user:pass@cluster.mongodb.net/mydb?retryWrites=true
    const url = new URL(connectionString);
    const pathname = url.pathname;
    
    if (pathname && pathname.length > 1) {
      // Remove leading slash and any query params
      const dbName = pathname.substring(1).split("?")[0];
      if (dbName && dbName.length > 0) {
        console.log("[MongoDB] Using database from URL:", dbName);
        return dbName;
      }
    }
    
    // Check if database is specified in query params (some connection strings use this)
    const searchParams = url.searchParams;
    const dbFromParams = searchParams.get("authSource") || searchParams.get("database");
    if (dbFromParams) {
      console.log("[MongoDB] Using database from params:", dbFromParams);
      return dbFromParams;
    }
    
    console.log("[MongoDB] No database found in URL, using default: sample_mflix");
    // Default to sample_mflix for MongoDB sample data, or test
    return "sample_mflix";
  } catch (error) {
    console.log("[MongoDB] Error parsing connection string:", error);
    return "test";
  }
}

/**
 * Execute a MongoDB query
 */
async function executeMongoQuery(
  connectionString: string,
  queryString: string
): Promise<QueryResult> {
  const client = new MongoClient(connectionString, {
    connectTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  });

  const startTime = Date.now();

  try {
    await client.connect();
    const dbName = extractMongoDbName(connectionString);
    const db = client.db(dbName);

    // Parse the query - it could be a JSON object or a stringified JSON
    let parsedQuery: {
      collection?: string;
      operation?: string;
      filter?: Record<string, unknown>;
      pipeline?: Record<string, unknown>[];
      field?: string;
      options?: { limit?: number };
    };

    try {
      parsedQuery = typeof queryString === "string" 
        ? JSON.parse(queryString) 
        : queryString;
    } catch {
      return {
        success: false,
        data: [],
        rowCount: 0,
        executionTime: Date.now() - startTime,
        error: "Invalid query format. Expected JSON object.",
      };
    }

    const { collection, operation = "find", filter = {}, pipeline, field, options = {} } = parsedQuery;

    if (!collection) {
      return {
        success: false,
        data: [],
        rowCount: 0,
        executionTime: Date.now() - startTime,
        error: "Collection name is required",
      };
    }

    const coll = db.collection(collection);
    const limit = options.limit || 100;
    let documents: Record<string, unknown>[] = [];

    switch (operation) {
      case "find":
        documents = await coll.find(filter).limit(limit).toArray() as Record<string, unknown>[];
        break;

      case "aggregate":
        if (pipeline) {
          // Add limit if not present
          const hasLimit = pipeline.some((stage) => "$limit" in stage);
          const finalPipeline = hasLimit ? pipeline : [...pipeline, { $limit: limit }];
          documents = await coll.aggregate(finalPipeline).toArray() as Record<string, unknown>[];
        } else {
          documents = [];
        }
        break;

      case "count":
        const count = await coll.countDocuments(filter);
        documents = [{ count }];
        break;

      case "distinct":
        if (field) {
          const distinctValues = await coll.distinct(field, filter);
          documents = distinctValues.map((value) => ({ [field]: value }));
        } else {
          return {
            success: false,
            data: [],
            rowCount: 0,
            executionTime: Date.now() - startTime,
            error: "Field is required for distinct operation",
          };
        }
        break;

      default:
        documents = await coll.find(filter).limit(limit).toArray() as Record<string, unknown>[];
    }

    const executionTime = Date.now() - startTime;

    // Serialize documents (convert ObjectId to string, etc.)
    const serializedDocs = documents.map((doc) => serializeDocument(doc));

    await client.close();

    return {
      success: true,
      data: serializedDocs,
      rowCount: serializedDocs.length,
      executionTime,
    };
  } catch (error) {
    await client.close().catch(() => {});
    return {
      success: false,
      data: [],
      rowCount: 0,
      executionTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Query execution failed",
    };
  }
}

/**
 * Serialize MongoDB document for JSON response
 */
function serializeDocument(doc: Record<string, unknown>): Record<string, unknown> {
  const serialized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(doc)) {
    if (value === null || value === undefined) {
      serialized[key] = value;
    } else if (typeof value === "object") {
      if ((value as { constructor?: { name?: string } }).constructor?.name === "ObjectId") {
        serialized[key] = value.toString();
      } else if (value instanceof Date) {
        serialized[key] = value.toISOString();
      } else if (Array.isArray(value)) {
        serialized[key] = value.map((item) =>
          item && typeof item === "object" ? serializeDocument(item as Record<string, unknown>) : item
        );
      } else {
        serialized[key] = serializeDocument(value as Record<string, unknown>);
      }
    } else {
      serialized[key] = value;
    }
  }

  return serialized;
}

/**
 * Execute a PostgreSQL/Supabase query
 */
async function executePostgresQuery(
  connectionString: string,
  query: string,
  type: "postgres" | "supabase"
): Promise<QueryResult> {
  const pool = new Pool({
    connectionString,
    ssl: type === "supabase" ? { rejectUnauthorized: false } : false,
    max: 1,
    connectionTimeoutMillis: 10000,
  });

  const startTime = Date.now();

  try {
    // Add LIMIT if not present (for SELECT queries)
    const limitedQuery = addLimitIfNeeded(query, 100);

    const result = await pool.query(limitedQuery);
    const executionTime = Date.now() - startTime;

    await pool.end();

    return {
      success: true,
      data: result.rows,
      rowCount: result.rowCount || result.rows.length,
      executionTime,
    };
  } catch (error) {
    await pool.end().catch(() => {});
    return {
      success: false,
      data: [],
      rowCount: 0,
      executionTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Query execution failed",
    };
  }
}

/**
 * Add LIMIT clause if not present (SQL only)
 */
function addLimitIfNeeded(query: string, limit: number): string {
  const trimmedQuery = query.trim().toLowerCase();

  // Only add LIMIT to SELECT queries
  if (!trimmedQuery.startsWith("select")) {
    return query;
  }

  // Check if LIMIT already exists
  if (/\blimit\s+\d+/i.test(query)) {
    return query;
  }

  // Remove trailing semicolon if present
  let cleanQuery = query.trim();
  if (cleanQuery.endsWith(";")) {
    cleanQuery = cleanQuery.slice(0, -1);
  }

  return `${cleanQuery} LIMIT ${limit}`;
}

/**
 * Execute a query against any supported database
 */
export async function executeQuery(
  connectionString: string,
  query: string
): Promise<QueryResult> {
  const type = detectDatabaseType(connectionString);

  if (type === "mongodb") {
    return executeMongoQuery(connectionString, query);
  } else {
    return executePostgresQuery(connectionString, query, type);
  }
}

/**
 * Format query results for display
 */
export function formatQueryResults(result: QueryResult): string {
  if (!result.success) {
    return `❌ **Query Error**: ${result.error}`;
  }

  if (result.rowCount === 0) {
    return `✅ Query executed successfully. No results found. (${result.executionTime}ms)`;
  }

  // For count queries, show the count prominently
  if (result.data.length === 1 && "count" in result.data[0]) {
    return `✅ **Result**: ${result.data[0].count} (${result.executionTime}ms)`;
  }

  // For single column results
  if (result.data.length > 0 && Object.keys(result.data[0]).length === 1) {
    const key = Object.keys(result.data[0])[0];
    if (result.data.length === 1) {
      return `✅ **Result**: ${result.data[0][key]} (${result.executionTime}ms)`;
    }
  }

  // For multiple results, show as table or JSON
  let output = `✅ **Results** (${result.rowCount} row${result.rowCount === 1 ? '' : 's'}, ${result.executionTime}ms):\n\n`;

  // If small result set, show as formatted JSON
  if (result.rowCount <= 10) {
    output += "```json\n" + JSON.stringify(result.data, null, 2) + "\n```";
  } else {
    // Show first 5 and summarize
    output += "```json\n" + JSON.stringify(result.data.slice(0, 5), null, 2) + "\n```";
    output += `\n... and ${result.rowCount - 5} more rows`;
  }

  return output;
}
