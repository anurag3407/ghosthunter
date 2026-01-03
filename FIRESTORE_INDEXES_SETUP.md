# Firestore Indexes Setup Guide

This guide explains how to manually create all required Firestore indexes for the GhostFounder application.

## Why Indexes Are Required

Firestore requires composite indexes for queries that:
- Filter on one field AND order by another field
- Filter on multiple fields
- Use array-contains with additional filters

Without these indexes, queries will fail with a `FAILED_PRECONDITION` error.

---

## Quick Setup via Firebase Console

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **ghostfounder-a4994**
3. Navigate to **Firestore Database** → **Indexes** tab

### Step 2: Create Each Index

Click **"Create Index"** and add each of the following indexes:

---

## Required Indexes

### 1. Database Connections Index
**Collection:** `database_connections`

| Field | Order |
|-------|-------|
| `userId` | Ascending |
| `lastUsedAt` | Descending |

**Purpose:** Lists user's database connections sorted by most recently used.

---

### 2. Database Conversations Index (by Connection)
**Collection:** `database_conversations`

| Field | Order |
|-------|-------|
| `connectionId` | Ascending |
| `updatedAt` | Descending |

**Purpose:** Lists conversations for a specific database connection.

---

### 3. Database Conversations Index (by User)
**Collection:** `database_conversations`

| Field | Order |
|-------|-------|
| `userId` | Ascending |
| `updatedAt` | Descending |

**Purpose:** Lists all conversations for a user across all connections.

---

### 4. Pitch Decks Index
**Collection:** `pitchDecks`

| Field | Order |
|-------|-------|
| `userId` | Ascending |
| `createdAt` | Descending |

**Purpose:** Lists user's pitch decks sorted by creation date.

---

### 5. Equity Projects Index
**Collection:** `equity_projects`

| Field | Order |
|-------|-------|
| `userId` | Ascending |
| `createdAt` | Descending |

**Purpose:** Lists user's equity distribution projects.

---

### 6. Code Police Projects Index
**Collection:** `code_police_projects`

| Field | Order |
|-------|-------|
| `userId` | Ascending |
| `createdAt` | Descending |

**Purpose:** Lists user's Code Police projects (legacy collection).

---

### 7. GitHub Connections Index
**Collection:** `github_connections`

| Field | Order |
|-------|-------|
| `userId` | Ascending |
| `connectedAt` | Descending |

**Purpose:** Lists user's connected GitHub repositories.

---

### 8. Users Index
**Collection:** `users`

| Field | Order |
|-------|-------|
| `clerkId` | Ascending |

**Purpose:** Lookup users by their Clerk authentication ID.

---

### 9. Projects Index ⭐ (Most Important)
**Collection:** `projects`

| Field | Order |
|-------|-------|
| `userId` | Ascending |
| `createdAt` | Descending |

**Purpose:** Lists user's Code Police projects from the main projects collection.

---

## Alternative: Deploy via CLI

If you prefer to use the Firebase CLI:

```bash
# Login to Firebase
firebase login

# Deploy indexes
firebase deploy --only firestore:indexes --project ghostfounder-a4994
```

---

## Verifying Indexes

After creating indexes, they may take a few minutes to build. You can check the status:

1. Go to **Firestore Database** → **Indexes**
2. Look for the **Status** column
3. Wait until all indexes show **"Enabled"** (green checkmark)

---

## Index Build Time

- **Simple indexes:** 1-5 minutes
- **Large collections:** Can take 10-30 minutes or more

The application will work once indexes are enabled. Until then, affected queries will fail.

---

## Troubleshooting

### Error: "The query requires an index"
This means a required index is missing. The error message includes a direct link to create the index:

```
https://console.firebase.google.com/v1/r/project/ghostfounder-a4994/firestore/indexes?create_composite=...
```

Click the link to auto-create the missing index.

### Error: "Index already exists"
The index is already created. Check if it's still building in the Indexes tab.

### Error: "Permission denied"
Make sure you're logged into Firebase with an account that has access to the project.

---

## Index Configuration File

All indexes are defined in `firestore.indexes.json` at the project root. This file is used by the Firebase CLI for deployment.

```json
{
    "indexes": [
        {
            "collectionGroup": "projects",
            "queryScope": "COLLECTION",
            "fields": [
                { "fieldPath": "userId", "order": "ASCENDING" },
                { "fieldPath": "createdAt", "order": "DESCENDING" }
            ]
        }
        // ... more indexes
    ]
}
```

---

## Summary Checklist

- [ ] `database_connections` (userId + lastUsedAt)
- [ ] `database_conversations` (connectionId + updatedAt)
- [ ] `database_conversations` (userId + updatedAt)
- [ ] `pitchDecks` (userId + createdAt)
- [ ] `equity_projects` (userId + createdAt)
- [ ] `code_police_projects` (userId + createdAt)
- [ ] `github_connections` (userId + connectedAt)
- [ ] `users` (clerkId)
- [ ] `projects` (userId + createdAt) ⭐

Once all indexes are enabled, your GhostFounder application will be fully operational!
