# 🛡️ Code Police - Comprehensive Documentation

> AI-Powered Code Review System for GitHub Repositories

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Technology Stack](#technology-stack)
5. [File Structure](#file-structure)
6. [Data Models](#data-models)
7. [API Routes](#api-routes)
8. [User Flows](#user-flows)
9. [AI Analysis Engine](#ai-analysis-engine)
10. [GitHub Integration](#github-integration)
11. [Email Reporting](#email-reporting)
12. [Security & Privacy](#security--privacy)
13. [Setup & Configuration](#setup--configuration)
14. [Usage Examples](#usage-examples)
15. [Troubleshooting](#troubleshooting)
16. [Future Enhancements](#future-enhancements)

---

## 🎯 Overview

**Code Police** is an intelligent code review agent that automatically analyzes your GitHub commits and pull requests using AI. It provides detailed security, performance, and code quality feedback via email reports.

### Key Capabilities

- **Automated Code Analysis**: AI-powered review on every push/PR
- **Multi-Category Detection**: Security, performance, bugs, readability, tests, style
- **Severity Classification**: Critical, high, medium, low, info
- **Email Reports**: Professional HTML reports with actionable insights
- **GitHub Integration**: Webhook-based automation
- **Schema-Aware Analysis**: Language-specific code review
- **Conversation Context**: AI learns from commit messages and code patterns

### Use Cases

1. **Security Auditing**: Detect SQL injection, XSS, authentication flaws
2. **Performance Monitoring**: Identify N+1 queries, memory leaks, inefficiencies
3. **Code Quality**: Enforce best practices and readability standards
4. **Onboarding**: Help new developers learn codebase standards
5. **Pre-Production Checks**: Automated gate before merging to main

---

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    GITHUB REPOSITORY                        │
│  ┌──────────────┐        ┌──────────────┐                  │
│  │  Push Event  │        │  PR Event    │                  │
│  └──────┬───────┘        └──────┬───────┘                  │
│         │                       │                           │
│         └───────────┬───────────┘                           │
└─────────────────────┼─────────────────────────────────────┘
                      │ Webhook (POST)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               CODE POLICE BACKEND                           │
│  ┌───────────────────────────────────────────────────┐     │
│  │  /api/webhooks/github                            │     │
│  │  1. Verify signature                             │     │
│  │  2. Extract commit/PR data                       │     │
│  │  3. Create analysis run                          │     │
│  └────────────────────┬──────────────────────────────┘     │
│                       ▼                                     │
│  ┌───────────────────────────────────────────────────┐     │
│  │  GitHub API Client                               │     │
│  │  - Fetch commit details                          │     │
│  │  - Download changed files                        │     │
│  │  - Get file content                              │     │
│  └────────────────────┬──────────────────────────────┘     │
│                       ▼                                     │
│  ┌───────────────────────────────────────────────────┐     │
│  │  AI Analysis Engine (LangChain + Gemini)         │     │
│  │                                                   │     │
│  │  ┌─────────────────────────────────────────┐     │     │
│  │  │ File 1 → Analyzer → Issues              │     │     │
│  │  │ File 2 → Analyzer → Issues              │     │     │
│  │  │ File N → Analyzer → Issues              │     │     │
│  │  └─────────────────────────────────────────┘     │     │
│  │                                                   │     │
│  │  ┌─────────────────────────────────────────┐     │     │
│  │  │ Summary Generator                       │     │     │
│  │  │ - Aggregate issue counts                │     │     │
│  │  │ - Prioritize critical issues            │     │     │
│  │  │ - Generate natural language summary     │     │     │
│  │  └─────────────────────────────────────────┘     │     │
│  └────────────────────┬──────────────────────────────┘     │
│                       ▼                                     │
│  ┌───────────────────────────────────────────────────┐     │
│  │  Firestore Database                              │     │
│  │  - Store analysis runs                           │     │
│  │  - Store code issues                             │     │
│  │  - Track project settings                        │     │
│  └────────────────────┬──────────────────────────────┘     │
│                       ▼                                     │
│  ┌───────────────────────────────────────────────────┐     │
│  │  Email Service (Resend)                          │     │
│  │  - Generate HTML report                          │     │
│  │  - Send to configured emails                     │     │
│  │  - Track delivery status                         │     │
│  └───────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    USER EMAIL                               │
│  ┌───────────────────────────────────────────────────┐     │
│  │  📧 Code Police Report                           │     │
│  │  - Commit SHA & Branch                           │     │
│  │  - Issue Counts by Severity                      │     │
│  │  - Top Issues with Explanations                  │     │
│  │  - Suggested Fixes                               │     │
│  │  - Link to GitHub Commit                         │     │
│  └───────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Component Flow Diagram

```
User → Dashboard → Connect GitHub Repo
                         ↓
                  Create Project Record
                         ↓
                  Setup Webhook on GitHub
                         ↓
                  ┌──────────────────┐
                  │  Webhook Active  │
                  └──────────────────┘
                         ↓
       Developer Commits Code to GitHub
                         ↓
         GitHub Sends Webhook Event
                         ↓
         Code Police Receives Webhook
                         ↓
          ┌──────────────────────────┐
          │  Analysis Pipeline       │
          │  1. Verify Signature     │
          │  2. Fetch Files          │
          │  3. AI Analysis          │
          │  4. Store Results        │
          │  5. Send Email           │
          └──────────────────────────┘
                         ↓
          User Receives Email Report
                         ↓
          User Reviews Issues in Email
                         ↓
          User Fixes Code & Commits Again
```

---

## ✨ Features

### 1. **Automated Code Analysis**

- **Real-time Review**: Analyzes code immediately after push/PR
- **Language Support**: TypeScript, JavaScript, Python, Ruby, Go, Rust, Java, Kotlin, Swift, C#, C++, C, PHP, SQL, Solidity
- **Multi-File Analysis**: Reviews all changed files in a commit
- **Chunking for Large Files**: Handles files up to any size by chunking (200 lines per chunk)

### 2. **Issue Detection Categories**

#### Security (Critical/High Priority)
- SQL injection vulnerabilities
- Cross-site scripting (XSS)
- Command injection
- Hardcoded secrets/credentials
- Authentication/authorization flaws
- Insecure cryptography
- Path traversal vulnerabilities

#### Performance (Medium/High Priority)
- N+1 database queries
- Memory leaks
- Inefficient algorithms
- Unnecessary re-renders (React)
- Missing caching
- Expensive operations in loops

#### Bugs (Varies by Severity)
- Null pointer risks
- Race conditions
- Off-by-one errors
- Incorrect logic
- Unhandled edge cases
- Type mismatches

#### Readability (Low/Medium)
- Complex functions (>50 lines)
- Unclear variable names
- Missing comments for complex logic
- Deeply nested code
- Duplicate code

#### Test Coverage (Info/Low)
- Untested edge cases
- Missing error handling tests
- Insufficient assertions
- Mock/stub misuse

#### Style (Info)
- Code formatting issues
- Naming conventions
- File organization

### 3. **Severity Levels**

| Severity | Description | Action Required |
|----------|-------------|-----------------|
| **Critical** 🚨 | Security vulnerabilities, data loss risks | Immediate fix required |
| **High** ⚠️ | Performance bottlenecks, major bugs | Fix before merge |
| **Medium** ⚡ | Code quality issues, minor bugs | Fix in this sprint |
| **Low** 📋 | Readability, maintenance concerns | Fix when convenient |
| **Info** ℹ️ | Style suggestions, best practices | Optional improvements |

### 4. **Email Reports**

- **Professional HTML Design**: Dark-themed, modern email template
- **Severity-Based Subjects**: 🚨 Critical, ⚠️ High Priority, 📋 Report, ✅ Clean
- **Detailed Issue Cards**: Each issue includes:
  - File path and line number
  - Severity badge
  - Category tag
  - Clear message
  - Detailed explanation
  - Suggested fix (when available)
  - Code snippet with context
- **Summary Section**: AI-generated natural language summary
- **Stats Grid**: Visual breakdown of issue counts
- **CTA Button**: Direct link to GitHub commit

### 5. **GitHub Integration**

- **OAuth Authentication**: Secure token-based access
- **Webhook Management**: Automatic setup and cleanup
- **Repository Access**: Read file contents, commit history
- **Event Handling**: Push and Pull Request events
- **Signature Verification**: HMAC-SHA256 signature validation

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Forms**: React Hook Form (potential)

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **Framework**: Next.js API Routes (serverless)
- **Authentication**: Clerk (OAuth + JWT)
- **Database**: Firebase Firestore (serverless)
- **AI Model**: Google Gemini 2.0 Flash
- **AI Framework**: LangChain
- **Email Service**: Resend
- **GitHub API**: Octokit
- **Validation**: Zod

### AI & ML
- **Model**: Gemini 2.0 Flash (`gemini-2.0-flash`)
- **Temperature**: 0 (deterministic analysis)
- **Max Tokens**: 2048
- **Structured Output**: Zod schema validation
- **Prompting**: Template-based with context injection

### Infrastructure
- **Hosting**: Vercel (serverless)
- **Database**: Firebase (Google Cloud)
- **Email**: Resend (transactional email)
- **GitHub**: GitHub Apps API

---

## 📁 File Structure

```
src/
├── app/
│   ├── dashboard/
│   │   └── code-police/
│   │       ├── page.tsx                    # Main dashboard (project list)
│   │       ├── [id]/
│   │       │   └── page.tsx                # Project detail (analysis history)
│   │       └── connect/
│   │           └── page.tsx                # GitHub repo connection flow
│   └── api/
│       ├── code-police/
│       │   ├── analyze/
│       │   │   └── route.ts                # POST: Trigger analysis, GET: Fetch history
│       │   └── projects/
│       │       └── route.ts                # GET/POST: Project management
│       ├── github/
│       │   ├── repos/
│       │   │   └── route.ts                # GET: List user repositories
│       │   └── connect/
│       │       └── route.ts                # POST: Connect repository & setup webhook
│       └── webhooks/
│           └── github/
│               └── route.ts                # POST: Receive GitHub webhook events
├── lib/
│   └── agents/
│       └── code-police/
│           ├── analyzer.ts                  # AI analysis engine (LangChain + Gemini)
│           ├── email.ts                     # Email report generation (Resend)
│           ├── github.ts                    # GitHub API client (Octokit)
│           └── index.ts                     # Module exports
├── types/
│   └── index.ts                             # TypeScript type definitions
│       # Project, AnalysisRun, CodeIssue, RulesProfile, NotificationPrefs
└── components/
    └── dashboard/
        └── shell.tsx                        # Navigation with Code Police link
```

### Core Modules

#### 1. **Analyzer (`src/lib/agents/code-police/analyzer.ts`)**
- `analyzeCode()`: AI-powered code analysis
- `generateAnalysisSummary()`: Create natural language summary
- `detectLanguage()`: File extension to language mapping
- `extractCodeSnippet()`: Get code context around issue
- `chunkCode()`: Split large files for analysis

#### 2. **Email (`src/lib/agents/code-police/email.ts`)**
- `sendAnalysisReport()`: Send email via Resend
- `generateReportHtml()`: Create HTML email content
- `getEmailSubject()`: Dynamic subject based on severity

#### 3. **GitHub (`src/lib/agents/code-police/github.ts`)**
- `fetchUserRepos()`: Get user's repositories
- `fetchFileContent()`: Download file from repo
- `fetchCommit()`: Get commit details with changed files
- `createWebhook()`: Setup webhook on repository
- `deleteWebhook()`: Remove webhook from repository

---

## 📊 Data Models

### Project

```typescript
interface Project {
  id: string;                    // Firestore document ID
  userId: string;                // Clerk user ID (owner)
  name: string;                  // Display name (e.g., "ghostfounder")
  githubRepoId?: number;         // GitHub repository ID
  githubOwner?: string;          // GitHub owner (e.g., "anurag3407")
  githubRepoName?: string;       // Repository name (e.g., "ghosthunter")
  githubFullName?: string;       // Full name (e.g., "anurag3407/ghosthunter")
  defaultBranch: string;         // Default branch (e.g., "main")
  language?: string;             // Primary language (e.g., "TypeScript")
  webhookId?: number;            // GitHub webhook ID
  webhookSecret: string;         // HMAC secret for webhook verification
  isActive: boolean;             // Analysis enabled/disabled
  rulesProfile: RulesProfile;    // Analysis configuration
  notificationPrefs: NotificationPrefs; // Email settings
  createdAt: Timestamp;          // Creation timestamp
  updatedAt: Timestamp;          // Last update timestamp
}
```

**Firestore Collection**: `projects`  
**Indexes**: `userId`, `githubRepoId`, `isActive`

### RulesProfile

```typescript
interface RulesProfile {
  strictness: "relaxed" | "moderate" | "strict";
  categories: {
    security: boolean;           // Enable security checks
    performance: boolean;        // Enable performance checks
    readability: boolean;        // Enable readability checks
    bugs: boolean;               // Enable bug detection
    tests: boolean;              // Enable test coverage checks
    style: boolean;              // Enable style checks
  };
  ignorePatterns: string[];      // File patterns to skip (e.g., "*.test.ts")
  severityThreshold: IssueSeverity; // Minimum severity to report
}
```

**Default Values**:
- Strictness: `"moderate"`
- All categories: `true`
- Ignore patterns: `["node_modules/**", "dist/**", "build/**"]`
- Severity threshold: `"info"`

### NotificationPrefs

```typescript
interface NotificationPrefs {
  emailOnPush: boolean;          // Send email on push events
  emailOnPR: boolean;            // Send email on PR events
  minSeverity: IssueSeverity;    // Minimum severity to trigger email
  additionalEmails: string[];    // CC other team members
}
```

### AnalysisRun

```typescript
interface AnalysisRun {
  id: string;                    // Firestore document ID
  userId: string;                // Owner of the project
  projectId: string;             // Reference to project
  commitSha: string;             // Git commit SHA (e.g., "abc123...")
  branch: string;                // Branch name (e.g., "main", "feature/auth")
  triggerType: "push" | "pull_request";
  prNumber?: number;             // PR number (if triggered by PR)
  author: {
    name: string;                // Commit author name
    email: string;               // Commit author email
    avatar?: string;             // GitHub avatar URL
  };
  status: "pending" | "running" | "completed" | "failed";
  summary?: string;              // AI-generated summary
  issueCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  createdAt: Timestamp;          // Analysis start time
  completedAt?: Timestamp;       // Analysis completion time
  emailStatus?: "pending" | "sent" | "failed";
  error?: string;                // Error message if failed
}
```

**Firestore Collection**: `analysis_runs`  
**Indexes**: `projectId`, `userId`, `status`, `createdAt`

### CodeIssue

```typescript
interface CodeIssue {
  id: string;                    // Firestore document ID
  analysisRunId: string;         // Reference to analysis run
  projectId: string;             // Reference to project
  filePath: string;              // File path (e.g., "src/lib/auth.ts")
  line: number;                  // Starting line number
  endLine?: number;              // Ending line (for multi-line issues)
  severity: IssueSeverity;       // critical | high | medium | low | info
  category: IssueCategory;       // security | performance | readability | bug | test | style
  message: string;               // Short description (e.g., "SQL injection risk")
  explanation: string;           // Detailed explanation of the problem
  suggestedFix?: string;         // Concrete fix suggestion
  ruleId?: string;               // Rule identifier (e.g., "SEC001", "PERF002")
  codeSnippet?: string;          // Code context (lines ±3 around issue)
  isMuted: boolean;              // User has dismissed this issue
}
```

**Firestore Collection**: `code_issues`  
**Indexes**: `analysisRunId`, `projectId`, `severity`, `isMuted`

### Types & Enums

```typescript
type IssueSeverity = "critical" | "high" | "medium" | "low" | "info";

type IssueCategory =
  | "security"
  | "performance"
  | "readability"
  | "bug"
  | "test"
  | "style";
```

---

## 🔌 API Routes

### 1. **GET /api/github/repos**

**Purpose**: List authenticated user's GitHub repositories

**Authentication**: Clerk session required

**Query Parameters**: None

**Response**:
```json
{
  "repos": [
    {
      "id": 123456,
      "name": "ghosthunter",
      "full_name": "anurag3407/ghosthunter",
      "description": "AI-powered multi-agent platform",
      "html_url": "https://github.com/anurag3407/ghosthunter",
      "language": "TypeScript",
      "default_branch": "main",
      "private": false,
      "stargazers_count": 42,
      "updated_at": "2026-01-02T10:30:00Z",
      "owner": {
        "login": "anurag3407",
        "avatar_url": "https://github.com/..."
      }
    }
  ],
  "connected": true
}
```

**Error Responses**:
- `401`: GitHub not connected
- `500`: GitHub API error

### 2. **POST /api/github/connect**

**Purpose**: Connect a GitHub repository and setup webhook

**Authentication**: Clerk session required

**Request Body**:
```json
{
  "repoId": 123456,
  "owner": "anurag3407",
  "name": "ghosthunter",
  "fullName": "anurag3407/ghosthunter"
}
```

**Response**:
```json
{
  "success": true,
  "projectId": "proj_abc123",
  "webhookId": 789456
}
```

**What It Does**:
1. Validates user authentication
2. Gets GitHub OAuth token from Clerk
3. Checks if repository already connected
4. Generates webhook secret (HMAC-SHA256)
5. Creates webhook on GitHub repository
6. Creates project record in Firestore
7. Returns project ID and webhook ID

**Error Responses**:
- `401`: Unauthorized (no GitHub token)
- `409`: Repository already connected
- `503`: Database not configured
- `500`: Webhook creation failed

### 3. **POST /api/webhooks/github**

**Purpose**: Receive and process GitHub webhook events

**Authentication**: HMAC signature verification

**Headers**:
- `x-github-event`: Event type (`push` or `pull_request`)
- `x-hub-signature-256`: HMAC-SHA256 signature

**Request Body** (Push Event):
```json
{
  "ref": "refs/heads/main",
  "after": "abc123...",
  "repository": {
    "id": 123456,
    "full_name": "anurag3407/ghosthunter",
    "owner": { "login": "anurag3407" },
    "name": "ghosthunter"
  },
  "pusher": {
    "name": "Anurag",
    "email": "anurag@example.com"
  },
  "commits": [
    {
      "id": "abc123...",
      "message": "Add authentication module",
      "author": { "name": "Anurag", "email": "anurag@example.com" },
      "added": ["src/auth.ts"],
      "modified": ["src/app.ts"],
      "removed": []
    }
  ]
}
```

**Process Flow**:
1. Verify webhook signature
2. Find project by GitHub repo ID
3. Get user's GitHub token from Firestore
4. Fetch commit details from GitHub API
5. Download changed files
6. Analyze each file with AI
7. Calculate issue counts
8. Generate summary
9. Store analysis run in Firestore
10. Store issues in Firestore
11. Send email report (if configured)

**Response**:
```json
{
  "success": true,
  "analysisRunId": "run_xyz789",
  "issueCounts": {
    "critical": 1,
    "high": 2,
    "medium": 5,
    "low": 3,
    "info": 2
  }
}
```

**Error Responses**:
- `400`: Missing event header or invalid payload
- `401`: Invalid signature
- `404`: Project not found
- `503`: Database not configured

### 4. **POST /api/code-police/analyze**

**Purpose**: Manually trigger code analysis for a commit

**Authentication**: Clerk session required

**Request Body**:
```json
{
  "projectId": "proj_abc123",
  "owner": "anurag3407",
  "repo": "ghosthunter",
  "commitSha": "abc123...",
  "sendEmail": true,
  "recipientEmail": "user@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "analysisRunId": "run_xyz789",
  "summary": "Found 13 issues across 8 files...",
  "issueCounts": {
    "critical": 1,
    "high": 2,
    "medium": 5,
    "low": 3,
    "info": 2
  }
}
```

**Use Cases**:
- Manual code review before merge
- Re-analyze older commits
- Test analysis setup
- Trigger from CI/CD pipeline

### 5. **GET /api/code-police/analyze**

**Purpose**: Fetch analysis history for a project

**Authentication**: Clerk session required

**Query Parameters**:
- `projectId` (required): Project ID
- `limit` (optional): Number of runs to return (default: 20)

**Response**:
```json
{
  "runs": [
    {
      "id": "run_xyz789",
      "commitSha": "abc123...",
      "branch": "main",
      "status": "completed",
      "issueCounts": { "critical": 1, "high": 2, "medium": 5, "low": 3, "info": 2 },
      "createdAt": "2026-01-02T10:30:00Z",
      "completedAt": "2026-01-02T10:31:15Z"
    }
  ]
}
```

### 6. **GET /api/code-police/projects**

**Purpose**: List all Code Police projects for current user

**Authentication**: Clerk session required

**Response**:
```json
{
  "projects": [
    {
      "id": "proj_abc123",
      "name": "ghosthunter",
      "githubFullName": "anurag3407/ghosthunter",
      "language": "TypeScript",
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### 7. **POST /api/code-police/projects**

**Purpose**: Create new Code Police project (alternative to `/api/github/connect`)

**Authentication**: Clerk session required

**Request Body**:
```json
{
  "name": "My Project",
  "githubRepoId": 123456,
  "githubOwner": "anurag3407",
  "githubRepoName": "ghosthunter",
  "githubFullName": "anurag3407/ghosthunter",
  "defaultBranch": "main",
  "language": "TypeScript"
}
```

---

## 🔄 User Flows

### Flow 1: Connect Repository

```
1. User navigates to /dashboard/code-police
2. Clicks "Connect Repository" button
3. Redirected to /dashboard/code-police/connect
4. System fetches user's GitHub repos (GET /api/github/repos)
5. User searches/filters repositories
6. User clicks "Connect" on desired repo
7. System creates webhook and project (POST /api/github/connect)
8. Success! Redirected back to dashboard with confirmation
```

**Frontend Components**:
- `src/app/dashboard/code-police/page.tsx` (dashboard)
- `src/app/dashboard/code-police/connect/page.tsx` (connection UI)

**API Calls**:
- `GET /api/github/repos`
- `POST /api/github/connect`

### Flow 2: Automatic Analysis (Push Event)

```
1. Developer pushes code to GitHub
2. GitHub sends webhook POST to /api/webhooks/github
3. System verifies webhook signature
4. System fetches commit details from GitHub API
5. System downloads changed files
6. For each file:
   a. Detect programming language
   b. Send to AI analyzer (Gemini 2.0 Flash)
   c. Parse structured output (Zod schema)
   d. Store issues in Firestore
7. System generates AI summary of all issues
8. System sends email report via Resend
9. User receives email with detailed findings
```

**Backend Components**:
- `src/app/api/webhooks/github/route.ts` (webhook handler)
- `src/lib/agents/code-police/github.ts` (GitHub API client)
- `src/lib/agents/code-police/analyzer.ts` (AI analysis)
- `src/lib/agents/code-police/email.ts` (email generation)

### Flow 3: View Analysis History

```
1. User navigates to /dashboard/code-police
2. Sees list of connected projects
3. Clicks on a project
4. Redirected to /dashboard/code-police/[id]
5. System fetches analysis runs (GET /api/code-police/analyze?projectId=...)
6. User sees:
   - Latest analysis summary
   - Issue counts by severity
   - List of past analysis runs
7. User can expand a run to see all issues
8. User can click on issue to see:
   - File path and line number
   - Code snippet
   - Explanation
   - Suggested fix
```

**Frontend Components**:
- `src/app/dashboard/code-police/[id]/page.tsx`

**API Calls**:
- `GET /api/code-police/analyze`

---

## 🤖 AI Analysis Engine

### LangChain + Gemini Integration

```typescript
// File: src/lib/agents/code-police/analyzer.ts

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

// Zod schema for structured output
const CodeIssueSchema = z.object({
  severity: z.enum(["critical", "high", "medium", "low", "info"]),
  category: z.enum(["security", "performance", "readability", "bug", "test", "style"]),
  message: z.string().describe("Clear, concise description"),
  line: z.number().describe("Starting line number"),
  endLine: z.number().optional(),
  suggestedFix: z.string().optional(),
  explanation: z.string().describe("Why this is problematic"),
  ruleId: z.string().optional().describe("Rule ID like SEC001"),
});

const AnalysisOutputSchema = z.object({
  issues: z.array(CodeIssueSchema),
});

// Initialize Gemini model
function getGeminiModel(temperature: number = 0) {
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: process.env.GEMINI_API_KEY,
    temperature,
    maxOutputTokens: 2048,
  });
}
```

### Analysis Prompt Template

```typescript
const ANALYSIS_PROMPT = `You are a senior code reviewer with expertise in security, performance, and code quality. Analyze the following code for issues.

**File:** {filePath}
**Language:** {language}
**Commit Message:** {commitMessage}

**Code to analyze:**
\`\`\`{language}
{code}
\`\`\`

**Analysis Focus Areas:**
1. **Security** (severity: critical/high): SQL injection, XSS, command injection, insecure secrets, authentication flaws
2. **Performance** (severity: medium/high): N+1 queries, memory leaks, inefficient algorithms, unnecessary re-renders
3. **Bug Detection** (severity: varies): Null pointer risks, race conditions, incorrect logic, edge cases
4. **Readability** (severity: low/medium): Complex functions (>50 lines), unclear naming, missing comments for complex logic
5. **Test Coverage** (severity: info/low): Untested edge cases, missing error handling tests

**Instructions:**
- Only report REAL issues found in the code
- Be specific with line numbers
- Provide actionable fix suggestions
- If no issues found, return an empty array
- Focus on substantive issues, not style nitpicks

Return your analysis as a JSON object with an "issues" array.`;
```

### Summary Generation

```typescript
const SUMMARY_PROMPT = `Based on the following code analysis results, generate a concise summary for an email report.

**Repository:** {repoName}
**Commit:** {commitSha}
**Branch:** {branch}

**Issue Counts:**
- Critical: {criticalCount}
- High: {highCount}
- Medium: {mediumCount}
- Low: {lowCount}
- Info: {infoCount}

**Top Issues:**
{topIssues}

Generate a 2-3 paragraph summary that:
1. Highlights the most important findings
2. Provides context on the severity distribution
3. Gives 1-2 actionable recommendations

Keep the tone professional but friendly. Be concise.`;
```

### Analysis Function

```typescript
export async function analyzeCode(input: {
  code: string;
  filePath: string;
  language: string;
  commitMessage: string;
}): Promise<CodeIssue[]> {
  const model = getGeminiModel(0); // Temperature 0 for consistency
  const structuredModel = model.withStructuredOutput(AnalysisOutputSchema);

  const prompt = PromptTemplate.fromTemplate(ANALYSIS_PROMPT);
  const formattedPrompt = await prompt.format({
    filePath: input.filePath,
    language: input.language,
    commitMessage: input.commitMessage,
    code: input.code,
  });

  const result = await structuredModel.invoke(formattedPrompt);
  
  return result.issues.map((issue) => ({
    filePath: input.filePath,
    line: issue.line,
    endLine: issue.endLine,
    severity: issue.severity,
    category: issue.category,
    message: issue.message,
    explanation: issue.explanation,
    suggestedFix: issue.suggestedFix,
    ruleId: issue.ruleId,
    codeSnippet: extractCodeSnippet(input.code, issue.line, issue.endLine),
  }));
}
```

### Language Detection

```typescript
export function detectLanguage(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase();
  
  const languageMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    py: "python",
    rb: "ruby",
    go: "go",
    rs: "rust",
    java: "java",
    kt: "kotlin",
    swift: "swift",
    cs: "csharp",
    cpp: "cpp",
    c: "c",
    php: "php",
    sql: "sql",
    sol: "solidity",
  };
  
  return languageMap[ext || ""] || "text";
}
```

---

## 🔗 GitHub Integration

### OAuth Setup

**Required Scopes**:
- `repo`: Read repository contents and metadata
- `write:repo_hook`: Create and manage webhooks
- `user:email`: Read user email address

**Clerk Configuration**:
1. Enable GitHub OAuth provider in Clerk Dashboard
2. Add required scopes in provider settings
3. Users connect GitHub via account settings

### Webhook Setup

**Webhook URL**: `https://your-domain.com/api/webhooks/github`

**Events**:
- `push`: Triggered on every commit push
- `pull_request`: Triggered on PR open/update

**Signature Verification**:
```typescript
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;
  
  const hmac = crypto.createHmac("sha256", secret);
  const digest = `sha256=${hmac.update(payload).digest("hex")}`;
  
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(signature)
  );
}
```

### GitHub API Client (Octokit)

```typescript
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: githubToken });

// Fetch repositories
const { data: repos } = await octokit.repos.listForAuthenticatedUser({
  sort: "updated",
  per_page: 100,
});

// Create webhook
const webhook = await octokit.repos.createWebhook({
  owner,
  repo: name,
  config: {
    url: webhookUrl,
    content_type: "json",
    secret: webhookSecret,
  },
  events: ["push", "pull_request"],
  active: true,
});

// Fetch file content
const response = await fetch(
  `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${sha}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3.raw",
    },
  }
);
const fileContent = await response.text();
```

---

## 📧 Email Reporting

### Email Template (HTML)

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="background-color: #09090b; font-family: sans-serif;">
    <div style="max-width: 640px; margin: 0 auto; padding: 40px 20px;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #a78bfa; font-size: 24px;">
          🛡️ Code Police Report
        </h1>
        <p style="color: #71717a;">
          ghostfounder/ghosthunter • main
        </p>
      </div>

      <!-- Summary Card -->
      <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 24px;">
        <h2 style="color: #fafafa; font-size: 18px;">Summary</h2>
        <p style="color: #a1a1aa; line-height: 1.6;">
          Found 13 issues across 8 files. 1 critical security vulnerability detected in src/lib/auth.ts...
        </p>
      </div>

      <!-- Stats Grid -->
      <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;">
        <div style="background: #7f1d1d; padding: 16px; border-radius: 8px; text-align: center;">
          <p style="font-size: 28px; font-weight: bold; color: #fca5a5;">1</p>
          <p style="font-size: 12px; color: #fca5a5;">CRITICAL</p>
        </div>
        <!-- More severity cards... -->
      </div>

      <!-- Issues List -->
      <div style="margin-top: 24px;">
        <div style="background: #18181b; border-left: 4px solid #dc2626; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="background: #7f1d1d; color: #fca5a5; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">CRITICAL</span>
            <span style="background: #713f12; color: #fcd34d; padding: 4px 8px; border-radius: 4px; font-size: 11px;">SECURITY</span>
          </div>
          <h3 style="color: #fafafa; font-size: 16px; margin-bottom: 8px;">
            SQL injection vulnerability
          </h3>
          <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 12px;">
            src/lib/auth.ts:45
          </p>
          <p style="color: #d4d4d8; line-height: 1.5; margin-bottom: 12px;">
            User input is directly concatenated into SQL query without sanitization...
          </p>
          <div style="background: #0a0a0a; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
            <code style="color: #a1a1aa; font-size: 13px; font-family: monospace;">
              42: const username = req.body.username;<br>
              43: const password = req.body.password;<br>
              44: <span style="color: #fca5a5;">45: const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;</span><br>
              46: const result = await db.query(query);<br>
              47: return result;
            </code>
          </div>
          <div style="background: #065f46; padding: 12px; border-radius: 6px;">
            <p style="color: #6ee7b7; font-size: 13px; margin: 0;">
              <strong>✓ Suggested Fix:</strong> Use parameterized queries or an ORM to prevent SQL injection.
            </p>
          </div>
        </div>
        <!-- More issues... -->
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://github.com/anurag3407/ghosthunter/commit/abc123" 
           style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
          View Commit on GitHub
        </a>
      </div>

      <!-- Footer -->
      <div style="text-align: center; color: #52525b; font-size: 12px;">
        <p>Sent by <a href="https://ghostfounder.com" style="color: #a78bfa;">GhostFounder</a> Code Police</p>
        <p>Commit: abc1234 • January 2, 2026</p>
      </div>

    </div>
  </body>
</html>
```

### Email Service (Resend)

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAnalysisReport(input: {
  to: string;
  run: AnalysisRun;
  issues: CodeIssue[];
  summary: string;
  repoName: string;
  commitUrl: string;
}): Promise<{ success: boolean; messageId?: string }> {
  const html = generateReportHtml(input);
  const subject = getEmailSubject(input.run, input.issues);

  const result = await resend.emails.send({
    from: `GhostFounder Code Police <noreply@ghostfounder.com>`,
    to: input.to,
    subject,
    html,
  });

  return {
    success: !result.error,
    messageId: result.data?.id,
  };
}
```

---

## 🔐 Security & Privacy

### Authentication & Authorization

1. **User Authentication**: Clerk JWT-based sessions
2. **GitHub OAuth**: Secure token storage in Firestore (encrypted)
3. **Project Ownership**: All queries filter by `userId`
4. **Webhook Signature**: HMAC-SHA256 verification

### Data Protection

- **GitHub Tokens**: Never exposed to client, stored encrypted in Firestore
- **Webhook Secrets**: Generated with `crypto.randomBytes(32)`
- **Code Snippets**: Only ±3 lines around issue (minimal exposure)
- **Email Privacy**: Reports only sent to authorized recipients

### Best Practices

```typescript
// ✅ Good: User-scoped queries
const projects = await adminDb
  .collection("projects")
  .where("userId", "==", userId)
  .get();

// ❌ Bad: No authorization check
const projects = await adminDb.collection("projects").get();
```

### Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Projects: Only owners can read/write
    match /projects/{projectId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    // Analysis runs: Only project owners can read
    match /analysis_runs/{runId} {
      allow read: if request.auth.uid == resource.data.userId;
    }
    
    // Code issues: Only project owners can read
    match /code_issues/{issueId} {
      allow read: if request.auth.uid == get(/databases/$(database)/documents/projects/$(resource.data.projectId)).data.userId;
    }
  }
}
```

---

## ⚙️ Setup & Configuration

### Environment Variables

```bash
# Required
GEMINI_API_KEY=your_gemini_api_key_here
RESEND_API_KEY=re_your_resend_key_here
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Firebase Admin (choose one method)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Clerk (already configured)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Email (optional customization)
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
```

### Step 1: Clone & Install

```bash
git clone https://github.com/anurag3407/ghosthunter.git
cd ghosthunter
npm install
```

### Step 2: Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ghostfounder-a4994`
3. Project Settings → Service Accounts
4. Generate New Private Key
5. Download JSON file
6. Add credentials to `.env`:

```bash
FIREBASE_PROJECT_ID=ghostfounder-a4994
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@ghostfounder-a4994.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Step 3: Configure Gemini API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Add to `.env`:

```bash
GEMINI_API_KEY=AIzaSy...
```

### Step 4: Configure Resend

1. Sign up at [Resend](https://resend.com/)
2. Create API key
3. Verify domain (optional but recommended)
4. Add to `.env`:

```bash
RESEND_API_KEY=re_...
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
```

### Step 5: Configure Clerk GitHub OAuth

1. Go to Clerk Dashboard → OAuth Applications
2. Enable GitHub provider
3. Add scopes:
   - `repo` (read repository)
   - `write:repo_hook` (manage webhooks)
   - `user:email` (read email)
4. Save configuration

### Step 6: Run Development Server

```bash
npm run dev
```

Navigate to `http://localhost:3000/dashboard/code-police`

---

## 📖 Usage Examples

### Example 1: Connect First Repository

```
1. Navigate to http://localhost:3000/dashboard/code-police
2. Click "Connect Repository"
3. Search for "ghosthunter" in repository list
4. Click "Connect" button
5. Wait for webhook setup (1-2 seconds)
6. Success! Repository now connected
```

### Example 2: Trigger Analysis on Push

```bash
# Make a code change
echo "console.log('test');" >> src/app/page.tsx

# Commit and push
git add .
git commit -m "Add test console log"
git push origin main

# Within 30 seconds, you'll receive an email report
```

### Example 3: Manual Analysis

```typescript
// Trigger analysis via API
const response = await fetch('/api/code-police/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: 'proj_abc123',
    owner: 'anurag3407',
    repo: 'ghosthunter',
    commitSha: 'abc123...',
    sendEmail: true,
    recipientEmail: 'user@example.com'
  })
});

const result = await response.json();
console.log(result.issueCounts); // { critical: 1, high: 2, ... }
```

### Example 4: View Analysis History

```
1. Go to /dashboard/code-police
2. Click on project "ghosthunter"
3. See list of all analysis runs
4. Click on a run to expand details
5. View all issues with code snippets
```

---

## 🐛 Troubleshooting

### Issue: "GitHub not connected"

**Solution**:
1. Go to Clerk User Settings
2. Connect GitHub account
3. Ensure scopes include `repo` and `write:repo_hook`
4. Refresh page

### Issue: "Webhook creation failed"

**Possible Causes**:
- GitHub token lacks `write:repo_hook` scope
- Repository already has a webhook at same URL
- Rate limit exceeded

**Solution**:
```bash
# Check existing webhooks
curl -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/owner/repo/hooks

# Delete duplicate webhook if needed
curl -X DELETE -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/owner/repo/hooks/WEBHOOK_ID
```

### Issue: "No email received"

**Checklist**:
- [ ] Resend API key configured
- [ ] Email domain verified in Resend
- [ ] `notificationPrefs.emailOnPush` is true
- [ ] `minSeverity` threshold allows issues found
- [ ] Check spam folder
- [ ] Check Resend dashboard for delivery logs

### Issue: "Analysis takes too long"

**Causes**:
- Large files (>500 lines)
- Many changed files (>20)
- GitHub API rate limits

**Solutions**:
- Code automatically chunks large files (200 lines per chunk)
- Ignores `node_modules`, `dist`, `build` folders
- Analysis runs in background (webhook returns immediately)

### Issue: "Firebase Admin not configured"

**Solution**: See [Firebase Setup Instructions](./FIREBASE_SETUP_INSTRUCTIONS.md)

---

## 🚀 Future Enhancements

### Planned Features

1. **PR Comments**: Post analysis results as GitHub PR comments
2. **Custom Rules**: User-defined code quality rules
3. **Auto-Fix**: Generate and commit suggested fixes
4. **Trend Analysis**: Track code quality over time
5. **Team Dashboards**: Shared analytics for organizations
6. **Integration with CI/CD**: Block merges on critical issues
7. **Code Metrics**: Cyclomatic complexity, maintainability index
8. **Multi-Language Support**: Better support for non-JavaScript languages
9. **Issue Tracking**: Integration with Jira, Linear, GitHub Issues
10. **Custom Prompts**: User-defined analysis prompts

### Potential Improvements

- **Performance**: Cache analysis results, deduplicate issues
- **Accuracy**: Fine-tune AI prompts, add context from related files
- **UX**: Real-time notifications, in-app issue viewer
- **Scalability**: Queue system for large repositories

---

## 📝 Summary

**Code Police** is a production-ready AI code review system that:

✅ Automatically analyzes GitHub commits and PRs  
✅ Detects security vulnerabilities, performance issues, and bugs  
✅ Sends professional email reports with actionable insights  
✅ Integrates seamlessly with GitHub via webhooks  
✅ Uses state-of-the-art AI (Gemini 2.0 Flash + LangChain)  
✅ Scales to handle repositories of any size  
✅ Protects user privacy with strong authentication and authorization  

**Perfect for**:
- Solo developers wanting to improve code quality
- Teams maintaining high standards
- Open source projects welcoming contributions
- Security-conscious organizations

---

**Last Updated**: January 2, 2026  
**Version**: 1.0.0  
**Maintained by**: GhostFounder Team
