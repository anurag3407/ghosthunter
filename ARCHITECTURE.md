# 🏗️ GhostFounder Architecture

> **System Design & Technical Architecture Documentation**

This document provides a comprehensive overview of the GhostFounder platform architecture, including system design, component interactions, data flow, and technical decisions.

---

## 📑 Table of Contents

1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [AI/ML Architecture](#aiml-architecture)
6. [Blockchain Architecture](#blockchain-architecture)
7. [Database Design](#database-design)
8. [Authentication & Security](#authentication--security)
9. [API Design](#api-design)
10. [Deployment Architecture](#deployment-architecture)
11. [Performance & Scalability](#performance--scalability)
12. [Monitoring & Observability](#monitoring--observability)

---

## 🎯 System Overview

### Platform Components

GhostFounder is a multi-feature platform consisting of four main modules:

```
┌─────────────────────────────────────────────────────────────────┐
│                      GHOSTFOUNDER PLATFORM                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────┐ │
│  │   🛡️ Code   │  │  📊 Pitch   │  │  💰 Equity  │  │ 💾 DB  │ │
│  │   Police    │  │   Deck      │  │  Distribution│  │ Agent  │ │
│  │             │  │   Studio    │  │             │  │        │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────┘ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                    SHARED INFRASTRUCTURE                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │   Auth   │  │ Database │  │    AI    │  │    Blockchain    │ │
│  │  (Clerk) │  │(Firebase)│  │ (Gemini) │  │   (Ethereum)     │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Core Principles

1. **Modularity**: Each feature is independent but shares common infrastructure
2. **AI-First**: AI augments every major feature
3. **Security-First**: End-to-end encryption, secure authentication
4. **Developer Experience**: TypeScript, modern tooling, comprehensive docs
5. **Scalability**: Cloud-native, serverless architecture

---

## 🌐 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Browser   │  │   Mobile    │  │    CLI      │  │   Webhooks  │ │
│  │   (React)   │  │   (Future)  │  │   (Future)  │  │   (GitHub)  │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │
└─────────┼────────────────┼────────────────┼────────────────┼────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         EDGE / CDN                                   │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    Railway / Netlify Edge                       │ │
│  │                    (Static Assets, Caching)                     │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                               │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    Next.js 16 Application                       │ │
│  │                                                                 │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │ │
│  │  │   Pages     │  │ API Routes  │  │    Server Components    │ │ │
│  │  │  (React)    │  │  (Node.js)  │  │   (React Server)        │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   EXTERNAL APIs  │    │    DATA STORES   │    │   BLOCKCHAIN     │
│                  │    │                  │    │                  │
│  ├─ Clerk (Auth) │    │  ├─ Firestore    │    │  ├─ Ethereum     │
│  ├─ Gemini (AI)  │    │  ├─ PostgreSQL   │    │  │   Sepolia     │
│  ├─ GitHub API   │    │  ├─ MySQL        │    │  │               │
│  ├─ Resend       │    │  └─ MongoDB      │    │  └─ Smart        │
│  │   (Email)     │    │                  │    │      Contracts   │
│  └─ Infura       │    │                  │    │                  │
│      (RPC)       │    │                  │    │                  │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

---

## 🎨 Frontend Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 16 (App Router) | Full-stack React framework |
| **Language** | TypeScript 5.x | Type safety |
| **Styling** | Tailwind CSS 4.0 | Utility-first CSS |
| **Components** | Radix UI | Accessible primitives |
| **Animation** | Framer Motion | Animations |
| **State** | Zustand | Global state |
| **Data Fetching** | TanStack Query, SWR | Server state |
| **Forms** | React Hook Form + Zod | Form handling |

### Component Architecture

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (providers, fonts)
│   ├── page.tsx                  # Landing page
│   ├── providers.tsx             # Client providers wrapper
│   │
│   ├── (marketing)/              # Public marketing pages
│   │   ├── page.tsx              # Homepage
│   │   └── pricing/
│   │
│   ├── (auth)/                   # Authentication routes
│   │   ├── sign-in/
│   │   └── sign-up/
│   │
│   ├── dashboard/                # Protected app routes
│   │   ├── layout.tsx            # Dashboard shell
│   │   ├── page.tsx              # Dashboard home
│   │   ├── code-police/
│   │   ├── pitch-deck/
│   │   ├── equity/
│   │   └── database/
│   │
│   └── api/                      # API routes
│       ├── auth/
│       ├── code-police/
│       ├── pitch-deck/
│       ├── equity/
│       ├── database/
│       └── webhooks/
│
├── components/
│   ├── ui/                       # Shared UI primitives
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ...
│   │
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Shell.tsx
│   │
│   ├── code-police/              # Feature components
│   ├── pitch-deck/
│   ├── equity/
│   └── providers/                # Context providers
│
├── lib/                          # Utilities & services
│   ├── utils.ts                  # Helper functions
│   ├── constants.ts              # App constants
│   ├── firebase/                 # Firebase config
│   ├── agents/                   # AI agents
│   └── pitch-deck/               # Deck generation
│
└── types/                        # TypeScript types
    ├── index.ts
    └── pitch-deck.ts
```

### Rendering Strategy

| Route Type | Rendering | Caching |
|------------|-----------|---------|
| Marketing pages | Static (SSG) | CDN cached |
| Dashboard pages | Dynamic (SSR) | No cache |
| API routes | Serverless | Edge cached |
| Auth pages | Client-side | No cache |

### State Management

```typescript
// Zustand store example
import { create } from 'zustand';

interface DeckEditorState {
  selectedSlideId: string | null;
  selectedElementId: string | null;
  zoom: number;
  actions: {
    selectSlide: (id: string) => void;
    selectElement: (id: string) => void;
    setZoom: (zoom: number) => void;
  };
}

export const useDeckEditor = create<DeckEditorState>((set) => ({
  selectedSlideId: null,
  selectedElementId: null,
  zoom: 1,
  actions: {
    selectSlide: (id) => set({ selectedSlideId: id }),
    selectElement: (id) => set({ selectedElementId: id }),
    setZoom: (zoom) => set({ zoom }),
  },
}));
```

---

## ⚙️ Backend Architecture

### API Layer (Next.js API Routes)

```typescript
// Route structure
src/app/api/
├── auth/
│   └── [...nextauth]/route.ts    # OAuth callbacks
│
├── webhooks/
│   ├── github/route.ts           # GitHub webhook handler
│   └── clerk/route.ts            # Clerk webhook handler
│
├── code-police/
│   ├── projects/
│   │   └── route.ts              # GET, POST projects
│   ├── analysis/
│   │   └── route.ts              # GET analysis runs
│   └── settings/
│       └── route.ts              # GET, PUT settings
│
├── pitch-deck/
│   ├── decks/
│   │   └── route.ts              # CRUD decks
│   ├── generate/
│   │   └── route.ts              # AI generation
│   └── export/
│       └── route.ts              # PDF export
│
├── equity/
│   └── projects/
│       └── route.ts              # CRUD equity projects
│
└── database/
    ├── connections/
    │   └── route.ts              # Manage DB connections
    └── query/
        └── route.ts              # Execute queries
```

### API Design Patterns

```typescript
// Standard API response structure
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Route handler example
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    // 2. Validate input
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');

    // 3. Business logic
    const data = await fetchProjectData(userId, projectId);

    // 4. Return response
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An error occurred' } },
      { status: 500 }
    );
  }
}
```

### Middleware

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/code-police(.*)',
  '/api/pitch-deck(.*)',
  '/api/equity(.*)',
  '/api/database(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});
```

---

## 🤖 AI/ML Architecture

### AI Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **LLM** | Google Gemini 2.0 Flash | Text generation |
| **Framework** | LangChain | AI orchestration |
| **Embeddings** | (Future) | Semantic search |
| **Output Parsing** | Zod | Structured outputs |

### AI Agent Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI AGENT LAYER                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               LangChain Orchestration               │   │
│  │                                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │   Prompt    │  │   Chain     │  │  Output    │  │   │
│  │  │  Templates  │  │  Execution  │  │  Parsers   │  │   │
│  │  └─────────────┘  └─────────────┘  └────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│  ┌───────────────────────┴───────────────────────────┐     │
│  │                   AI AGENTS                        │     │
│  │                                                    │     │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐   │     │
│  │  │   Code     │  │   Deck     │  │  Database  │   │     │
│  │  │  Analyzer  │  │ Generator  │  │   Query    │   │     │
│  │  │   Agent    │  │   Agent    │  │   Agent    │   │     │
│  │  └────────────┘  └────────────┘  └────────────┘   │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              GOOGLE GEMINI 2.0 FLASH                        │
│                                                             │
│  Features:                                                  │
│  • 1M token context window                                  │
│  • Fast inference (~1-2s)                                   │
│  • JSON mode support                                        │
│  • Code understanding                                       │
└─────────────────────────────────────────────────────────────┘
```

### Agent Implementations

#### 1. Code Police Agent

```typescript
// Simplified agent structure
class CodeAnalyzerAgent {
  private llm: ChatGoogleGenerativeAI;
  private outputParser: StructuredOutputParser;

  async analyzeFile(file: FileContent): Promise<CodeIssue[]> {
    const prompt = PromptTemplate.fromTemplate(`
      Analyze this code for issues:
      
      File: {filename}
      Language: {language}
      Content:
      \`\`\`
      {content}
      \`\`\`
      
      Find: security vulnerabilities, performance issues, bugs,
      code style problems, missing tests.
      
      {format_instructions}
    `);

    const chain = prompt.pipe(this.llm).pipe(this.outputParser);
    return chain.invoke({
      filename: file.name,
      language: file.language,
      content: file.content,
      format_instructions: this.outputParser.getFormatInstructions(),
    });
  }
}
```

#### 2. Pitch Deck Agent

```typescript
class DeckGeneratorAgent {
  async generateDeck(input: GenerateDeckRequest): Promise<Deck> {
    // 1. Analyze README
    const analysis = await this.analyzeReadme(input.readme);
    
    // 2. Determine slide structure
    const slideTypes = this.getEssentialSlides(input.deckStyle);
    
    // 3. Generate each slide
    const slides = await Promise.all(
      slideTypes.map(type => this.generateSlide(type, analysis))
    );
    
    // 4. Apply templates
    const formattedSlides = slides.map(slide =>
      this.applyTemplate(slide)
    );
    
    // 5. Score and return
    return {
      slides: formattedSlides,
      overallScore: this.calculateScore(formattedSlides),
    };
  }
}
```

#### 3. Database Agent

```typescript
class DatabaseQueryAgent {
  async generateQuery(
    question: string,
    schema: DatabaseSchema,
    dbType: 'postgresql' | 'mysql' | 'mongodb'
  ): Promise<QueryResult> {
    const prompt = PromptTemplate.fromTemplate(`
      Database Type: {dbType}
      Schema: {schema}
      
      User Question: {question}
      
      Generate a safe, read-only query that answers the question.
      Explain what the query does.
      List any assumptions made.
      
      {format_instructions}
    `);

    // Chain with safety validation
    const chain = prompt
      .pipe(this.llm)
      .pipe(this.outputParser)
      .pipe(this.safetyValidator);

    return chain.invoke({ dbType, schema, question });
  }
}
```

---

## ⛓️ Blockchain Architecture

### Smart Contract Stack

| Layer | Technology |
|-------|------------|
| **Network** | Ethereum Sepolia Testnet |
| **Smart Contract** | Solidity 0.8.20 |
| **Development** | Hardhat |
| **Client Library** | ethers.js 6.x |
| **RPC Provider** | Infura |

### Contract Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  EQUITY TOKEN CONTRACT                       │
│                  (ERC-20 Compatible)                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ State Variables                                     │   │
│  │                                                     │   │
│  │  name: "Equity Token"                               │   │
│  │  symbol: "EQT"                                      │   │
│  │  decimals: 18                                       │   │
│  │  totalSupply: dynamic                               │   │
│  │                                                     │   │
│  │  _balances: mapping(address => uint256)             │   │
│  │  _allowances: mapping(address => mapping => uint)   │   │
│  │  hasUserMinted: mapping(address => bool)            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Core Functions                                      │   │
│  │                                                     │   │
│  │  mintInitialTokens()    - One-time 1M token mint    │   │
│  │  transfer(to, amount)   - Standard ERC-20 transfer  │   │
│  │  transferPercent(to, %) - Percentage-based transfer │   │
│  │  balanceOf(address)     - Get raw balance           │   │
│  │  getDisplayBalance()    - Get whole token balance   │   │
│  │  calculatePercentageAmount() - Convert % to tokens  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Security Features                                   │   │
│  │                                                     │   │
│  │  • Reentrancy guard on all state-changing functions │   │
│  │  • One-time mint restriction per address            │   │
│  │  • Input validation (0 < percentage <= 100)         │   │
│  │  • Zero address checks                              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Integration

```typescript
// Wallet Provider Context
interface WalletContextType {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
}

// Contract interaction
async function transferEquity(recipient: string, percentage: number) {
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new Contract(TOKEN_ADDRESS, ABI, signer);
  
  const tx = await contract.transferPercent(recipient, percentage);
  await tx.wait();
  
  return tx.hash;
}
```

---

## 🗄️ Database Design

### Firebase Firestore Collections

```
firestore/
├── users/                        # User profiles (synced from Clerk)
│   └── {userId}/
│       ├── email
│       ├── name
│       ├── createdAt
│       └── settings
│
├── code-police-projects/         # Code Police projects
│   └── {projectId}/
│       ├── userId
│       ├── repoFullName
│       ├── webhookId
│       ├── settings
│       └── createdAt
│
├── code-police-runs/             # Analysis runs
│   └── {runId}/
│       ├── projectId
│       ├── commitSha
│       ├── status
│       ├── issueCount
│       └── issues[]
│
├── pitch-decks/                  # Generated pitch decks
│   └── {deckId}/
│       ├── userId
│       ├── projectName
│       ├── tagline
│       ├── slides[]
│       ├── theme
│       └── createdAt
│
├── equity-projects/              # Equity token projects
│   └── {projectId}/
│       ├── userId
│       ├── name
│       ├── contractAddress
│       └── transactions[]
│
└── database-connections/         # Database Agent connections
    └── {connectionId}/
        ├── userId
        ├── name
        ├── type (pg/mysql/mongo)
        ├── encryptedCredentials
        └── schema
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Projects owned by user
    match /code-police-projects/{projectId} {
      allow read, write: if request.auth != null 
        && resource.data.userId == request.auth.uid;
    }
    
    match /pitch-decks/{deckId} {
      allow read, write: if request.auth != null 
        && resource.data.userId == request.auth.uid;
    }
    
    // Admin access for server-side operations
    match /{document=**} {
      allow read, write: if request.auth.token.admin == true;
    }
  }
}
```

### Database Indexes

```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "code-police-projects",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "pitch-decks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "code-police-runs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "projectId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 🔐 Authentication & Security

### Authentication Flow (Clerk)

```
┌─────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION FLOW                       │
│                                                             │
│  User → Sign In/Up Page → Clerk Hosted UI                   │
│                              ↓                              │
│                      Clerk Authentication                   │
│                      (Email, OAuth, etc.)                   │
│                              ↓                              │
│                      Session Created                        │
│                              ↓                              │
│  ┌───────────────────────────┴───────────────────────────┐ │
│  │                                                        │ │
│  │  Frontend (Client)         Backend (Server)           │ │
│  │  ┌──────────────────┐     ┌──────────────────┐        │ │
│  │  │ useAuth() hook   │     │ auth() function  │        │ │
│  │  │ useUser() hook   │     │ Middleware       │        │ │
│  │  │ ClerkProvider    │     │ API protection   │        │ │
│  │  └──────────────────┘     └──────────────────┘        │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Security Measures

| Area | Implementation |
|------|----------------|
| **Authentication** | Clerk (OAuth, MFA, session management) |
| **Authorization** | Middleware route protection |
| **Data Encryption** | AES-256 for database credentials |
| **API Security** | Rate limiting, input validation |
| **Webhook Security** | HMAC signature verification |
| **HTTPS** | Enforced on all endpoints |
| **XSS Protection** | React's built-in escaping |
| **CSRF Protection** | Same-origin policy |

### Credential Encryption (Database Agent)

```typescript
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET!;

export function encryptCredentials(credentials: object): string {
  return CryptoJS.AES.encrypt(
    JSON.stringify(credentials),
    ENCRYPTION_KEY
  ).toString();
}

export function decryptCredentials(encrypted: string): object {
  const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}
```

---

## 🔌 API Design

### RESTful Conventions

| Method | Path | Action |
|--------|------|--------|
| GET | /api/resource | List resources |
| POST | /api/resource | Create resource |
| GET | /api/resource/:id | Get single resource |
| PUT | /api/resource/:id | Update resource |
| DELETE | /api/resource/:id | Delete resource |

### Error Handling

```typescript
// Standard error codes
enum ErrorCode {
  // Client errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  AI_ERROR = 'AI_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
}

// Error response format
interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}
```

### Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| /api/pitch-deck/generate | 10 req | 1 hour |
| /api/database/query | 100 req | 1 hour |
| /api/code-police/* | 1000 req | 1 hour |
| All other endpoints | 100 req | 1 minute |

---

## 🚀 Deployment Architecture

### Railway Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                    RAILWAY PLATFORM                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Railway Project                     │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │              Next.js Service                 │   │   │
│  │  │                                              │   │   │
│  │  │  • Nixpacks build                           │   │   │
│  │  │  • Node.js 20 runtime                       │   │   │
│  │  │  • Auto-scaling                             │   │   │
│  │  │  • Health checks                            │   │   │
│  │  │  • Environment variables                    │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │              Railway Domain                  │   │   │
│  │  │                                              │   │   │
│  │  │  app.up.railway.app                          │   │   │
│  │  │  + Custom domain support                    │   │   │
│  │  │  + Auto SSL/TLS                             │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Build Process

```yaml
# nixpacks.toml
[phases.setup]
nixPkgs = ["nodejs_20", "npm"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

### Environment Configuration

```
Production:
├── NODE_ENV=production
├── NEXT_PUBLIC_APP_URL=https://app.ghostfounder.com
├── Clerk (production keys)
├── Firebase (production project)
└── All API keys (production)

Staging:
├── NODE_ENV=production
├── NEXT_PUBLIC_APP_URL=https://staging.ghostfounder.com
├── Clerk (test keys)
├── Firebase (staging project)
└── All API keys (test/staging)

Development:
├── NODE_ENV=development
├── NEXT_PUBLIC_APP_URL=http://localhost:3000
├── Clerk (test keys)
├── Firebase (development project)
└── All API keys (development)
```

---

## 📈 Performance & Scalability

### Performance Optimizations

| Optimization | Implementation |
|--------------|----------------|
| **Code Splitting** | Next.js automatic per-route bundles |
| **Image Optimization** | next/image with automatic WebP |
| **Font Optimization** | next/font with local fonts |
| **Caching** | Edge caching for static assets |
| **API Caching** | SWR/TanStack Query for data |
| **Lazy Loading** | Dynamic imports for heavy components |

### Scalability Considerations

1. **Stateless API Routes**: No server-side sessions
2. **Serverless Functions**: Auto-scaling with demand
3. **CDN Distribution**: Static assets globally cached
4. **Database Indexing**: Optimized Firestore queries
5. **Background Jobs**: Long-running tasks (email, AI) async

---

## 📊 Monitoring & Observability

### Logging Strategy

```typescript
// Structured logging
const LOG_PREFIX = '[Module:Function]';

console.log(`${LOG_PREFIX} Info message`, { userId, action });
console.error(`${LOG_PREFIX} Error occurred`, { error, context });
```

### Health Checks

```typescript
// /api/health/route.ts
export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      firebase: await checkFirebase(),
      clerk: await checkClerk(),
      gemini: await checkGemini(),
    },
  };
  
  const allHealthy = Object.values(checks.services)
    .every(s => s === 'healthy');
  
  return NextResponse.json(checks, {
    status: allHealthy ? 200 : 503,
  });
}
```

### Metrics to Track

| Metric | Purpose |
|--------|---------|
| **Response Time** | API latency P50, P95, P99 |
| **Error Rate** | 4xx and 5xx response rates |
| **AI Latency** | Gemini response times |
| **Webhook Success** | GitHub webhook delivery |
| **User Activity** | Daily/monthly active users |
| **Feature Usage** | Feature adoption metrics |

---

## 📄 Related Documentation

- [README.md](./README.md) - Project overview
- [API_REFERENCE.md](./API_REFERENCE.md) - Complete API documentation
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Deployment guide
- [CODE_POLICE_README.md](./CODE_POLICE_README.md) - Code Police feature
- [PITCH_DECK_README.md](./PITCH_DECK_README.md) - Pitch Deck feature
- [DATABASE_AGENT_README.md](./DATABASE_AGENT_README.md) - Database Agent feature
- [EQUITY_DISTRIBUTION_README.md](./EQUITY_DISTRIBUTION_README.md) - Equity feature

---

<div align="center">

**Designed for scale, built for speed**

[Back to Main README](./README.md)

</div>
