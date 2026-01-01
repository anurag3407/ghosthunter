import { Pool } from "pg";

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

interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey?: boolean;
  defaultValue?: string;
}

interface TableSchema {
  name: string;
  columns: ColumnSchema[];
  primaryKey?: string[];
  foreignKeys?: { column: string; referencedTable: string; referencedColumn: string }[];
}

interface DatabaseSchema {
  tables: TableSchema[];
  updatedAt: string;
}

const QUERY_LIMITS = {
  maxResultRows: 1000,
};


interface PostgresConnection {
  pool: Pool;
  credentials: DatabaseCredentials;
}

// Connection pool cache
const connectionPools: Map<string, Pool> = new Map();

/**
 * Creates a connection pool for PostgreSQL
 */
export function createPostgresPool(credentials: DatabaseCredentials): Pool {
  const connectionString = `postgresql://${credentials.username}:${encodeURIComponent(credentials.password)}@${credentials.host}:${credentials.port}/${credentials.database}`;
  
  const pool = new Pool({
    connectionString,
    ssl: credentials.ssl ? { rejectUnauthorized: false } : false,
    max: 5, // Maximum connections per pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  return pool;
}

/**
 * Get or create a connection pool
 */
export function getPostgresPool(connectionId: string, credentials: DatabaseCredentials): Pool {
  const existing = connectionPools.get(connectionId);
  if (existing) {
    return existing;
  }

  const pool = createPostgresPool(credentials);
  connectionPools.set(connectionId, pool);
  return pool;
}

/**
 * Close a connection pool
 */
export async function closePostgresPool(connectionId: string): Promise<void> {
  const pool = connectionPools.get(connectionId);
  if (pool) {
    await pool.end();
    connectionPools.delete(connectionId);
  }
}

/**
 * Test PostgreSQL connection
 */
export async function testPostgresConnection(credentials: DatabaseCredentials): Promise<{
  success: boolean;
  message: string;
  latency?: number;
}> {
  const pool = createPostgresPool(credentials);
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
    return {
      success: false,
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

/**
 * Execute a query on PostgreSQL
 */
export async function executePostgresQuery(
  connectionId: string,
  credentials: DatabaseCredentials,
  query: string
): Promise<{
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  executionTime: number;
}> {
  const pool = getPostgresPool(connectionId, credentials);
  const startTime = Date.now();

  try {
    // Add LIMIT if not present to prevent huge result sets
    const limitedQuery = addLimitIfNeeded(query, QUERY_LIMITS.maxResultRows);
    
    const result = await pool.query({
      text: limitedQuery,
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
 * Fetch database schema from PostgreSQL
 */
export async function fetchPostgresSchema(
  connectionId: string,
  credentials: DatabaseCredentials
): Promise<DatabaseSchema> {
  const pool = getPostgresPool(connectionId, credentials);

  try {
    // Get all tables
    const tablesQuery = `
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    const tablesResult = await pool.query(tablesQuery);
    const tables: TableSchema[] = [];

    for (const tableRow of tablesResult.rows) {
      const tableName = tableRow.table_name;

      // Get columns for this table
      const columnsQuery = `
        SELECT 
          c.column_name,
          c.data_type,
          c.is_nullable,
          c.column_default,
          CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key
        FROM information_schema.columns c
        LEFT JOIN (
          SELECT ku.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage ku
            ON tc.constraint_name = ku.constraint_name
          WHERE tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_name = $1
            AND tc.table_schema = 'public'
        ) pk ON c.column_name = pk.column_name
        WHERE c.table_name = $1
          AND c.table_schema = 'public'
        ORDER BY c.ordinal_position;
      `;

      const columnsResult = await pool.query(columnsQuery, [tableName]);
      
      const columns: ColumnSchema[] = columnsResult.rows.map((col) => ({
        name: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable === "YES",
        defaultValue: col.column_default,
        isPrimaryKey: col.is_primary_key,
      }));

      // Get foreign keys
      const fkQuery = `
        SELECT
          kcu.column_name,
          ccu.table_name AS referenced_table,
          ccu.column_name AS referenced_column
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = $1
          AND tc.table_schema = 'public';
      `;

      const fkResult = await pool.query(fkQuery, [tableName]);
      const foreignKeys = fkResult.rows.map((fk) => ({
        column: fk.column_name,
        referencedTable: fk.referenced_table,
        referencedColumn: fk.referenced_column,
      }));

      // Get primary key columns
      const pkQuery = `
        SELECT ku.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku
          ON tc.constraint_name = ku.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_name = $1
          AND tc.table_schema = 'public';
      `;

      const pkResult = await pool.query(pkQuery, [tableName]);
      const primaryKey = pkResult.rows.map((pk) => pk.column_name);

      tables.push({
        name: tableName,
        columns,
        primaryKey: primaryKey.length > 0 ? primaryKey : undefined,
        foreignKeys: foreignKeys.length > 0 ? foreignKeys : undefined,
      });
    }

    return {
      tables,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch schema"
    );
  }
}

/**
 * Add LIMIT clause if not present
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
