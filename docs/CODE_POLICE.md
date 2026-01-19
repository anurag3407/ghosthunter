# 🛡️ Code Police - AI-Powered Code Review System

> Automated, intelligent code review that analyzes every commit and pull request in real-time.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [User Flow](#user-flow)
- [Core Components](#core-components)
- [GitHub Integration](#github-integration)
- [AI Analysis Pipeline](#ai-analysis-pipeline)
- [Auto-Fix with PR](#auto-fix-with-pr)
- [Email Notifications](#email-notifications)
- [Analytics Dashboard](#analytics-dashboard)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Configuration](#configuration)

---

## Overview

Code Police is an AI-powered code review system that integrates with GitHub to provide automated, intelligent code analysis. It detects issues across multiple categories including security vulnerabilities, performance problems, bugs, code quality, and style violations.

### Key Features

| Feature | Description |
|---------|-------------|
| **Real-time Analysis** | Analyzes code on every push and pull request |
| **Multi-Category Detection** | Security, Performance, Bugs, Readability, Style |
| **Severity Classification** | Critical, High, Medium, Low, Info levels |
| **Email Reports** | Professional HTML reports with actionable insights |
| **Auto-Fix PRs** | AI-generated fix suggestions as pull requests |
| **Custom Rules** | User-defined rules enforced during analysis |
| **Analytics Dashboard** | Repository health metrics and trends |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CODE POLICE SYSTEM                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────────┐    ┌────────────────────────────┐ │
│  │   GitHub     │───▶│  Webhook Handler │───▶│   Analysis Pipeline        │ │
│  │  Push/PR     │    │  /api/webhooks/  │    │                            │ │
│  └──────────────┘    │    github        │    │  ┌──────────────────────┐  │ │
│                      └──────────────────┘    │  │  1. Fetch Commit     │  │ │
│                             │                │  │  2. Get File Content │  │ │
│                             │                │  │  3. Detect Language  │  │ │
│  ┌──────────────┐           │                │  │  4. Analyze Code     │  │ │
│  │   Firestore  │◀──────────┤                │  │  5. Generate Summary │  │ │
│  │   Database   │           │                │  │  6. Save Results     │  │ │
│  │              │           │                │  └──────────────────────┘  │ │
│  │  - projects  │           │                └────────────────────────────┘ │
│  │  - analysis  │           │                                                │
│  │  - issues    │           ▼                                                │
│  └──────────────┘    ┌──────────────────┐    ┌────────────────────────────┐ │
│                      │  Email Service   │    │   AI Analysis Engine       │ │
│                      │  (Nodemailer)    │    │   (Gemini 2.0 Flash)       │ │
│  ┌──────────────┐    │                  │    │                            │ │
│  │   Clerk      │    │  - HTML Reports  │    │  - LangChain Integration   │ │
│  │   Auth       │    │  - Issue Summary │    │  - Custom Rules Support    │ │
│  │              │    │  - Fix Links     │    │  - Graph-Aware Analysis    │ │
│  └──────────────┘    └──────────────────┘    └────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 + React 19 + TypeScript |
| **Backend** | Next.js API Routes |
| **Database** | Firebase Firestore |
| **AI/ML** | Google Gemini 2.0 Flash + LangChain |
| **Authentication** | Clerk (OAuth with GitHub) |
| **Email** | Nodemailer with Gmail SMTP |
| **Version Control** | GitHub REST API v3 |

---

## User Flow

### 1. Project Setup Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Login     │────▶│  Connect    │────▶│  Select Repo    │────▶│   Configure  │
│   (Clerk)   │     │  GitHub     │     │  from List      │     │   Webhook    │
└─────────────┘     └─────────────┘     └─────────────────┘     └──────────────┘
                           │                    │                       │
                           ▼                    ▼                       ▼
                    GitHub OAuth         Fetches repos           Auto-creates
                    Token saved          via GitHub API          webhook in repo
```

**Steps:**
1. User signs in via Clerk (supports Google, GitHub, Email)
2. User connects GitHub account (OAuth flow)
3. User selects repository to monitor
4. System automatically creates webhook in the repository
5. Project is created in Firestore with webhook secret

### 2. Analysis Flow (Push Event)

```
┌──────────────┐     ┌──────────────────┐     ┌───────────────┐     ┌──────────────┐
│  Developer   │────▶│  GitHub Push     │────▶│   Webhook     │────▶│   Analyze    │
│  Commits     │     │  Event           │     │   Handler     │     │   Changed    │
└──────────────┘     └──────────────────┘     └───────────────┘     │   Files      │
                                                     │              └──────────────┘
                                                     │                     │
                            ┌────────────────────────┴─────────────────────┤
                            │                                              │
                            ▼                                              ▼
                     ┌──────────────┐                              ┌──────────────┐
                     │  Save to     │                              │  Send Email  │
                     │  Firestore   │                              │  Report      │
                     └──────────────┘                              └──────────────┘
```

**Detailed Steps:**
1. Developer pushes code to GitHub
2. GitHub sends webhook event to `/api/webhooks/github`
3. Handler validates signature and finds project
4. System fetches commit details and changed files
5. Each file is analyzed by AI (Gemini 2.0 Flash)
6. Issues are categorized and saved to Firestore
7. Email report is sent if enabled

### 3. Analysis Flow (Pull Request)

```
┌──────────────┐     ┌──────────────────┐     ┌───────────────┐     ┌──────────────┐
│  Developer   │────▶│  PR Opened/      │────▶│   Webhook     │────▶│   Analyze    │
│  Opens PR    │     │  Synchronized    │     │   Handler     │     │   PR Files   │
└──────────────┘     └──────────────────┘     └───────────────┘     └──────────────┘
                                                                           │
                                                                           ▼
                                                                    ┌──────────────┐
                                                                    │  Post PR     │
                                                                    │  Comment     │
                                                                    └──────────────┘
```

---

## Core Components

### File Structure

```
src/lib/agents/code-police/
├── analyzer.ts          # AI analysis with Gemini/LangChain
├── github.ts            # GitHub API integration (18+ functions)
├── email.ts             # HTML email report generation
├── auto-fix.ts          # Automatic fix generation
├── fix-generator.ts     # AI-powered code fix suggestions
├── pr-creator.ts        # Creates PRs with fixes
├── analytics.ts         # Repository health metrics
├── analytics-ai.ts      # AI-powered insights
└── index.ts             # Module exports
```

### 1. Analyzer (`analyzer.ts`)

The core AI analysis engine using LangChain and Google Gemini.

**Key Functions:**

| Function | Description |
|----------|-------------|
| `analyzeCode()` | Analyzes code for issues with custom rules support |
| `generateAnalysisSummary()` | Creates human-readable summary for emails |
| `detectLanguage()` | Detects programming language from file extension |
| `extractCodeSnippet()` | Extracts code context around issues |
| `chunkCode()` | Handles large files by chunking |

**Analysis Categories:**
- 🔒 **Security** - Vulnerabilities, injection risks, auth issues
- ⚡ **Performance** - Inefficient algorithms, memory leaks
- 🐛 **Bug** - Logic errors, null references, edge cases
- 📖 **Readability** - Code clarity, naming conventions
- 🎨 **Style** - Formatting, consistency issues

**Severity Levels:**
| Level | Color | Description |
|-------|-------|-------------|
| Critical | 🔴 | Immediate security/stability risk |
| High | 🟠 | Significant issues needing prompt attention |
| Medium | 🟡 | Potential problems to address |
| Low | 🟢 | Minor improvements |
| Info | 🔵 | Suggestions and best practices |

### 2. GitHub Service (`github.ts`)

Comprehensive GitHub API integration.

**Key Functions:**

| Function | Description |
|----------|-------------|
| `fetchUserRepos()` | Lists user's repositories |
| `fetchFileContent()` | Gets file content from repo |
| `fetchCommit()` | Gets commit details with changed files |
| `fetchCommitDiff()` | Compares two commits |
| `fetchRepoTree()` | Gets full repository file tree |
| `createWebhook()` | Creates webhook for repository |
| `deleteWebhook()` | Removes webhook |
| `postPRComment()` | Posts analysis comment on PR |
| `formatPRComment()` | Formats issues as markdown |
| `getDependentFiles()` | Graph-aware analysis support |

### 3. Email Service (`email.ts`)

Professional HTML email report generation.

**Features:**
- Responsive HTML email design
- Issue severity breakdown with colors
- Code snippets with syntax highlighting
- Actionable fix suggestions
- Links to affected files
- Commit diff summary

### 4. Auto-Fix System (`auto-fix.ts`, `fix-generator.ts`, `pr-creator.ts`)

AI-powered automatic fix generation.

**Flow:**
1. User requests fix for specific issues
2. AI generates code fixes using context
3. System creates a new branch
4. Applies fixes to files
5. Opens PR with detailed description

---

## GitHub Integration

### Webhook Configuration

```
POST https://your-app.com/api/webhooks/github

Headers:
  - X-GitHub-Event: push | pull_request
  - X-Hub-Signature-256: sha256=<hmac>
  - X-GitHub-Delivery: <uuid>

Events Monitored:
  - push (all branches)
  - pull_request (opened, synchronize, reopened)
```

### Signature Verification

```typescript
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = `sha256=${hmac.update(payload).digest("hex")}`;
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}
```

### OAuth Token Management

Tokens are stored securely in Clerk and fetched per-request:

```typescript
// Fetch GitHub OAuth token from Clerk
const clerkResponse = await fetch(
  `https://api.clerk.com/v1/users/${userId}/oauth_access_tokens/oauth_github`,
  { headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` } }
);
```

---

## AI Analysis Pipeline

### 1. Prompt Engineering

The analysis uses a carefully crafted prompt:

```
You are a senior code reviewer with expertise in security, 
performance, and code quality. Analyze the following code for issues.

**File:** {filePath}
**Language:** {language}
**Commit Message:** {commitMessage}

{CUSTOM_RULES_SECTION}

**Code to analyze:**
{code}

{DEPENDENT_CONTEXT_SECTION}

Focus on:
- Security vulnerabilities (injections, XSS, auth issues)
- Performance issues (N+1 queries, memory leaks)
- Potential bugs and edge cases
- Code readability and maintainability
- Custom rules violations (if provided)
```

### 2. Custom Rules Support

Users can define custom rules that are enforced during analysis:

```typescript
// Example custom rules
const customRules = [
  "Never use console.log in production code",
  "All API endpoints must have rate limiting",
  "Database queries must use parameterized statements"
];
```

### 3. Graph-Aware Analysis

For comprehensive analysis, the system considers dependent files:

```typescript
// Find files that import the current file
const dependentFiles = await getDependentFiles(
  accessToken, owner, repo, targetFilePath
);
// Include context in analysis prompt
```

---

## Email Notifications

### Configuration

Email notifications are configured per-project:

```typescript
interface NotificationPrefs {
  emailOnPush: boolean;
  additionalEmails: string[];
}
```

### Email Report Structure

```
┌────────────────────────────────────────────────────────────┐
│  🛡️ CODE POLICE REPORT                                     │
│  Repository: owner/repo                                    │
│  Commit: abc1234                                           │
│  Branch: main                                              │
├────────────────────────────────────────────────────────────┤
│  📊 SUMMARY                                                │
│  ┌────────────────────────────────────────────────────┐   │
│  │  🔴 Critical: 1  │  🟠 High: 3  │  🟡 Medium: 5    │   │
│  └────────────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────────────┤
│  📝 AI ANALYSIS SUMMARY                                    │
│  This commit introduces a SQL injection vulnerability...   │
├────────────────────────────────────────────────────────────┤
│  🔍 ISSUES BY FILE                                         │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  src/api/users.ts                                    │  │
│  │  Line 42: [CRITICAL] SQL Injection vulnerability    │  │
│  │           Suggested fix: Use parameterized query    │  │
│  │           ```sql                                    │  │
│  │           SELECT * FROM users WHERE id = $1         │  │
│  │           ```                                       │  │
│  └─────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────┤
│  📁 COMMIT CHANGES                                         │
│  +125 -45 across 8 files                                   │
└────────────────────────────────────────────────────────────┘
```

---

## Analytics Dashboard

### Repository Health Metrics

| Metric | Description | Calculation |
|--------|-------------|-------------|
| **Health Score** | Overall repo health (0-100) | Weighted average of factors |
| **Bus Factor** | Team knowledge distribution | Based on contributor analysis |
| **Documentation Score** | Code documentation quality | README + comments analysis |
| **Activity Trend** | Commit activity over time | Weekly commit counts |

### Issue Trends

- Issues over time chart
- Severity distribution
- Most common categories
- Resolution rate

---

## API Reference

### Projects API

```
GET    /api/code-police/projects          # List user's projects
POST   /api/code-police/projects          # Create new project
GET    /api/code-police/projects/:id      # Get project details
DELETE /api/code-police/projects/:id      # Delete project
```

### Analysis API

```
GET    /api/code-police/analysis          # List recent analyses
GET    /api/code-police/analysis/:id      # Get analysis details
```

### Analytics API

```
GET    /api/code-police/analytics?projectId=xxx    # Get analytics
POST   /api/code-police/analytics/refresh          # Refresh data
```

### Webhook API

```
POST   /api/webhooks/github               # GitHub webhook endpoint
```

---

## Database Schema

### Projects Collection

```typescript
interface Project {
  id: string;
  userId: string;
  name: string;
  owner: string;
  repo: string;
  githubRepoId: number;
  webhookId: number;
  webhookSecret: string;
  status: 'active' | 'paused' | 'stopped';
  customRules?: string[];
  ownerEmail?: string;
  notificationPrefs?: {
    emailOnPush?: boolean;
    additionalEmails?: string[];
  };
  createdAt: Timestamp;
  lastAnalysisAt?: Timestamp;
}
```

### Analysis Runs Collection

```typescript
interface AnalysisRun {
  id: string;
  userId: string;
  projectId: string;
  commitSha: string;
  branch: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  triggerType: 'push' | 'pull_request' | 'manual';
  summary?: string;
  filesAnalyzed: number;
  issueCount: number;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  error?: string;
}
```

### Issues Subcollection

```typescript
interface CodeIssue {
  id: string;
  analysisRunId: string;
  projectId: string;
  filePath: string;
  line: number;
  endLine?: number;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'security' | 'performance' | 'bug' | 'readability' | 'style';
  message: string;
  explanation: string;
  suggestedFix?: string;
  codeSnippet?: string;
  ruleId?: string;
  isMuted: boolean;
}
```

---

## Configuration

### Environment Variables

```bash
# Required for Code Police
GOOGLE_API_KEY=             # Gemini AI API key
CLERK_SECRET_KEY=           # For fetching OAuth tokens

# Email (Nodemailer)
GMAIL_USER=                 # Gmail address
GMAIL_APP_PASSWORD=         # Gmail app password

# Application
NEXT_PUBLIC_APP_URL=        # Your deployed URL
```

### Project Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `status` | `active` | active, paused, stopped |
| `emailOnPush` | `true` | Send email on each push |
| `additionalEmails` | `[]` | Extra recipients for reports |
| `customRules` | `[]` | User-defined analysis rules |

---

## Usage Limits (SaaS Tiers)

| Feature | Free Tier | Pro Tier |
|---------|-----------|----------|
| Projects | 1 | Unlimited |
| Push Analyses/month | 2 | Unlimited |
| Fix with PR/month | 2 | Unlimited |

---

## Troubleshooting

### Common Issues

**Webhook not receiving events:**
1. Check GitHub Settings → Webhooks → Recent Deliveries
2. Verify webhook URL is accessible
3. Confirm webhook secret matches

**Analysis not running:**
1. Check if project status is `active`
2. Verify GitHub OAuth token is valid
3. Check usage limits for free tier

**Email not sending:**
1. Verify Gmail credentials in environment
2. Check if emailOnPush is enabled
3. Confirm ownerEmail is set

---

## Related Documentation

- [Main README](../README.md)
- [Architecture Overview](../ARCHITECTURE.md)
- [AI Models Reference](./AI_MODELS.md)
- [Contributing Guide](../CONTRIBUTING.md)
