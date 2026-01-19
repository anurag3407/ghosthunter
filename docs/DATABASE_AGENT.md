# 💾 Database Agent - Natural Language Database Interface

> Query your databases using natural language powered by AI.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [User Flow](#user-flow)
- [Supported Databases](#supported-databases)
- [Security](#security)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)

---

## Overview

Database Agent allows users to interact with their databases using natural language. It uses AI to translate English questions into SQL or NoSQL queries, making database access accessible to non-technical users.

### Key Features

| Feature | Description |
|---------|-------------|
| **Multi-Database** | PostgreSQL, MySQL, MongoDB support |
| **Natural Language** | Plain English to SQL/NoSQL |
| **Schema Detection** | Automatic table/collection discovery |
| **Query Explanation** | Understand what each query does |
| **Safe Execution** | Read-only with query validation |
| **Encrypted Credentials** | AES-256 encryption for connection strings |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE AGENT                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────────┐    ┌───────────────┐  │
│  │   User       │───▶│  LangChain       │───▶│   Query       │  │
│  │   Question   │    │  Agent           │    │   Generator   │  │
│  └──────────────┘    └──────────────────┘    └───────────────┘  │
│                                                      │          │
│                                                      ▼          │
│  ┌──────────────┐    ┌──────────────────┐    ┌───────────────┐  │
│  │   Query      │◀───│  Query Executor  │◀───│   Validation  │  │
│  │   Results    │    │                  │    │   Layer       │  │
│  └──────────────┘    └──────────────────┘    └───────────────┘  │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────┐    ┌──────────────────┐                       │
│  │   Gemini     │    │   User's         │                       │
│  │   AI         │    │   Database       │                       │
│  └──────────────┘    └──────────────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Flow

### 1. Connect Database

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Enter     │────▶│  Encrypt    │────▶│  Test           │────▶│   Save       │
│   Credentials    │  Credentials  │     │   Connection    │     │   Connection │
└─────────────┘     └─────────────┘     └─────────────────┘     └──────────────┘
```

### 2. Query Database

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Ask       │────▶│  AI         │────▶│   Execute       │────▶│   Display    │
│   Question  │     │  Generates  │     │   Query         │     │   Results    │
│             │     │   SQL       │     │                 │     │              │
└─────────────┘     └─────────────┘     └─────────────────┘     └──────────────┘
```

---

## Supported Databases

### PostgreSQL

```typescript
// Connection format
{
  type: 'postgresql',
  host: 'localhost',
  port: 5432,
  database: 'mydb',
  username: 'user',
  password: 'encrypted'
}
```

### MySQL

```typescript
// Connection format
{
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  database: 'mydb',
  username: 'user',
  password: 'encrypted'
}
```

### MongoDB

```typescript
// Connection format
{
  type: 'mongodb',
  connectionString: 'mongodb+srv://...',
  database: 'mydb'
}
```

---

## Security

### Credential Encryption

All database credentials are encrypted using AES-256-GCM:

```typescript
// Encryption process
1. Generate random IV (12 bytes)
2. Encrypt with AES-256-GCM
3. Store: IV + AuthTag + Ciphertext (Base64)
```

### Query Validation

```typescript
// Safety checks performed
const safetyChecks = [
  'No DROP statements',
  'No DELETE without WHERE',
  'No TRUNCATE',
  'No ALTER TABLE',
  'SELECT only by default',
  'Limit results to 100 rows'
];
```

### Permission Model

| Permission | Description |
|------------|-------------|
| Read-only | Default for all queries |
| User isolation | Users can only access their connections |
| Rate limiting | 5 queries/month (free tier) |

---

## Example Queries

### Natural Language → SQL

| User Question | Generated SQL |
|---------------|---------------|
| "Show all users" | `SELECT * FROM users LIMIT 100` |
| "Count orders by status" | `SELECT status, COUNT(*) FROM orders GROUP BY status` |
| "Top 10 products by sales" | `SELECT name, SUM(quantity) as total FROM products JOIN orders... LIMIT 10` |
| "Users who signed up last week" | `SELECT * FROM users WHERE created_at >= NOW() - INTERVAL '7 days'` |

---

## API Reference

### Connections

```
GET    /api/database/connections         # List connections
POST   /api/database/connections         # Create connection
DELETE /api/database/connections/:id     # Delete connection
POST   /api/database/connections/test    # Test connection
```

### Query Execution

```
POST   /api/database/chat                # Send natural language query
GET    /api/database/schema/:id          # Get database schema
```

### Conversations

```
GET    /api/database/conversations       # List conversations
POST   /api/database/conversations       # Create conversation
DELETE /api/database/conversations/:id   # Delete conversation
```

---

## Database Schema

### Connections Collection

```typescript
interface DatabaseConnection {
  id: string;
  userId: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb';
  host?: string;
  port?: number;
  database: string;
  username?: string;
  encryptedPassword?: string;  // AES-256 encrypted
  connectionString?: string;   // For MongoDB (encrypted)
  createdAt: Timestamp;
  lastUsedAt?: Timestamp;
}
```

### Conversations Collection

```typescript
interface DBConversation {
  id: string;
  userId: string;
  connectionId: string;
  title: string;
  messages: Message[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  query?: string;
  results?: any[];
  timestamp: Timestamp;
}
```

---

## Usage Limits

| Feature | Free Tier | Pro Tier |
|---------|-----------|----------|
| Connections | 1 | Unlimited |
| Queries/month | 5 | Unlimited |
| Result limit | 100 rows | 10,000 rows |

---

## Troubleshooting

### Connection Issues

**"Connection refused"**
- Check host and port
- Verify firewall rules
- Confirm database is running

**"Authentication failed"**
- Check username/password
- Verify user has access to database

**"SSL required"**
- Enable SSL in connection settings
- Add CA certificate if required

---

## Related Documentation

- [Main README](../README.md)
- [Architecture Overview](../ARCHITECTURE.md)
- [AI Models Reference](./AI_MODELS.md)
