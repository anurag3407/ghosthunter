# 🗄️ Database Agent - Quick Reference

> Quick lookup guide for Database Agent features

## 🎯 Quick Start (5 minutes)

```bash
# 1. Set environment variables
GEMINI_API_KEY=your_gemini_key
CREDENTIALS_ENCRYPTION_KEY=$(openssl rand -hex 32)

# 2. Start app
npm run dev

# 3. Navigate to Database Agent
http://localhost:3000/dashboard/database

# 4. Add a connection
Click "Add Connection" → Fill form → Save

# 5. Start asking questions!
"Show me all users who registered last month"
```

---

## 🔑 Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GEMINI_API_KEY` | ✅ Yes | Google AI API key | `AIzaSy...` |
| `CREDENTIALS_ENCRYPTION_KEY` | ✅ Yes | AES encryption key (64 chars) | Generate: `openssl rand -hex 32` |
| `FIREBASE_PROJECT_ID` | ✅ Yes | Firebase project ID | `my-project-123` |
| `FIREBASE_CLIENT_EMAIL` | ✅ Yes | Service account email | `firebase-adminsdk-...@my-project.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | ✅ Yes | Service account private key | `"-----BEGIN PRIVATE KEY-----\n..."` |

---

## 🗄️ Supported Databases

| Database | Type | Port | Connection String Example |
|----------|------|------|---------------------------|
| PostgreSQL | SQL | 5432 | `postgresql://user:pass@host:5432/dbname` |
| MySQL | SQL | 3306 | `mysql://user:pass@host:3306/dbname` |
| MongoDB | NoSQL | 27017 | `mongodb://user:pass@host:27017/dbname` |

---

## 💬 Example Questions

### Simple Queries
```
✅ "Show me all users"
✅ "How many products do we have?"
✅ "List the 10 most recent orders"
```

### Filtered Queries
```
✅ "Find users who signed up last week"
✅ "Show orders over $1000"
✅ "Get active subscriptions"
```

### Aggregations
```
✅ "Count users by country"
✅ "Sum of sales by month"
✅ "Average order value"
```

### Joins
```
✅ "Show orders with customer names"
✅ "List products with their categories"
✅ "Find users with their latest order"
```

### Complex Queries
```
✅ "Show top 5 customers by revenue this year"
✅ "Find products that haven't sold in 30 days"
✅ "Calculate monthly active users"
```

---

## 🔒 Safety Features

### ✅ Always Allowed
- `SELECT` - Read data
- `SHOW` - View schema
- `DESCRIBE` - Table info
- `EXPLAIN` - Query plans

### ⚠️ Warnings Shown
- Large result sets (>10,000 rows)
- Missing indexes
- Cross joins
- Complex subqueries

### ❌ Always Blocked
- `DELETE` - Data deletion
- `DROP` - Table/DB deletion  
- `TRUNCATE` - Clear tables
- `ALTER` - Schema changes
- `UPDATE` - Data modification (by default)
- `INSERT` - Data insertion (by default)

---

## 📁 File Locations

```
Core Logic:
├── src/lib/agents/database/
│   ├── query-generator.ts      # AI query generation
│   ├── encryption.ts           # Credential security
│   └── validators.ts           # Safety checks

API Endpoints:
└── src/app/api/database/
    └── query/route.ts          # REST API

UI Pages:
└── src/app/dashboard/database/
    ├── page.tsx                # Connections list
    ├── connect/page.tsx        # Add connection
    └── [id]/page.tsx           # Chat interface
```

---

## 🔌 API Quick Reference

### Generate Query
```bash
POST /api/database/query
Content-Type: application/json

{
  "connectionId": "abc123",
  "question": "Show all users",
  "execute": false
}
```

### List Connections
```bash
GET /api/database/query
```

### Get Single Connection
```bash
GET /api/database/query?id=abc123
```

### Create Connection
```bash
PUT /api/database/query
Content-Type: application/json

{
  "name": "My Database",
  "type": "postgresql",
  "host": "localhost",
  "port": 5432,
  "database": "mydb",
  "username": "user",
  "password": "pass"
}
```

---

## 🐛 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| "GEMINI_API_KEY not configured" | Add `GEMINI_API_KEY` to `.env.local` |
| "CREDENTIALS_ENCRYPTION_KEY not configured" | Generate key: `openssl rand -hex 32` |
| Connection test fails | Check host/port, verify DB is running |
| Query returns null | Rephrase question, update schema |
| "Query blocked for safety" | Use DB client for destructive ops |

---

## 🎨 UI Components

### Connection Card
```tsx
Shows:
- Database type icon (PostgreSQL/MySQL/MongoDB)
- Connection name
- Last used timestamp
- Chat count
- Quick access link
```

### Chat Interface
```tsx
Features:
- Natural language input
- Query preview
- Explanation panel
- Warning badges
- Copy query button
- Execute button (optional)
```

---

## 🔐 Security Checklist

- [x] Credentials encrypted with AES-256
- [x] Clerk authentication required
- [x] User can only access own connections
- [x] Dangerous queries blocked
- [x] SQL injection prevention
- [x] Read-only by default
- [x] No credentials in client-side code
- [x] Firestore security rules enforced

---

## 📊 Schema Format

```typescript
{
  "tables": [
    {
      "name": "users",
      "columns": [
        {
          "name": "id",
          "type": "integer",
          "nullable": false,
          "isPrimaryKey": true
        },
        {
          "name": "email",
          "type": "varchar(255)",
          "nullable": false
        }
      ],
      "primaryKey": ["id"],
      "foreignKeys": []
    }
  ],
  "updatedAt": "2026-01-01T12:00:00Z"
}
```

---

## 🚀 Performance Tips

1. **Cache Schema**: Schema is cached to reduce DB queries
2. **Limit Results**: Add LIMIT clause for large tables
3. **Use Indexes**: Ensure queries use indexed columns
4. **Avoid SELECT ***: Specify only needed columns
5. **Connection Pooling**: Reuse database connections

---

## 📈 Monitoring

Track in Firestore:
- `lastUsedAt` - Connection usage
- `conversationsCount` - Number of queries
- `schemaCacheUpdatedAt` - Schema freshness

---

## 🧪 Testing Connections

### PostgreSQL
```bash
psql -h localhost -p 5432 -U username -d database
```

### MySQL
```bash
mysql -h localhost -P 3306 -u username -p database
```

### MongoDB
```bash
mongosh "mongodb://localhost:27017/database"
```

---

## 🎓 Best Practices

### ✅ Do
- Start with simple questions
- Review generated queries before executing
- Use descriptive connection names
- Update schema cache regularly
- Test queries on dev/staging first

### ❌ Don't
- Execute untested queries on production
- Share database credentials
- Commit `.env` files
- Ignore performance warnings
- Use admin credentials for read-only access

---

## 📞 Support

- **Documentation**: `/DATABASE_AGENT_README.md`
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

**Version**: 1.0.0 | **Last Updated**: Jan 1, 2026
