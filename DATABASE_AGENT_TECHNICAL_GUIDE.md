# 🔧 Database Agent - Technical Implementation Guide

> Deep dive into the Database Agent architecture and implementation details

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [AI Query Generation Pipeline](#ai-query-generation-pipeline)
3. [Security Implementation](#security-implementation)
4. [Database Abstraction Layer](#database-abstraction-layer)
5. [Frontend Components](#frontend-components)
6. [State Management](#state-management)
7. [Testing Strategy](#testing-strategy)
8. [Performance Optimizations](#performance-optimizations)
9. [Error Handling](#error-handling)
10. [Extension Points](#extension-points)

---

## 🏗️ System Architecture

### Component Hierarchy

```
┌─────────────────────────────────────────────────────┐
│                 Presentation Layer                  │
│  ┌──────────────────────────────────────────────┐  │
│  │  React Components (Next.js App Router)       │  │
│  │  - ConnectionList                            │  │
│  │  - ConnectionForm                            │  │
│  │  - ChatInterface                             │  │
│  │  - QueryDisplay                              │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│                  API Layer (Edge)                   │
│  ┌──────────────────────────────────────────────┐  │
│  │  Next.js API Routes                          │  │
│  │  - /api/database/query (POST, GET, PUT)     │  │
│  │  - Auth middleware (Clerk)                   │  │
│  │  - Request validation                        │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│               Business Logic Layer                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │Query         │  │Encryption    │  │Validation│  │
│  │Generator     │  │Service       │  │Service   │  │
│  │              │  │              │  │          │  │
│  │LangChain +   │  │CryptoJS      │  │SQL       │  │
│  │Gemini        │  │AES-256       │  │Parser    │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│                  Data Layer                         │
│  ┌──────────────────┐      ┌────────────────────┐  │
│  │  Firestore       │      │ External DBs       │  │
│  │  - Connections   │      │ - PostgreSQL       │  │
│  │  - Schema Cache  │      │ - MySQL            │  │
│  │  - Metadata      │      │ - MongoDB          │  │
│  └──────────────────┘      └────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Request Flow Diagram

```typescript
// Step 1: User asks question
const userQuestion = "Show me all users who signed up last week";

// Step 2: Frontend sends to API
const response = await fetch('/api/database/query', {
  method: 'POST',
  body: JSON.stringify({
    connectionId: 'conn_123',
    question: userQuestion
  })
});

// Step 3: API validates auth
const { userId } = await auth();
if (!userId) throw new Error('Unauthorized');

// Step 4: Fetch connection from Firestore
const connection = await getConnection(connectionId, userId);

// Step 5: Decrypt credentials
const credentials = decrypt(connection.encryptedCredentials);

// Step 6: Get cached schema
const schema = connection.schemaCache;

// Step 7: Generate query using AI
const result = await generateQuery(userQuestion, connection.type, schema);

// Step 8: Validate query safety
const validated = validateQuery(result.query, connection.type);

// Step 9: Return to frontend
return NextResponse.json({
  query: result.query,
  explanation: result.explanation,
  warnings: validated.warnings
});
```

---

## 🤖 AI Query Generation Pipeline

### LangChain Integration

```typescript
// File: src/lib/agents/database/query-generator.ts

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";

/**
 * Initialize Gemini model with specific configuration
 */
function getGeminiModel() {
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.1,      // Low = more deterministic
    maxOutputTokens: 2048, // Enough for complex queries
  });
}

/**
 * Build conversation context with schema awareness
 */
function buildContext(
  databaseType: DatabaseType,
  schema: DatabaseSchema,
  history: ChatMessage[]
): (SystemMessage | HumanMessage | AIMessage)[] {
  
  // System prompt with schema
  const systemPrompt = `
    You are an expert ${databaseType} database assistant.
    
    SCHEMA:
    ${formatSchema(schema)}
    
    RULES:
    1. Generate safe, read-only queries
    2. Use proper ${databaseType} syntax
    3. Explain what the query does
    4. List assumptions made
    5. Warn about performance issues
  `;
  
  const messages: Message[] = [
    new SystemMessage(systemPrompt)
  ];
  
  // Add conversation history (last 10 messages)
  for (const msg of history.slice(-10)) {
    if (msg.role === 'user') {
      messages.push(new HumanMessage(msg.content));
    } else if (msg.role === 'assistant') {
      messages.push(new AIMessage(msg.content));
    }
  }
  
  return messages;
}

/**
 * Generate query from natural language
 */
export async function generateQuery(
  userMessage: string,
  databaseType: DatabaseType,
  schema: DatabaseSchema,
  history: ChatMessage[] = []
): Promise<QueryGenerationResult> {
  
  const model = getGeminiModel();
  const messages = buildContext(databaseType, schema, history);
  
  // Add current user question
  messages.push(new HumanMessage(userMessage));
  
  // Invoke AI model
  const response = await model.invoke(messages);
  
  // Parse structured response
  const result = parseQueryResponse(response.content);
  
  // Validate safety
  const validation = validateQuery(result.query, databaseType);
  
  if (!validation.isSafe) {
    return {
      ...result,
      query: null,
      isBlocked: true,
      blockReason: validation.errors.join(', ')
    };
  }
  
  return {
    ...result,
    warnings: [...result.warnings, ...validation.warnings]
  };
}
```

### Response Parsing Strategy

```typescript
/**
 * Parse AI response into structured format
 * Handles multiple response formats
 */
function parseQueryResponse(response: string): QueryResult {
  
  // Strategy 1: Try JSON code block
  const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch {
      // Continue to next strategy
    }
  }
  
  // Strategy 2: Try raw JSON
  try {
    return JSON.parse(response);
  } catch {
    // Continue to next strategy
  }
  
  // Strategy 3: Extract SQL from text
  const sqlMatch = response.match(/```sql\s*([\s\S]*?)\s*```/);
  if (sqlMatch) {
    return {
      query: sqlMatch[1].trim(),
      explanation: "Query extracted from SQL block",
      assumptions: [],
      warnings: []
    };
  }
  
  // Strategy 4: Find SELECT statement
  const selectMatch = response.match(/SELECT[\s\S]+?(?:;|$)/i);
  if (selectMatch) {
    return {
      query: selectMatch[0].trim(),
      explanation: "Query found in response",
      assumptions: [],
      warnings: ["Response format unexpected"]
    };
  }
  
  // Strategy 5: Return as explanation
  return {
    query: null,
    explanation: response,
    assumptions: [],
    warnings: ["Could not generate query"]
  };
}
```

### Schema Formatting

```typescript
/**
 * Format database schema for AI consumption
 */
function formatSchema(schema: DatabaseSchema): string {
  return schema.tables.map(table => {
    const columns = table.columns.map(col => 
      `  - ${col.name}: ${col.type}${col.nullable ? ' (nullable)' : ''}`
    ).join('\n');
    
    const keys = [];
    if (table.primaryKey?.length) {
      keys.push(`  PRIMARY KEY (${table.primaryKey.join(', ')})`);
    }
    if (table.foreignKeys?.length) {
      table.foreignKeys.forEach(fk => {
        keys.push(`  FOREIGN KEY ${fk.column} -> ${fk.referencedTable}.${fk.referencedColumn}`);
      });
    }
    
    return `Table: ${table.name}\n${columns}${keys.length ? '\n' + keys.join('\n') : ''}`;
  }).join('\n\n');
}
```

---

## 🔐 Security Implementation

### Credential Encryption

```typescript
// File: src/lib/agents/database/encryption.ts

import CryptoJS from 'crypto-js';

/**
 * AES-256 encryption for database credentials
 */

// Get encryption key from environment
function getEncryptionKey(): string {
  const key = process.env.CREDENTIALS_ENCRYPTION_KEY;
  if (!key || key.length < 64) {
    throw new Error('Invalid encryption key');
  }
  return key;
}

/**
 * Encrypt sensitive data
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const encrypted = CryptoJS.AES.encrypt(plaintext, key);
  return encrypted.toString();
}

/**
 * Decrypt sensitive data
 */
export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();
  const decrypted = CryptoJS.AES.decrypt(ciphertext, key);
  return decrypted.toString(CryptoJS.enc.Utf8);
}

/**
 * Encrypt database credentials object
 */
export function encryptCredentials(
  credentials: DatabaseCredentials
): string {
  const json = JSON.stringify(credentials);
  return encrypt(json);
}

/**
 * Decrypt database credentials object
 */
export function decryptCredentials<T = DatabaseCredentials>(
  encrypted: string
): T {
  const json = decrypt(encrypted);
  return JSON.parse(json);
}
```

### Query Validation

```typescript
// File: src/lib/agents/database/validators.ts

/**
 * Validate SQL/NoSQL query for safety
 */
export function validateQuery(
  query: string,
  databaseType: DatabaseType
): ValidationResult {
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Normalize query
  const normalized = query.toUpperCase().trim();
  
  // Check for dangerous keywords
  const DANGEROUS = [
    'DELETE', 'DROP', 'TRUNCATE', 'ALTER',
    'GRANT', 'REVOKE', 'EXEC', 'EXECUTE'
  ];
  
  for (const keyword of DANGEROUS) {
    if (normalized.includes(keyword)) {
      errors.push(`Dangerous operation blocked: ${keyword}`);
    }
  }
  
  // Check for destructive operations
  const DESTRUCTIVE = ['UPDATE', 'INSERT', 'CREATE', 'REPLACE'];
  
  for (const keyword of DESTRUCTIVE) {
    if (normalized.includes(keyword)) {
      warnings.push(`Potentially destructive: ${keyword}`);
    }
  }
  
  // Check for multiple statements (SQL injection risk)
  if ((query.match(/;/g) || []).length > 1) {
    errors.push('Multiple statements not allowed');
  }
  
  // Database-specific validation
  if (databaseType === 'postgresql') {
    validatePostgreSQL(query, warnings);
  } else if (databaseType === 'mysql') {
    validateMySQL(query, warnings);
  } else if (databaseType === 'mongodb') {
    validateMongoDB(query, warnings);
  }
  
  return {
    isSafe: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * PostgreSQL-specific validation
 */
function validatePostgreSQL(query: string, warnings: string[]): void {
  // Check for missing LIMIT on SELECT
  if (query.toUpperCase().includes('SELECT') && 
      !query.toUpperCase().includes('LIMIT')) {
    warnings.push('Consider adding LIMIT clause for large tables');
  }
  
  // Warn about SELECT *
  if (query.includes('SELECT *')) {
    warnings.push('SELECT * may be inefficient, specify columns');
  }
  
  // Check for CROSS JOIN
  if (query.toUpperCase().includes('CROSS JOIN')) {
    warnings.push('CROSS JOIN can be expensive, verify intentional');
  }
}
```

### Authentication & Authorization

```typescript
// API Route Example: src/app/api/database/query/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // 1. Verify authentication
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  const body = await request.json();
  const { connectionId } = body;
  
  // 2. Fetch connection
  const connection = await getConnection(connectionId);
  
  // 3. Verify ownership
  if (connection.userId !== userId) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  
  // 4. Process request
  // ...
}
```

---

## 🗄️ Database Abstraction Layer

### Connection Interface

```typescript
/**
 * Abstract database connection interface
 */
interface DatabaseAdapter {
  connect(credentials: DatabaseCredentials): Promise<void>;
  disconnect(): Promise<void>;
  testConnection(): Promise<boolean>;
  getSchema(): Promise<DatabaseSchema>;
  executeQuery(query: string): Promise<QueryResult>;
}

/**
 * PostgreSQL adapter (future implementation)
 */
class PostgreSQLAdapter implements DatabaseAdapter {
  private client: any; // pg.Client
  
  async connect(credentials: DatabaseCredentials) {
    const { Client } = await import('pg');
    this.client = new Client({
      host: credentials.host,
      port: credentials.port,
      database: credentials.database,
      user: credentials.username,
      password: credentials.password,
      ssl: credentials.ssl
    });
    await this.client.connect();
  }
  
  async getSchema(): Promise<DatabaseSchema> {
    const query = `
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `;
    
    const result = await this.client.query(query);
    return parseSchemaFromRows(result.rows);
  }
  
  // ... other methods
}
```

---

## 🎨 Frontend Components

### Chat Interface Component

```typescript
// src/app/dashboard/database/[id]/page.tsx

'use client';

import { useState } from 'react';

export default function DatabaseChat({ connectionId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      // Call API
      const response = await fetch('/api/database/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId,
          question: input
        })
      });
      
      const data = await response.json();
      
      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.explanation,
        query: data.query,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.map(message => (
          <Message key={message.id} message={message} />
        ))}
      </div>
      
      {/* Input */}
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
```

---

## 📈 Performance Optimizations

### Schema Caching

```typescript
/**
 * Cache schema in Firestore to avoid repeated DB calls
 */
async function getOrCacheSchema(
  connectionId: string,
  credentials: DatabaseCredentials
): Promise<DatabaseSchema> {
  
  // Try to get from cache
  const connection = await getConnection(connectionId);
  
  // Check if cache is fresh (< 24 hours)
  if (connection.schemaCache && connection.schemaCacheUpdatedAt) {
    const cacheAge = Date.now() - connection.schemaCacheUpdatedAt.toMillis();
    const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
    
    if (cacheAge < CACHE_TTL) {
      return connection.schemaCache;
    }
  }
  
  // Fetch fresh schema
  const schema = await fetchSchemaFromDatabase(credentials);
  
  // Update cache
  await updateConnection(connectionId, {
    schemaCache: schema,
    schemaCacheUpdatedAt: new Date()
  });
  
  return schema;
}
```

### Request Debouncing

```typescript
/**
 * Debounce user input to reduce API calls
 */
import { useDebounce } from '@/hooks/useDebounce';

function ChatInput() {
  const [input, setInput] = useState('');
  const debouncedInput = useDebounce(input, 300);
  
  useEffect(() => {
    if (debouncedInput) {
      // Show typing indicator or suggestions
      fetchSuggestions(debouncedInput);
    }
  }, [debouncedInput]);
}
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// tests/query-generator.test.ts

describe('Query Generator', () => {
  it('generates SELECT query for simple question', async () => {
    const result = await generateQuery(
      'Show all users',
      'postgresql',
      mockSchema,
      []
    );
    
    expect(result.query).toContain('SELECT');
    expect(result.query).toContain('FROM users');
  });
  
  it('blocks DELETE operations', async () => {
    const result = await generateQuery(
      'Delete all users',
      'postgresql',
      mockSchema,
      []
    );
    
    expect(result.isBlocked).toBe(true);
    expect(result.query).toBeNull();
  });
});
```

---

## 🔌 Extension Points

### Adding New Database Types

```typescript
// 1. Add to type definition
export type DatabaseType = 
  | "postgresql" 
  | "mysql" 
  | "mongodb"
  | "sqlite"      // NEW
  | "redis";      // NEW

// 2. Create adapter
class SQLiteAdapter implements DatabaseAdapter {
  // Implementation
}

// 3. Update validation
function validateSQLite(query: string, warnings: string[]): void {
  // SQLite-specific rules
}

// 4. Update system prompt
function getSystemPrompt(type: DatabaseType, schema: DatabaseSchema) {
  const syntaxGuide = {
    // ...
    sqlite: "SQLite syntax with double quotes for identifiers",
    redis: "Redis commands (GET, SET, HGETALL, etc.)"
  };
}
```

---

**Last Updated**: January 1, 2026  
**Version**: 1.0.0  
**Maintained by**: GhostFounder Team
