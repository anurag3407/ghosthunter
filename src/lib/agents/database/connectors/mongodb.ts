import { MongoClient, Document } from "mongodb";

// Local type definitions
interface DatabaseCredentials {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  authSource?: string;
  replicaSet?: string;
  connectionString?: string;
}

interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey?: boolean;
}

interface TableSchema {
  name: string;
  columns: ColumnSchema[];
  primaryKey?: string[];
}

interface DatabaseSchema {
  tables: TableSchema[];
  updatedAt: string;
}

const QUERY_LIMITS = {
  maxResultRows: 1000,
};

// Connection cache
const clientCache: Map<string, MongoClient> = new Map();

/**
 * Build MongoDB connection URI
 */
function buildMongoURI(credentials: DatabaseCredentials): string {
  const { host, port, username, password, database, authSource, replicaSet } = credentials;
  
  let uri = `mongodb://`;
  
  if (username && password) {
    uri += `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
  }
  
  uri += `${host}:${port}/${database}`;
  
  const params: string[] = [];
  
  if (authSource) {
    params.push(`authSource=${authSource}`);
  }
  
  if (replicaSet) {
    params.push(`replicaSet=${replicaSet}`);
  }
  
  if (credentials.ssl) {
    params.push("ssl=true");
  }
  
  if (params.length > 0) {
    uri += `?${params.join("&")}`;
  }
  
  return uri;
}

/**
 * Create a MongoDB client
 */
export async function createMongoClient(credentials: DatabaseCredentials): Promise<MongoClient> {
  const uri = buildMongoURI(credentials);
  
  const client = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 5,
  });
  
  await client.connect();
  return client;
}

/**
 * Get or create a MongoDB client
 */
export async function getMongoClient(
  connectionId: string,
  credentials: DatabaseCredentials
): Promise<MongoClient> {
  const existing = clientCache.get(connectionId);
  if (existing) {
    return existing;
  }

  const client = await createMongoClient(credentials);
  clientCache.set(connectionId, client);
  return client;
}

/**
 * Close a MongoDB client
 */
export async function closeMongoClient(connectionId: string): Promise<void> {
  const client = clientCache.get(connectionId);
  if (client) {
    await client.close();
    clientCache.delete(connectionId);
  }
}

/**
 * Test MongoDB connection
 */
export async function testMongoConnection(credentials: DatabaseCredentials): Promise<{
  success: boolean;
  message: string;
  latency?: number;
}> {
  const startTime = Date.now();

  try {
    const client = await createMongoClient(credentials);
    
    // Ping the database
    const db = client.db(credentials.database);
    await db.command({ ping: 1 });
    
    const latency = Date.now() - startTime;
    
    await client.close();
    
    return {
      success: true,
      message: "Connection successful",
      latency,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

/**
 * Execute a MongoDB query (find operation)
 * @param query - JSON query object as string
 */
export async function executeMongoQuery(
  connectionId: string,
  credentials: DatabaseCredentials,
  query: string
): Promise<{
  documents: Record<string, unknown>[];
  rowCount: number;
  executionTime: number;
}> {
  const client = await getMongoClient(connectionId, credentials);
  const db = client.db(credentials.database);
  const startTime = Date.now();

  try {
    // Parse the query - expected format:
    // { "collection": "users", "operation": "find", "filter": {...}, "options": {...} }
    const parsedQuery = JSON.parse(query);
    
    const { collection, operation, filter = {}, options = {} } = parsedQuery;
    
    if (!collection) {
      throw new Error("Collection name is required");
    }
    
    const coll = db.collection(collection);
    let documents: Document[] = [];
    
    // Apply limit if not specified
    const limit = options.limit || QUERY_LIMITS.maxResultRows;
    
    switch (operation) {
      case "find":
        documents = await coll
          .find(filter)
          .limit(limit)
          .toArray();
        break;
        
      case "aggregate":
        const pipeline = parsedQuery.pipeline || [];
        // Add $limit stage if not present
        if (!pipeline.some((stage: Record<string, unknown>) => "$limit" in stage)) {
          pipeline.push({ $limit: limit });
        }
        documents = await coll.aggregate(pipeline).toArray();
        break;
        
      case "count":
        const count = await coll.countDocuments(filter);
        documents = [{ count }];
        break;
        
      case "distinct":
        const field = parsedQuery.field;
        if (!field) {
          throw new Error("Field is required for distinct operation");
        }
        const distinctValues = await coll.distinct(field, filter);
        documents = distinctValues.map((value) => ({ [field]: value }));
        break;
        
      default:
        // Default to find
        documents = await coll
          .find(filter)
          .limit(limit)
          .toArray();
    }
    
    const executionTime = Date.now() - startTime;
    
    // Convert ObjectId to string for JSON serialization
    const serializedDocs = documents.map((doc) => serializeDocument(doc));
    
    return {
      documents: serializedDocs,
      rowCount: serializedDocs.length,
      executionTime,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Query execution failed"
    );
  }
}

/**
 * Serialize MongoDB document for JSON response
 */
function serializeDocument(doc: Document): Record<string, unknown> {
  const serialized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(doc)) {
    if (value && typeof value === "object") {
      if (value.constructor.name === "ObjectId") {
        serialized[key] = value.toString();
      } else if (value instanceof Date) {
        serialized[key] = value.toISOString();
      } else if (Array.isArray(value)) {
        serialized[key] = value.map((item) =>
          item && typeof item === "object" ? serializeDocument(item) : item
        );
      } else {
        serialized[key] = serializeDocument(value);
      }
    } else {
      serialized[key] = value;
    }
  }
  
  return serialized;
}

/**
 * Fetch database schema from MongoDB
 */
export async function fetchMongoSchema(
  connectionId: string,
  credentials: DatabaseCredentials
): Promise<DatabaseSchema> {
  const client = await getMongoClient(connectionId, credentials);
  const db = client.db(credentials.database);

  try {
    // Get all collections
    const collections = await db.listCollections().toArray();
    const tables: TableSchema[] = [];

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      
      // Skip system collections
      if (collectionName.startsWith("system.")) {
        continue;
      }
      
      const collection = db.collection(collectionName);
      
      // Sample documents to infer schema
      const sampleDocs = await collection.find().limit(100).toArray();
      
      // Infer columns from sampled documents
      const columnMap = new Map<string, Set<string>>();
      
      for (const doc of sampleDocs) {
        inferColumnsFromDocument(doc, columnMap, "");
      }
      
      const columns: ColumnSchema[] = [];
      
      for (const [fieldPath, types] of columnMap) {
        columns.push({
          name: fieldPath,
          type: Array.from(types).join(" | "),
          nullable: true, // MongoDB fields are always optional
          isPrimaryKey: fieldPath === "_id",
        });
      }
      
      // Sort columns to put _id first
      columns.sort((a, b) => {
        if (a.name === "_id") return -1;
        if (b.name === "_id") return 1;
        return a.name.localeCompare(b.name);
      });

      tables.push({
        name: collectionName,
        columns,
        primaryKey: ["_id"],
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
 * Infer column types from a document
 */
function inferColumnsFromDocument(
  doc: Document,
  columnMap: Map<string, Set<string>>,
  prefix: string
): void {
  for (const [key, value] of Object.entries(doc)) {
    const fieldPath = prefix ? `${prefix}.${key}` : key;
    const type = getMongoType(value);
    
    if (!columnMap.has(fieldPath)) {
      columnMap.set(fieldPath, new Set());
    }
    
    columnMap.get(fieldPath)!.add(type);
    
    // Recurse into nested objects (but not arrays)
    if (value && typeof value === "object" && !Array.isArray(value) && 
        value.constructor.name !== "ObjectId" && !(value instanceof Date)) {
      inferColumnsFromDocument(value, columnMap, fieldPath);
    }
  }
}

/**
 * Get MongoDB type string
 */
function getMongoType(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) return "array";
  if (value instanceof Date) return "date";
  if (value && typeof value === "object") {
    if (value.constructor.name === "ObjectId") return "objectId";
    return "object";
  }
  return typeof value;
}
