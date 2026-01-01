import { Pool } from "pg";
import {
  fetchPostgresSchema,
} from "./postgresql";

// Local type definitions
interface DatabaseCredentials {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  connectionString?: string;
}

interface TableSchema {
  name: string;
  columns: { name: string; type: string; nullable: boolean; isPrimaryKey?: boolean }[];
  primaryKey?: string[];
}

interface DatabaseSchema {
  tables: TableSchema[];
  updatedAt: string;
}

/**
 * Parse Supabase connection string
 * Handles both direct and pooler URLs
 * Examples:
 * - postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
 * - postgres://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
 */
export function parseSupabaseConnectionString(connectionString: string): DatabaseCredentials {
  try {
    const url = new URL(connectionString);
    
    // Extract query parameters
    const sslMode = url.searchParams.get("sslmode");
    const pgbouncer = url.searchParams.get("pgbouncer");
    
    // Determine SSL setting
    const ssl = sslMode === "require" || 
                sslMode === "verify-full" || 
                sslMode === "verify-ca" ||
                // Supabase requires SSL by default
                connectionString.includes("supabase");
    
    return {
      host: url.hostname,
      port: parseInt(url.port) || (pgbouncer === "true" ? 6543 : 5432),
      database: url.pathname.slice(1) || "postgres",
      username: decodeURIComponent(url.username) || "postgres",
      password: decodeURIComponent(url.password),
      ssl,
      connectionString,
    };
  } catch (error) {
    throw new Error(`Invalid Supabase connection string: ${error instanceof Error ? error.message : "Parse error"}`);
  }
}

/**
 * Create a Supabase connection pool
 * Uses PostgreSQL under the hood with Supabase-specific settings
 */
export function createSupabasePool(credentials: DatabaseCredentials): Pool {
  // If connection string is provided, parse it
  if (credentials.connectionString) {
    const parsed = parseSupabaseConnectionString(credentials.connectionString);
    return createPoolFromCredentials(parsed);
  }
  
  return createPoolFromCredentials(credentials);
}

/**
 * Create pool from credentials with Supabase-specific settings
 */
function createPoolFromCredentials(credentials: DatabaseCredentials): Pool {
  const connectionString = credentials.connectionString || 
    `postgresql://${credentials.username}:${encodeURIComponent(credentials.password)}@${credentials.host}:${credentials.port}/${credentials.database}`;
  
  // Check if using pgbouncer (pooler mode)
  const isPgBouncer = credentials.connectionString?.includes("pooler.supabase.com") ||
                      credentials.connectionString?.includes("pgbouncer=true") ||
                      credentials.port === 6543;
  
  return new Pool({
    connectionString,
    ssl: credentials.ssl !== false ? { rejectUnauthorized: false } : false,
    max: isPgBouncer ? 1 : 5, // PgBouncer works better with single connection
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000, // Slightly longer for Supabase
  });
}

// Connection pool cache
const supabasePools: Map<string, Pool> = new Map();

/**
 * Get or create a Supabase connection pool
 */
export function getSupabasePool(connectionId: string, credentials: DatabaseCredentials): Pool {
  const existing = supabasePools.get(connectionId);
  if (existing) {
    return existing;
  }

  const pool = createSupabasePool(credentials);
  supabasePools.set(connectionId, pool);
  return pool;
}

/**
 * Close a Supabase connection pool
 */
export async function closeSupabasePool(connectionId: string): Promise<void> {
  const pool = supabasePools.get(connectionId);
  if (pool) {
    await pool.end();
    supabasePools.delete(connectionId);
  }
}

/**
 * Test Supabase connection
 */
export async function testSupabaseConnection(credentials: DatabaseCredentials): Promise<{
  success: boolean;
  message: string;
  latency?: number;
}> {
  const pool = createSupabasePool(credentials);
  const startTime = Date.now();

  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    const latency = Date.now() - startTime;
    
    await pool.end();
    
    return {
      success: true,
      message: "Connection successful",
      latency,
    };
  } catch (error) {
    await pool.end();
    
    // Provide helpful error messages for common Supabase issues
    let message = error instanceof Error ? error.message : "Connection failed";
    
    if (message.includes("password authentication failed")) {
      message = "Authentication failed. Check your database password in the Supabase dashboard.";
    } else if (message.includes("no pg_hba.conf entry")) {
      message = "Connection not allowed. Ensure SSL is enabled and your IP is whitelisted.";
    } else if (message.includes("ENOTFOUND")) {
      message = "Could not resolve host. Check your Supabase project URL.";
    }
    
    return {
      success: false,
      message,
    };
  }
}

/**
 * Execute a query on Supabase
 * Delegates to PostgreSQL query execution
 */
export async function executeSupabaseQuery(
  connectionId: string,
  credentials: DatabaseCredentials,
  query: string
): Promise<{
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  executionTime: number;
}> {
  // Use the PostgreSQL query execution with Supabase pool
  const pool = getSupabasePool(connectionId, credentials);
  return executePostgresQueryWithPool(pool, query);
}

/**
 * Execute query with provided pool
 */
async function executePostgresQueryWithPool(
  pool: Pool,
  query: string
): Promise<{
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  executionTime: number;
}> {
  const startTime = Date.now();

  try {
    const result = await pool.query({
      text: query,
      rowMode: "array",
    });

    const executionTime = Date.now() - startTime;
    
    // Get column names
    const columns = result.fields.map((field) => field.name);
    
    // Convert array rows to objects
    const rows = result.rows.map((row) => {
      const obj: Record<string, unknown> = {};
      columns.forEach((col, index) => {
        obj[col] = (row as unknown[])[index];
      });
      return obj;
    });

    return {
      columns,
      rows,
      rowCount: result.rowCount || 0,
      executionTime,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Query execution failed"
    );
  }
}

/**
 * Fetch database schema from Supabase
 * Delegates to PostgreSQL schema fetching
 */
export async function fetchSupabaseSchema(
  connectionId: string,
  credentials: DatabaseCredentials
): Promise<DatabaseSchema> {
  // Ensure we have a pool in the Supabase cache
  getSupabasePool(connectionId, credentials);
  
  // Use PostgreSQL schema fetching logic
  return fetchPostgresSchema(connectionId, credentials);
}
