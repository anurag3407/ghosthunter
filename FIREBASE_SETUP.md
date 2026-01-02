# Firebase Setup Guide for GhostFounder

This guide covers the complete Firebase configuration for the GhostFounder multi-user application.

## Quick Setup

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 2. Initialize Firebase in Project
```bash
firebase init
```
Select:
- **Firestore** (for database)
- **Storage** (optional, for file uploads)

### 3. Deploy Rules and Indexes
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

---

## Manual Index Creation

If you prefer to create indexes manually, click these links:

### Database Connections Index
[Create Index](https://console.firebase.google.com/v1/r/project/ghostfounder-a4994/firestore/indexes?create_composite=Cl9wcm9qZWN0cy9naG9zdGZvdW5kZXItYTQ5OTQvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2RhdGFiYXNlX2Nvbm5lY3Rpb25zL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg4KCmxhc3RVc2VkQXQQAhoMCghfX25hbWVfXxAC)

### Pitch Decks Index
[Create Index](https://console.firebase.google.com/v1/r/project/ghostfounder-a4994/firestore/indexes?create_composite=ClVwcm9qZWN0cy9naG9zdGZvdW5kZXItYTQ5OTQvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3BpdGNoRGVja3MvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg)

### Equity Projects Index
[Create Index](https://console.firebase.google.com/v1/r/project/ghostfounder-a4994/firestore/indexes?create_composite=Clpwcm9qZWN0cy9naG9zdGZvdW5kZXItYTQ5OTQvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2VxdWl0eV9wcm9qZWN0cy9pbmRleGVzL18QARoKCgZ1c2VySWQQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC)

---

## Environment Variables

Add these to your `.env` file:

```env
# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=ghostfounder-a4994
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@ghostfounder-a4994.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Encryption for database credentials
CREDENTIALS_ENCRYPTION_KEY=your-32-character-encryption-key

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

---

## Firestore Collections Structure

### users
```typescript
interface User {
  id: string;           // Same as Clerk userId
  clerkId: string;      // Clerk user ID
  email: string;
  name: string;
  imageUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### database_connections
```typescript
interface DatabaseConnection {
  id: string;
  userId: string;           // Owner's Clerk ID
  name: string;             // Display name
  type: 'postgres' | 'mongodb' | 'supabase';
  host: string;             // For display only
  database: string;         // For display only
  encryptedUri: string;     // AES-256 encrypted connection string
  conversationsCount: number;
  createdAt: Timestamp;
  lastUsedAt: Timestamp;
}
```

### database_conversations
```typescript
interface DatabaseConversation {
  id: string;
  userId: string;
  connectionId: string;
  title: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### database_conversations/{id}/messages
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  query?: string;           // Generated SQL/MongoDB query
  timestamp: Timestamp;
}
```

### pitchDecks
```typescript
interface PitchDeck {
  id: string;
  userId: string;
  title: string;
  repositoryUrl?: string;
  slides: Slide[];
  status: 'draft' | 'completed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### equity_projects
```typescript
interface EquityProject {
  id: string;
  userId: string;
  companyName: string;
  totalShares: number;
  shareholders: Shareholder[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### code_police_projects
```typescript
interface CodePoliceProject {
  id: string;
  userId: string;
  repositoryUrl: string;
  lastAnalyzedAt?: Timestamp;
  issuesCount: number;
  createdAt: Timestamp;
}
```

### github_connections
```typescript
interface GitHubConnection {
  id: string;
  userId: string;
  accessToken: string;      // Encrypted
  githubUsername: string;
  connectedAt: Timestamp;
}
```

---

## Firestore Indexes

All required indexes are defined in `firestore.indexes.json`. Deploy with:

```bash
firebase deploy --only firestore:indexes
```

### Index Summary

| Collection | Fields | Purpose |
|------------|--------|---------|
| database_connections | userId (ASC), lastUsedAt (DESC) | List user's connections |
| database_conversations | connectionId (ASC), updatedAt (DESC) | List conversations for connection |
| database_conversations | userId (ASC), updatedAt (DESC) | List user's conversations |
| pitchDecks | userId (ASC), createdAt (DESC) | List user's pitch decks |
| equity_projects | userId (ASC), createdAt (DESC) | List user's equity projects |
| code_police_projects | userId (ASC), createdAt (DESC) | List user's code projects |
| github_connections | userId (ASC), connectedAt (DESC) | List user's GitHub connections |

---

## Security Rules

Security rules are defined in `firestore.rules`. Key principles:

1. **User Isolation**: Users can only read/write their own documents
2. **Owner Validation**: All writes validate `userId` matches authenticated user
3. **Subcollection Access**: Inherited from parent document ownership
4. **Immutable Records**: Some data (messages, analyses) cannot be updated

Deploy with:
```bash
firebase deploy --only firestore:rules
```

---

## Clerk + Firebase Integration

The app uses Clerk for authentication but Firebase Admin SDK for database. The integration works as follows:

1. **Clerk handles auth**: Sign-up, sign-in, session management
2. **Firebase Admin SDK**: Server-side database operations using Clerk's `userId`
3. **No client-side Firebase**: All Firestore operations go through API routes

### Why this approach?
- Clerk provides better auth UX and security
- Firebase Admin SDK doesn't require client-side Firebase setup
- API routes can validate Clerk session before database access

---

## Troubleshooting

### "The query requires an index"
Click the link in the error message to create the index, or deploy all indexes:
```bash
firebase deploy --only firestore:indexes
```

### "Firebase Admin not initialized"
Check your environment variables:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (must include `\n` characters)

### "Permission denied"
1. Check Firestore rules allow the operation
2. Verify `userId` field matches authenticated user
3. Ensure API route is validating Clerk session

---

## Production Deployment

Before deploying to production:

1. **Deploy Firestore rules**: `firebase deploy --only firestore:rules`
2. **Deploy indexes**: `firebase deploy --only firestore:indexes`
3. **Use production Clerk keys**: Update `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
4. **Generate encryption key**: Use `openssl rand -hex 32` for `CREDENTIALS_ENCRYPTION_KEY`
5. **Enable Firebase Security**: Review and tighten Firestore rules
