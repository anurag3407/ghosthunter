# 🗄️ Database Agent - Complete Documentation

> **Natural Language Database Query Interface powered by AI**

The Database Agent is an intelligent assistant that enables developers and non-technical users to interact with their databases using plain English. It converts natural language questions into SQL/NoSQL queries, provides explanations, and helps users understand their data without writing complex queries.

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [File Structure](#file-structure)
6. [Data Models](#data-models)
7. [API Endpoints](#api-endpoints)
8. [User Flows](#user-flows)
9. [Security & Encryption](#security--encryption)
10. [Setup & Configuration](#setup--configuration)
11. [Usage Examples](#usage-examples)
12. [Troubleshooting](#troubleshooting)
13. [Future Enhancements](#future-enhancements)

---

## 🎯 Overview

### What is Database Agent?

Database Agent is an AI-powered natural language interface for databases that:
- **Translates** natural language questions into database queries
- **Supports** PostgreSQL, MySQL, and MongoDB
- **Protects** your data with encrypted credential storage
- **Explains** what each query does and potential implications
- **Prevents** dangerous operations with safety validations

### Use Cases

1. **Non-Technical Users**: Query databases without SQL knowledge
2. **Developers**: Quick data exploration and analysis
3. **Data Analysts**: Rapid prototyping of complex queries
4. **Business Intelligence**: Ad-hoc reporting and insights
5. **Learning**: Understand how natural language maps to SQL

---

## ✨ Features

### Core Capabilities

✅ **Multi-Database Support**
- PostgreSQL
- MySQL  
- MongoDB (NoSQL)

✅ **AI-Powered Query Generation**
- Natural language understanding via Google Gemini 2.0 Flash
- Context-aware conversations
- Schema-aware suggestions

✅ **Security First**
- AES-256 encryption for credentials
- Read-only queries by default
- Validation against destructive operations
- Safe query execution sandbox

✅ **Smart Query Analysis**
- Query explanation in plain English
- Assumption tracking
- Performance warnings
- Data volume alerts

✅ **Connection Management**
- Multiple database connections
- Connection testing
- Schema caching
- Usage tracking

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface (Next.js)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Connections  │  │ Chat         │  │ Query Results    │  │
│  │ Management   │  │ Interface    │  │ Visualization    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js API Routes)           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/database/query                                 │  │
│  │  - POST: Generate query from natural language       │  │
│  │  - GET: Fetch connections                           │  │
│  │  - PUT: Create/Update connection                    │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────┐  │
│  │ Query Generator │  │ Encryption      │  │ Validator  │  │
│  │ (LangChain +    │  │ (CryptoJS)      │  │            │  │
│  │  Gemini AI)     │  │                 │  │            │  │
│  └─────────────────┘  └─────────────────┘  └────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────────┐          ┌─────────────────────────┐  │
│  │ Firestore        │          │ External Databases      │  │
│  │ - Connections    │          │ - PostgreSQL            │  │
│  │ - Schemas        │          │ - MySQL                 │  │
│  │ - Chat History   │          │ - MongoDB               │  │
│  └──────────────────┘          └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant API
    participant AI
    participant Firestore
    participant Database

    User->>UI: Ask question
    UI->>API: POST /api/database/query
    API->>Firestore: Fetch connection & schema
    Firestore-->>API: Return encrypted data
    API->>API: Decrypt credentials
    API->>AI: Generate query (LangChain + Gemini)
    AI-->>API: Return query + explanation
    API->>API: Validate query safety
    API->>Database: Execute query (optional)
    Database-->>API: Return results
    API-->>UI: Return response
    UI-->>User: Display results
```

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Hook Form** - Form management

### Backend
- **Next.js API Routes** - Serverless API
- **LangChain** - AI orchestration framework
- **Google Gemini 2.0 Flash** - AI model for query generation
- **CryptoJS** - Encryption/decryption

### Database & Storage
- **Firebase Firestore** - NoSQL database for metadata
  - Connection configurations
  - Schema cache
  - Chat history
- **Clerk** - Authentication

### Security
- **AES-256 Encryption** - Credential protection
- **Clerk Auth** - User authentication
- **Input Validation** - SQL injection prevention
- **Query Whitelisting** - Safety checks

---

## 📁 File Structure

```
src/
├── app/
│   ├── dashboard/
│   │   └── database/
│   │       ├── page.tsx                    # Main connections list
│   │       ├── connect/
│   │       │   └── page.tsx                # Add new connection
│   │       └── [id]/
│   │           └── page.tsx                # Chat interface
│   └── api/
│       └── database/
│           └── query/
│               └── route.ts                # API endpoints
│
├── lib/
│   └── agents/
│       └── database/
│           ├── index.ts                    # Module exports
│           ├── query-generator.ts          # AI query generation
│           ├── encryption.ts               # Credential encryption
│           └── validators.ts               # Query validation
│
└── types/
    └── index.ts                            # TypeScript definitions
```

### Key Files Explained

#### 🎯 Core Files

**1. `/src/lib/agents/database/query-generator.ts`**
- AI-powered natural language to SQL/NoSQL converter
- Uses LangChain + Google Gemini
- Schema-aware query generation
- Context from conversation history

**2. `/src/lib/agents/database/encryption.ts`**
- AES-256 encryption for database credentials
- Secure storage and retrieval
- Environment-based encryption keys

**3. `/src/lib/agents/database/validators.ts`**
- SQL/NoSQL query safety validation
- Destructive operation detection
- Read-only enforcement
- Performance warnings

**4. `/src/app/api/database/query/route.ts`**
- RESTful API endpoints
- Connection CRUD operations
- Query generation endpoint
- Authentication & authorization

#### 🎨 UI Components

**5. `/src/app/dashboard/database/page.tsx`**
- Connection list view
- Database type indicators
- Usage statistics
- Quick actions

**6. `/src/app/dashboard/database/connect/page.tsx`**
- New connection form
- Connection testing
- Credential input
- Database type selection

**7. `/src/app/dashboard/database/[id]/page.tsx`**
- Chat interface
- Query display
- Results visualization
- History tracking

---

## 📊 Data Models

### 1. Database Connection

Stored in Firestore: `database_connections` collection

```typescript
interface DatabaseConnection {
  id: string;                           // Firestore document ID
  userId: string;                       // Clerk user ID
  name: string;                         // User-friendly name
  type: DatabaseType;                   // "postgresql" | "mysql" | "mongodb"
  host: string;                         // Database host
  port: number;                         // Database port
  database: string;                     // Database name
  encryptedCredentials: string;         // AES-256 encrypted JSON
  schemaCache?: DatabaseSchema;         // Cached table/collection info
  schemaCacheUpdatedAt?: Timestamp;     // Cache timestamp
  createdAt: Timestamp;                 // Creation time
  lastUsedAt: Timestamp;                // Last query time
}
```

### 2. Database Credentials (Encrypted)

```typescript
interface DatabaseCredentials {
  host: string;                         // Database host
  port: number;                         // Database port
  database: string;                     // Database name
  username: string;                     // Database user
  password: string;                     // Database password
  ssl?: boolean;                        // SSL connection
  authSource?: string;                  // MongoDB auth database
}
```

### 3. Database Schema (Cached)

```typescript
interface DatabaseSchema {
  tables: TableSchema[];                // Array of tables/collections
  updatedAt: string;                    // ISO timestamp
}

interface TableSchema {
  name: string;                         // Table/collection name
  columns: ColumnSchema[];              // Column definitions
  primaryKey?: string[];                // Primary key columns
  foreignKeys?: ForeignKeySchema[];     // Foreign key relationships
}

interface ColumnSchema {
  name: string;                         // Column name
  type: string;                         // Data type
  nullable: boolean;                    // NULL allowed
  defaultValue?: string;                // Default value
  isPrimaryKey?: boolean;               // Is primary key
  isForeignKey?: boolean;               // Is foreign key
}
```

### 4. Chat Message

```typescript
interface ChatMessage {
  id: string;                           // Message ID
  role: "user" | "assistant" | "system"; // Message sender
  content: string;                      // Message text
  query?: string;                       // Generated SQL/NoSQL
  results?: unknown[];                  // Query results
  timestamp: Date;                      // Message time
}
```

---

## 🔌 API Endpoints

### POST `/api/database/query`

Generate SQL/NoSQL query from natural language.

**Request:**
```json
{
  "connectionId": "abc123",
  "question": "Show me all users who signed up last week",
  "execute": false
}
```

**Response:**
```json
{
  "success": true,
  "query": "SELECT * FROM users WHERE created_at >= NOW() - INTERVAL '7 days'",
  "explanation": "This query retrieves all users created in the last 7 days",
  "assumptions": [
    "Users table has a 'created_at' timestamp column",
    "Current date/time is used as reference"
  ],
  "warnings": [
    "May return large result set",
    "Consider adding LIMIT clause for performance"
  ],
  "executed": false,
  "result": null
}
```

### GET `/api/database/query`

Fetch database connections.

**Request:**
```
GET /api/database/query
GET /api/database/query?id=abc123
```

**Response (List):**
```json
{
  "connections": [
    {
      "connectionId": "abc123",
      "name": "Production DB",
      "type": "postgresql",
      "database": "myapp_prod",
      "host": "db.example.com",
      "lastUsedAt": "2026-01-01T12:00:00Z"
    }
  ]
}
```

**Response (Single):**
```json
{
  "connection": {
    "connectionId": "abc123",
    "name": "Production DB",
    "type": "postgresql",
    "database": "myapp_prod",
    "host": "db.example.com",
    "port": 5432,
    "schemaCache": {
      "tables": [...]
    }
  }
}
```

### PUT `/api/database/query`

Create or update database connection.

**Request:**
```json
{
  "name": "Production DB",
  "type": "postgresql",
  "host": "db.example.com",
  "port": 5432,
  "database": "myapp_prod",
  "username": "dbuser",
  "password": "********",
  "ssl": true
}
```

**Response:**
```json
{
  "success": true,
  "connectionId": "abc123"
}
```

---

## 👤 User Flows

### Flow 1: Adding a New Database Connection

```
1. User clicks "Add Connection" button
   ↓
2. Fills out connection form:
   - Name (e.g., "Production PostgreSQL")
   - Database type (PostgreSQL/MySQL/MongoDB)
   - Host (e.g., "db.example.com")
   - Port (e.g., 5432)
   - Database name
   - Username & Password
   ↓
3. (Optional) Test connection
   ↓
4. Submit form
   ↓
5. Backend encrypts credentials
   ↓
6. Saves to Firestore
   ↓
7. Redirects to chat interface
```

### Flow 2: Asking a Question

```
1. User selects a database connection
   ↓
2. Types natural language question:
   "How many users registered last month?"
   ↓
3. Clicks "Generate Query" or hits Enter
   ↓
4. Backend fetches connection & schema
   ↓
5. Sends to AI (LangChain + Gemini)
   ↓
6. AI generates SQL query
   ↓
7. Query is validated for safety
   ↓
8. Query + explanation returned to UI
   ↓
9. User reviews query
   ↓
10. (Optional) User executes query
    ↓
11. Results displayed in table
```

### Flow 3: Managing Connections

```
View Connections:
├── Dashboard → Database Agent
├── Lists all connections
├── Shows last used date
└── Shows conversation count

Edit Connection:
├── Click connection
├── View/Edit settings
└── Update credentials

Delete Connection:
├── Click delete
├── Confirm deletion
└── Removes from Firestore
```

---

## 🔐 Security & Encryption

### Credential Encryption

**Algorithm**: AES-256 (Advanced Encryption Standard)

**Process**:
```typescript
// Encryption
const credentials = {
  host: "db.example.com",
  username: "user",
  password: "secret123"
};

const json = JSON.stringify(credentials);
const encrypted = CryptoJS.AES.encrypt(json, ENCRYPTION_KEY).toString();
// Stored in Firestore

// Decryption
const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
const decrypted = bytes.toString(CryptoJS.enc.Utf8);
const credentials = JSON.parse(decrypted);
```

### Query Safety Validation

**Dangerous Operations Blocked**:
- `DELETE` - Data deletion
- `DROP` - Table/database deletion
- `TRUNCATE` - Table truncation
- `UPDATE` - Data modification (unless explicitly allowed)
- `INSERT` - Data insertion (unless explicitly allowed)
- `ALTER` - Schema changes
- `GRANT/REVOKE` - Permission changes

**Validation Rules**:
```typescript
const DANGEROUS_KEYWORDS = [
  'DELETE', 'DROP', 'TRUNCATE', 'ALTER',
  'GRANT', 'REVOKE', 'EXEC', 'EXECUTE'
];

const DESTRUCTIVE_KEYWORDS = [
  'UPDATE', 'INSERT', 'CREATE', 'REPLACE'
];

function validateQuery(query: string, type: DatabaseType) {
  // Check for dangerous keywords
  // Validate syntax
  // Check for multiple statements
  // Return { isSafe: boolean, warnings: string[] }
}
```

### Authentication & Authorization

**Authentication**: Clerk
- JWT-based session management
- Middleware protection on all routes

**Authorization**:
- Users can only access their own connections
- Connection ownership verified on every request
- Credentials never returned to client

---

## ⚙️ Setup & Configuration

### Prerequisites

1. **Node.js** 18+ and npm
2. **Firebase** project with Firestore enabled
3. **Clerk** account for authentication
4. **Google AI** API key (Gemini)

### Environment Variables

Add to `.env` or `.env.local`:

```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Google Gemini AI
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Encryption Key (generate with: openssl rand -hex 32)
CREDENTIALS_ENCRYPTION_KEY=your-64-character-hex-key
```

### Firestore Setup

**Create Collection**: `database_connections`

**Indexes Required**:
```javascript
// Composite index
{
  collection: "database_connections",
  fields: [
    { fieldPath: "userId", order: "ASCENDING" },
    { fieldPath: "lastUsedAt", order: "DESCENDING" }
  ]
}
```

**Security Rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /database_connections/{connectionId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### Installation Steps

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 3. Generate encryption key
openssl rand -hex 32
# Add to .env.local as CREDENTIALS_ENCRYPTION_KEY

# 4. Run development server
npm run dev

# 5. Navigate to Database Agent
http://localhost:3000/dashboard/database
```

---

## 💡 Usage Examples

### Example 1: Simple Query

**Question**: 
```
Show me all users
```

**Generated Query** (PostgreSQL):
```sql
SELECT * FROM users;
```

**Explanation**:
> This query retrieves all rows from the users table.

**Warnings**:
- May return large result set
- Consider adding LIMIT for better performance

---

### Example 2: Filtered Query

**Question**:
```
Find users who registered in the last 30 days
```

**Generated Query** (PostgreSQL):
```sql
SELECT * 
FROM users 
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;
```

**Explanation**:
> Retrieves users created within the last 30 days, sorted by most recent first.

**Assumptions**:
- Table has a `created_at` timestamp column

---

### Example 3: Aggregation

**Question**:
```
How many orders were placed each month this year?
```

**Generated Query** (PostgreSQL):
```sql
SELECT 
  DATE_TRUNC('month', order_date) as month,
  COUNT(*) as order_count
FROM orders
WHERE order_date >= DATE_TRUNC('year', NOW())
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY month;
```

**Explanation**:
> Groups orders by month for the current year and counts them.

---

### Example 4: Join Query

**Question**:
```
Show me all orders with customer names
```

**Generated Query** (PostgreSQL):
```sql
SELECT 
  o.id,
  o.order_date,
  o.total,
  c.name as customer_name,
  c.email
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id
ORDER BY o.order_date DESC;
```

**Explanation**:
> Joins orders and customers tables to show order details with customer information.

---

### Example 5: MongoDB Query

**Question**:
```
Find all products with price greater than 100
```

**Generated Query** (MongoDB):
```json
{
  "filter": {
    "price": { "$gt": 100 }
  },
  "sort": { "price": -1 }
}
```

**Explanation**:
> Finds products where price exceeds 100, sorted by price descending.

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "GEMINI_API_KEY is not configured"

**Cause**: Missing or invalid Google AI API key

**Solution**:
```bash
# Get key from: https://aistudio.google.com/apikey
# Add to .env.local:
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

#### 2. "CREDENTIALS_ENCRYPTION_KEY is not configured"

**Cause**: Missing encryption key for database credentials

**Solution**:
```bash
# Generate a secure key
openssl rand -hex 32

# Add to .env.local:
CREDENTIALS_ENCRYPTION_KEY=your-generated-key
```

#### 3. Connection Test Fails

**Possible Causes**:
- Incorrect host/port
- Database not accessible from server
- Firewall blocking connection
- Wrong credentials

**Solution**:
1. Verify database is running
2. Check firewall rules
3. Test connection from server terminal:
   ```bash
   # PostgreSQL
   psql -h host -p 5432 -U username -d database
   
   # MySQL
   mysql -h host -P 3306 -u username -p
   
   # MongoDB
   mongosh "mongodb://host:27017/database"
   ```

#### 4. Query Generation Returns Null

**Cause**: AI couldn't understand the question or schema

**Solutions**:
- Rephrase question more clearly
- Update schema cache
- Verify schema has relevant tables
- Check for table/column name typos

#### 5. "Query is blocked for safety"

**Cause**: Query contains destructive operations

**Solutions**:
- Review the blocked query
- If intentional, modify safety rules (advanced)
- Use database client for destructive operations

---

## 🚀 Future Enhancements

### Planned Features

#### Phase 1: Query Execution (Q1 2026)
- [ ] Direct query execution in sandbox
- [ ] Result caching
- [ ] Query history
- [ ] Export results (CSV, JSON, Excel)

#### Phase 2: Advanced AI (Q2 2026)
- [ ] Multi-turn conversation context
- [ ] Query optimization suggestions
- [ ] Index recommendations
- [ ] Data visualization generation

#### Phase 3: Collaboration (Q3 2026)
- [ ] Shared connections (team access)
- [ ] Query templates library
- [ ] Saved queries
- [ ] Scheduled queries

#### Phase 4: Enterprise (Q4 2026)
- [ ] Query approval workflows
- [ ] Audit logging
- [ ] Role-based access control
- [ ] SSO integration
- [ ] On-premise deployment

### Experimental Ideas

🧪 **Natural Language Data Updates**
- Allow UPDATE/INSERT via natural language
- Multi-step approval for destructive operations

🧪 **Auto-Generated Dashboards**
- Convert queries into visual dashboards
- Real-time data monitoring

🧪 **Schema Learning**
- AI learns from your queries
- Better suggestions over time

🧪 **Cross-Database Queries**
- Join data from multiple databases
- Unified view across PostgreSQL + MongoDB

---

## 📚 Additional Resources

### Related Documentation
- [Main GhostFounder README](/README.md)
- [Firebase Setup](/FIREBASE_SETUP_INSTRUCTIONS.md)
- [API Documentation](/docs/api.md)

### External Resources
- [LangChain Documentation](https://js.langchain.com/docs/)
- [Google Gemini API](https://ai.google.dev/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)

### Support & Community
- GitHub Issues: [Report a bug](https://github.com/anurag3407/ghosthunter/issues)
- Discussions: [Ask questions](https://github.com/anurag3407/ghosthunter/discussions)

---

## 🤝 Contributing

We welcome contributions! Areas that need help:

1. **Database Support**: Add support for more databases (SQLite, Redis, etc.)
2. **Query Optimizations**: Improve AI query generation
3. **UI/UX**: Better result visualization
4. **Testing**: Add unit and integration tests
5. **Documentation**: Improve examples and guides

---

## 📄 License

Part of the GhostFounder project. See main LICENSE file.

---

## 👥 Credits

**Created by**: GhostFounder Team  
**AI Model**: Google Gemini 2.0 Flash  
**Framework**: Next.js, LangChain  

---

**Last Updated**: January 1, 2026  
**Version**: 1.0.0
