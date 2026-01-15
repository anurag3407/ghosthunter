# 🔌 GhostFounder API Reference

> **Complete API Documentation for All Endpoints**

This document provides comprehensive documentation for all GhostFounder API endpoints, including request/response formats, authentication, and examples.

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Code Police API](#code-police-api)
5. [Pitch Deck API](#pitch-deck-api)
6. [Equity API](#equity-api)
7. [Database Agent API](#database-agent-api)
8. [Webhooks API](#webhooks-api)
9. [Health API](#health-api)

---

## 🎯 Overview

### Base URL

```
Production: https://ghostfounder.up.railway.app/api
Development: http://localhost:3000/api
```

### Request Format

All requests should include:
- `Content-Type: application/json` (for POST/PUT requests)
- Authentication header (see Authentication section)

### Response Format

All responses follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
```

---

## 🔐 Authentication

GhostFounder uses **Clerk** for authentication. All protected endpoints require a valid session.

### Session-Based Authentication

For browser clients, Clerk handles authentication automatically via cookies:

```typescript
// Frontend - automatic via ClerkProvider
const { userId } = useAuth();
```

### Server-to-Server Authentication

For server-side or API integrations, use Clerk JWT tokens:

```bash
# Request
curl -X GET "https://ghostfounder.up.railway.app/api/code-police/projects" \
  -H "Authorization: Bearer YOUR_CLERK_SESSION_TOKEN"
```

### Protected Routes

The following routes require authentication:

| Route Pattern | Access Level |
|---------------|--------------|
| `/api/code-police/*` | Authenticated users |
| `/api/pitch-deck/*` | Authenticated users |
| `/api/equity/*` | Authenticated users |
| `/api/database/*` | Authenticated users |
| `/api/webhooks/github` | GitHub (signature verification) |
| `/api/health` | Public |

---

## ❌ Error Handling

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `BAD_REQUEST` | 400 | Invalid request parameters |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `AI_ERROR` | 500 | AI service error |
| `EXTERNAL_API_ERROR` | 502 | External service failed |

### Error Response Example

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid repository URL",
    "details": {
      "field": "repoUrl",
      "reason": "Must be a valid GitHub URL"
    }
  }
}
```

---

## 🛡️ Code Police API

### List Projects

Get all Code Police projects for the authenticated user.

```http
GET /api/code-police/projects
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "proj_abc123",
      "repoFullName": "username/repository",
      "repoOwner": "username",
      "repoName": "repository",
      "webhookId": 12345678,
      "isActive": true,
      "settings": {
        "emailEnabled": true,
        "emailRecipients": ["dev@example.com"],
        "categories": ["security", "performance", "bugs"]
      },
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "total": 1
  }
}
```

### Create Project

Connect a new GitHub repository to Code Police.

```http
POST /api/code-police/projects
```

**Request Body:**
```json
{
  "repoFullName": "username/repository",
  "installationId": 12345678
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "proj_abc123",
    "repoFullName": "username/repository",
    "webhookId": 12345678,
    "webhookUrl": "https://ghostfounder.up.railway.app/api/webhooks/github",
    "createdAt": "2026-01-15T10:00:00Z"
  }
}
```

### Get Project Details

```http
GET /api/code-police/projects/{projectId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "proj_abc123",
    "repoFullName": "username/repository",
    "settings": {
      "emailEnabled": true,
      "emailRecipients": ["dev@example.com"],
      "categories": ["security", "performance", "bugs", "readability"],
      "minSeverity": "medium"
    },
    "stats": {
      "totalRuns": 42,
      "totalIssues": 156,
      "lastRunAt": "2026-01-15T09:30:00Z"
    }
  }
}
```

### Update Project Settings

```http
PUT /api/code-police/projects/{projectId}/settings
```

**Request Body:**
```json
{
  "emailEnabled": true,
  "emailRecipients": ["dev@example.com", "lead@example.com"],
  "categories": ["security", "performance", "bugs"],
  "minSeverity": "low"
}
```

### Delete Project

```http
DELETE /api/code-police/projects/{projectId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted": true,
    "webhookRemoved": true
  }
}
```

### List Analysis Runs

```http
GET /api/code-police/projects/{projectId}/runs
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Results per page |
| `status` | string | all | Filter by status |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "run_xyz789",
      "projectId": "proj_abc123",
      "commitSha": "abc123def456",
      "branch": "main",
      "status": "completed",
      "issueCount": {
        "critical": 0,
        "high": 2,
        "medium": 5,
        "low": 8,
        "info": 3
      },
      "filesAnalyzed": 12,
      "createdAt": "2026-01-15T09:30:00Z",
      "completedAt": "2026-01-15T09:30:45Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42
  }
}
```

### Get Run Details

```http
GET /api/code-police/runs/{runId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "run_xyz789",
    "projectId": "proj_abc123",
    "commitSha": "abc123def456",
    "commitMessage": "Add new feature",
    "author": "developer",
    "branch": "main",
    "status": "completed",
    "summary": "Found 2 high-severity issues in authentication module...",
    "issues": [
      {
        "id": "issue_001",
        "file": "src/auth/login.ts",
        "line": 42,
        "category": "security",
        "severity": "high",
        "title": "Potential SQL injection vulnerability",
        "description": "User input is directly concatenated into SQL query...",
        "suggestion": "Use parameterized queries instead of string concatenation",
        "codeSnippet": "const query = `SELECT * FROM users WHERE id = ${userId}`"
      }
    ],
    "createdAt": "2026-01-15T09:30:00Z"
  }
}
```

---

## 📊 Pitch Deck API

### List Decks

```http
GET /api/pitch-deck/decks
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "deck_abc123",
      "projectName": "My Startup",
      "tagline": "Revolutionizing the industry",
      "status": "completed",
      "slidesCount": 12,
      "overallScore": 85,
      "createdAt": "2026-01-15T10:00:00Z",
      "updatedAt": "2026-01-15T14:30:00Z"
    }
  ]
}
```

### Generate Deck

Generate a new pitch deck from README content.

```http
POST /api/pitch-deck/generate
```

**Request Body:**
```json
{
  "readme": "# My Startup\n\nA platform for...",
  "profile": {
    "stage": "pre-seed",
    "industry": "fintech",
    "targetAudience": "investors",
    "fundingGoal": "$500K"
  },
  "githubMeta": {
    "owner": "username",
    "repo": "project",
    "stars": 1234,
    "language": "TypeScript",
    "topics": ["ai", "startup"]
  },
  "deckStyle": "pre-seed",
  "tone": "professional"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "projectName": "My Startup",
    "tagline": "Revolutionizing fintech with AI",
    "overallScore": 82,
    "slides": [
      {
        "id": "slide_001",
        "type": "title",
        "order": 0,
        "layout": "title-centered",
        "elements": [
          {
            "id": "elem_001",
            "type": "heading",
            "content": "My Startup",
            "x": 60,
            "y": 320,
            "width": 1160,
            "height": 100
          }
        ],
        "contentScore": 90
      }
    ],
    "missingSlides": ["traction", "team"],
    "globalSuggestions": [
      "Add specific metrics to strengthen credibility",
      "Include team backgrounds"
    ]
  }
}
```

### Fetch GitHub README

```http
GET /api/pitch-deck/github?owner={owner}&repo={repo}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `owner` | string | Yes | GitHub username/org |
| `repo` | string | Yes | Repository name |

**Response:**
```json
{
  "success": true,
  "data": {
    "readme": "# Project Name\n\n## Overview\n...",
    "metadata": {
      "name": "project",
      "description": "A cool project",
      "stars": 1234,
      "forks": 56,
      "language": "TypeScript",
      "topics": ["ai", "startup"],
      "createdAt": "2025-01-01T00:00:00Z"
    }
  }
}
```

### Get Deck Details

```http
GET /api/pitch-deck/decks/{deckId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "deck_abc123",
    "userId": "user_xyz",
    "projectName": "My Startup",
    "tagline": "Revolutionizing the industry",
    "status": "completed",
    "style": "pre-seed",
    "theme": {
      "id": "default",
      "colors": {
        "primary": "#3B82F6",
        "background": "#0F172A"
      }
    },
    "slides": [...],
    "overallScore": 85,
    "createdAt": "2026-01-15T10:00:00Z"
  }
}
```

### Save Deck

```http
POST /api/pitch-deck/decks
```

**Request Body:**
```json
{
  "projectName": "My Startup",
  "tagline": "Revolutionizing the industry",
  "style": "seed",
  "theme": {
    "id": "default"
  },
  "slides": [...]
}
```

### Update Deck

```http
PUT /api/pitch-deck/decks/{deckId}
```

**Request Body:**
```json
{
  "projectName": "Updated Name",
  "slides": [...]
}
```

### Delete Deck

```http
DELETE /api/pitch-deck/decks/{deckId}
```

### Export Deck

```http
POST /api/pitch-deck/export
```

**Request Body:**
```json
{
  "deckId": "deck_abc123",
  "format": "pdf",
  "quality": "high",
  "options": {
    "includeNotes": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://storage.example.com/exports/deck_abc123.pdf",
    "expiresAt": "2026-01-16T10:00:00Z"
  }
}
```

---

## 💰 Equity API

### List Equity Projects

```http
GET /api/equity/projects
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "eq_abc123",
      "name": "Startup Equity Pool",
      "contractAddress": "0x1234...abcd",
      "network": "sepolia",
      "totalSupply": "1000000",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

### Create Equity Project

```http
POST /api/equity/projects
```

**Request Body:**
```json
{
  "name": "My Startup Equity",
  "contractAddress": "0x1234...abcd",
  "network": "sepolia"
}
```

### Get Project Details

```http
GET /api/equity/projects/{projectId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "eq_abc123",
    "name": "Startup Equity Pool",
    "contractAddress": "0x1234...abcd",
    "network": "sepolia",
    "totalSupply": "1000000",
    "holders": [
      {
        "address": "0xabc...123",
        "balance": "500000",
        "percentage": 50
      },
      {
        "address": "0xdef...456",
        "balance": "300000",
        "percentage": 30
      }
    ],
    "transactions": [
      {
        "hash": "0xtx...",
        "type": "transfer",
        "from": "0xabc...123",
        "to": "0xdef...456",
        "amount": "100000",
        "timestamp": "2026-01-15T12:00:00Z"
      }
    ]
  }
}
```

---

## 💾 Database Agent API

### List Connections

```http
GET /api/database/connections
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "conn_abc123",
      "name": "Production DB",
      "type": "postgresql",
      "host": "db.example.com",
      "database": "myapp",
      "status": "connected",
      "lastUsed": "2026-01-15T10:00:00Z"
    }
  ]
}
```

### Create Connection

```http
POST /api/database/connections
```

**Request Body:**
```json
{
  "name": "Production Database",
  "type": "postgresql",
  "host": "db.example.com",
  "port": 5432,
  "database": "myapp",
  "username": "readonly_user",
  "password": "secure_password",
  "ssl": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "conn_abc123",
    "name": "Production Database",
    "type": "postgresql",
    "status": "connected",
    "schema": {
      "tables": [
        {
          "name": "users",
          "columns": [
            { "name": "id", "type": "integer" },
            { "name": "email", "type": "varchar(255)" }
          ]
        }
      ]
    }
  }
}
```

### Test Connection

```http
POST /api/database/connections/{connectionId}/test
```

**Response:**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "latency": 45,
    "version": "PostgreSQL 15.2"
  }
}
```

### Get Connection Schema

```http
GET /api/database/connections/{connectionId}/schema
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tables": [
      {
        "name": "users",
        "columns": [
          { "name": "id", "type": "integer", "nullable": false, "primaryKey": true },
          { "name": "email", "type": "varchar(255)", "nullable": false },
          { "name": "name", "type": "varchar(100)", "nullable": true },
          { "name": "created_at", "type": "timestamp", "nullable": false }
        ],
        "rowCount": 15420
      }
    ],
    "views": [],
    "updatedAt": "2026-01-15T10:00:00Z"
  }
}
```

### Execute Natural Language Query

```http
POST /api/database/query
```

**Request Body:**
```json
{
  "connectionId": "conn_abc123",
  "question": "How many users signed up last month?",
  "executeQuery": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "question": "How many users signed up last month?",
    "query": "SELECT COUNT(*) as user_count FROM users WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND created_at < DATE_TRUNC('month', CURRENT_DATE)",
    "queryType": "SELECT",
    "explanation": "This query counts the number of users whose created_at timestamp falls within the previous calendar month.",
    "assumptions": [
      "Using the 'created_at' column to determine signup date",
      "'Last month' refers to the previous calendar month"
    ],
    "warnings": [],
    "results": [
      { "user_count": 1542 }
    ],
    "rowCount": 1,
    "executionTime": 45
  }
}
```

### Delete Connection

```http
DELETE /api/database/connections/{connectionId}
```

---

## 🔔 Webhooks API

### GitHub Webhook

Receives push and pull request events from GitHub.

```http
POST /api/webhooks/github
```

**Headers:**
```
X-GitHub-Event: push
X-GitHub-Delivery: abc123
X-Hub-Signature-256: sha256=...
```

**Request Body (Push Event):**
```json
{
  "ref": "refs/heads/main",
  "repository": {
    "full_name": "username/repository",
    "private": false
  },
  "commits": [
    {
      "id": "abc123def456",
      "message": "Add new feature",
      "author": {
        "name": "Developer",
        "email": "dev@example.com"
      },
      "added": ["src/new-file.ts"],
      "modified": ["src/existing.ts"],
      "removed": []
    }
  ],
  "pusher": {
    "name": "developer"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "runId": "run_xyz789",
    "status": "processing"
  }
}
```

### Clerk Webhook

Syncs user data from Clerk.

```http
POST /api/webhooks/clerk
```

**Headers:**
```
svix-id: msg_...
svix-timestamp: 1234567890
svix-signature: v1,...
```

---

## 🏥 Health API

### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-15T10:00:00Z",
  "version": "1.0.0",
  "services": {
    "firebase": "healthy",
    "clerk": "healthy",
    "gemini": "healthy"
  }
}
```

### Detailed Health Check

```http
GET /api/health/detailed
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-15T10:00:00Z",
  "version": "1.0.0",
  "uptime": 86400,
  "services": {
    "firebase": {
      "status": "healthy",
      "latency": 25
    },
    "clerk": {
      "status": "healthy",
      "latency": 50
    },
    "gemini": {
      "status": "healthy",
      "latency": 150
    }
  },
  "memory": {
    "used": 256000000,
    "total": 512000000
  }
}
```

---

## 📚 Rate Limits

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| `/api/pitch-deck/generate` | 10 requests | 1 hour |
| `/api/database/query` | 100 requests | 1 hour |
| `/api/code-police/*` | 1000 requests | 1 hour |
| All other endpoints | 100 requests | 1 minute |

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642521600
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 60
    }
  }
}
```

---

## 🔧 SDK Examples

### JavaScript/TypeScript

```typescript
// Using fetch
async function generatePitchDeck(readme: string) {
  const response = await fetch('/api/pitch-deck/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      readme,
      deckStyle: 'seed',
      tone: 'professional',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  return response.json();
}
```

### cURL

```bash
# Generate pitch deck
curl -X POST "https://ghostfounder.up.railway.app/api/pitch-deck/generate" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=YOUR_SESSION_COOKIE" \
  -d '{
    "readme": "# My Startup\n\nDescription...",
    "deckStyle": "seed",
    "tone": "professional"
  }'
```

---

## 📄 Related Documentation

- [README.md](./README.md) - Project overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [CODE_POLICE_README.md](./CODE_POLICE_README.md) - Code Police feature
- [PITCH_DECK_README.md](./PITCH_DECK_README.md) - Pitch Deck feature
- [DATABASE_AGENT_README.md](./DATABASE_AGENT_README.md) - Database Agent feature

---

<div align="center">

**Build integrations with confidence**

[Back to Main README](./README.md)

</div>
