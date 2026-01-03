# 🛡️ Code Police - Quick Reference Guide

> Fast lookup for common tasks, API endpoints, and configurations

## 📋 Quick Start (5 Minutes)

```bash
# 1. Set environment variables
GEMINI_API_KEY=your_key
RESEND_API_KEY=your_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_email
FIREBASE_PRIVATE_KEY="your_key"

# 2. Run the app
npm run dev

# 3. Connect repository
# Navigate to: http://localhost:3000/dashboard/code-police
# Click: "Connect Repository"
# Select your repo and click "Connect"

# 4. Push code
git push origin main

# 5. Check email for analysis report!
```

---

## 🔌 API Endpoints Quick Reference

### GitHub Repository Management

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| `GET` | `/api/github/repos` | List user's GitHub repositories | ✅ Clerk |
| `POST` | `/api/github/connect` | Connect repository & setup webhook | ✅ Clerk |

### Code Police Analysis

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| `POST` | `/api/code-police/analyze` | Trigger manual analysis | ✅ Clerk |
| `GET` | `/api/code-police/analyze` | Fetch analysis history | ✅ Clerk |
| `GET` | `/api/code-police/projects` | List all projects | ✅ Clerk |
| `POST` | `/api/code-police/projects` | Create new project | ✅ Clerk |

### Webhooks

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| `POST` | `/api/webhooks/github` | Receive GitHub webhook events | ✅ HMAC Signature |

---

## 📊 Data Models Cheat Sheet

### Project
```typescript
{
  id: string;
  userId: string;
  name: string;
  githubRepoId: number;
  githubFullName: string;        // "owner/repo"
  defaultBranch: string;          // "main"
  language: string;               // "TypeScript"
  webhookId: number;
  webhookSecret: string;
  isActive: boolean;
  rulesProfile: RulesProfile;
  notificationPrefs: NotificationPrefs;
}
```

### AnalysisRun
```typescript
{
  id: string;
  projectId: string;
  commitSha: string;
  branch: string;
  status: "pending" | "running" | "completed" | "failed";
  issueCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  summary: string;                // AI-generated summary
  createdAt: Timestamp;
  completedAt?: Timestamp;
}
```

### CodeIssue
```typescript
{
  id: string;
  analysisRunId: string;
  filePath: string;               // "src/lib/auth.ts"
  line: number;
  severity: "critical" | "high" | "medium" | "low" | "info";
  category: "security" | "performance" | "readability" | "bug" | "test" | "style";
  message: string;                // "SQL injection vulnerability"
  explanation: string;            // Detailed explanation
  suggestedFix?: string;          // "Use parameterized queries"
  codeSnippet?: string;           // Code context (±3 lines)
}
```

---

## 🎯 Issue Categories & Severities

### Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **Security** | Vulnerabilities that could be exploited | SQL injection, XSS, hardcoded secrets |
| **Performance** | Code that could cause slow execution | N+1 queries, memory leaks, inefficient algorithms |
| **Bug** | Logic errors that cause incorrect behavior | Null pointer risks, race conditions, off-by-one |
| **Readability** | Code that is hard to understand/maintain | Complex functions, unclear naming, missing comments |
| **Test** | Testing gaps or issues | Untested edge cases, missing error handling tests |
| **Style** | Code formatting and conventions | Formatting, naming conventions, file organization |

### Severities

| Severity | Icon | Color | Action Required |
|----------|------|-------|-----------------|
| **Critical** | 🚨 | Red | Fix immediately before deploy |
| **High** | ⚠️ | Orange | Fix before merge to main |
| **Medium** | ⚡ | Yellow | Fix in this sprint |
| **Low** | 📋 | Blue | Fix when convenient |
| **Info** | ℹ️ | Gray | Optional improvement |

---

## 🌐 Routes & Pages

### Dashboard Pages

| Route | Page | Purpose |
|-------|------|---------|
| `/dashboard/code-police` | Project List | View all connected repositories |
| `/dashboard/code-police/connect` | Connect Repo | GitHub repository selection |
| `/dashboard/code-police/[id]` | Project Detail | View analysis history for project |

---

## 🔧 Environment Variables Reference

### Required Variables

```bash
# AI Model (Google Gemini)
GEMINI_API_KEY=AIzaSy...                          # Get from: https://makersuite.google.com/app/apikey

# Email Service (Resend)
RESEND_API_KEY=re_...                             # Get from: https://resend.com/api-keys

# Firebase Admin SDK
FIREBASE_PROJECT_ID=ghostfounder-a4994
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@ghostfounder-a4994.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com       # For webhook URL generation
```

### Optional Variables

```bash
# Custom email sender address (requires domain verification in Resend)
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
```

---

## 📝 Common Code Snippets

### Trigger Manual Analysis

```typescript
const response = await fetch('/api/code-police/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: 'proj_abc123',
    owner: 'anurag3407',
    repo: 'ghosthunter',
    commitSha: 'abc123...',        // Optional: defaults to latest
    sendEmail: true,
    recipientEmail: 'user@example.com'
  })
});

const result = await response.json();
console.log(result.issueCounts);
// { critical: 1, high: 2, medium: 5, low: 3, info: 2 }
```

### Fetch Analysis History

```typescript
const response = await fetch(
  '/api/code-police/analyze?projectId=proj_abc123&limit=10'
);

const { runs } = await response.json();
runs.forEach(run => {
  console.log(`${run.commitSha.slice(0, 7)}: ${run.issueCounts.critical} critical issues`);
});
```

### List All Projects

```typescript
const response = await fetch('/api/code-police/projects');
const { projects } = await response.json();

projects.forEach(project => {
  console.log(`${project.name} (${project.language}) - ${project.isActive ? 'Active' : 'Inactive'}`);
});
```

---

## 🔍 Supported Languages

| Language | File Extensions | Analysis Quality |
|----------|----------------|------------------|
| TypeScript | `.ts`, `.tsx` | ⭐⭐⭐⭐⭐ Excellent |
| JavaScript | `.js`, `.jsx` | ⭐⭐⭐⭐⭐ Excellent |
| Python | `.py` | ⭐⭐⭐⭐⭐ Excellent |
| Java | `.java` | ⭐⭐⭐⭐ Very Good |
| Go | `.go` | ⭐⭐⭐⭐ Very Good |
| Rust | `.rs` | ⭐⭐⭐⭐ Very Good |
| Ruby | `.rb` | ⭐⭐⭐⭐ Very Good |
| PHP | `.php` | ⭐⭐⭐⭐ Very Good |
| C# | `.cs` | ⭐⭐⭐ Good |
| C++ | `.cpp` | ⭐⭐⭐ Good |
| Swift | `.swift` | ⭐⭐⭐ Good |
| Kotlin | `.kt` | ⭐⭐⭐ Good |
| SQL | `.sql` | ⭐⭐⭐ Good |
| Solidity | `.sol` | ⭐⭐⭐ Good |

---

## 🚨 Common Errors & Quick Fixes

### Error: "GitHub not connected"

**Quick Fix**:
```bash
# 1. Go to your profile settings
# 2. Connect GitHub account via Clerk
# 3. Ensure scopes include: repo, write:repo_hook, user:email
# 4. Refresh the page
```

### Error: "Webhook creation failed"

**Quick Fix**:
```bash
# Check if webhook already exists
curl -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/owner/repo/hooks

# If duplicate exists, delete it:
curl -X DELETE -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/owner/repo/hooks/WEBHOOK_ID

# Then try connecting again
```

### Error: "Database not configured"

**Quick Fix**:
```bash
# Add Firebase credentials to .env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-email
FIREBASE_PRIVATE_KEY="your-key"

# Restart dev server
npm run dev
```

### Error: "Email not sent"

**Checklist**:
- [ ] `RESEND_API_KEY` is set in `.env`
- [ ] Email domain is verified in Resend (or use `onboarding@resend.dev` for testing)
- [ ] `notificationPrefs.emailOnPush` is `true` in project settings
- [ ] Check Resend dashboard for delivery logs
- [ ] Check spam folder

---

## 📧 Email Subject Patterns

| Issue Count | Subject Line |
|-------------|--------------|
| Critical issues > 0 | 🚨 Critical Issues Found - abc1234 |
| High issues > 0 (no critical) | ⚠️ High Priority Issues - abc1234 |
| Any issues (no critical/high) | 📋 Code Review Report - abc1234 |
| Zero issues | ✅ Clean Commit - abc1234 |

---

## 🔐 Security Checklist

- [ ] Firebase Admin credentials in `.env` (never commit)
- [ ] GitHub tokens stored in Firestore (encrypted)
- [ ] Webhook secrets generated with `crypto.randomBytes(32)`
- [ ] All API routes require Clerk authentication
- [ ] All database queries filter by `userId`
- [ ] Webhook signatures verified with HMAC-SHA256
- [ ] Code snippets limited to ±3 lines (minimal exposure)
- [ ] `.gitignore` includes `.env`, `service-account*.json`

---

## 🎯 Example Analysis Results

### Sample Email Report Structure

```
🛡️ Code Police Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Repository: anurag3407/ghosthunter
Branch: main
Commit: abc1234

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 SUMMARY
Found 13 issues across 8 files. 1 critical security
vulnerability detected in src/lib/auth.ts requiring
immediate attention. Additionally, 2 high-priority
performance issues were identified...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 ISSUE COUNTS
Critical: 1  |  High: 2  |  Medium: 5  |  Low: 3  |  Info: 2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 CRITICAL ISSUES (1)

[SECURITY] SQL injection vulnerability
📄 src/lib/auth.ts:45

User input is directly concatenated into SQL query
without sanitization, allowing potential SQL injection
attacks.

Code:
45: const query = `SELECT * FROM users WHERE username='${username}'`;

✓ Fix: Use parameterized queries or an ORM.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ HIGH PRIORITY ISSUES (2)

[PERFORMANCE] N+1 query detected
📄 src/components/UserList.tsx:23
...
```

---

## 🧪 Testing the Integration

### Test Webhook Locally

```bash
# 1. Use ngrok to expose localhost
npx ngrok http 3000

# 2. Update webhook URL in GitHub
# Webhooks → Edit → Update URL to: https://abc123.ngrok.io/api/webhooks/github

# 3. Push code
git push origin main

# 4. Check ngrok console for incoming webhook
# 5. Check terminal logs for analysis results
```

### Test Email Without GitHub

```typescript
// Create test script: test-email.ts
import { sendAnalysisReport } from '@/lib/agents/code-police/email';

const mockRun = {
  id: 'test',
  commitSha: 'abc1234',
  branch: 'main',
  issueCounts: { critical: 1, high: 2, medium: 5, low: 3, info: 2 },
  // ... other required fields
};

const mockIssues = [
  {
    severity: 'critical',
    category: 'security',
    message: 'SQL injection vulnerability',
    filePath: 'src/lib/auth.ts',
    line: 45,
    explanation: 'User input not sanitized...',
    suggestedFix: 'Use parameterized queries',
    // ... other fields
  }
];

await sendAnalysisReport({
  to: 'your-email@example.com',
  run: mockRun,
  issues: mockIssues,
  summary: 'Test email - 1 critical issue found',
  repoName: 'test/repo',
  commitUrl: 'https://github.com/test/repo/commit/abc1234'
});
```

---

## 📚 Key Files Reference

| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/agents/code-police/analyzer.ts` | 250 | AI analysis engine (LangChain + Gemini) |
| `src/lib/agents/code-police/email.ts` | 350 | Email report generation (Resend) |
| `src/lib/agents/code-police/github.ts` | 248 | GitHub API client (Octokit) |
| `src/app/api/webhooks/github/route.ts` | 402 | Webhook event handler |
| `src/app/api/code-police/analyze/route.ts` | 240 | Analysis trigger endpoint |
| `src/app/dashboard/code-police/page.tsx` | 200 | Project list UI |
| `src/app/dashboard/code-police/connect/page.tsx` | 285 | Repository connection UI |
| `src/types/index.ts` (lines 97-200) | 103 | TypeScript type definitions |

---

## 🎨 UI Components

### Project Card (Dashboard)

```tsx
<div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
  <div className="flex items-center gap-3 mb-4">
    <Shield className="w-6 h-6 text-red-400" />
    <h3 className="text-xl font-semibold text-white">ghosthunter</h3>
  </div>
  <p className="text-zinc-400 mb-4">anurag3407/ghosthunter</p>
  <div className="flex items-center gap-4">
    <span className="text-sm text-zinc-500">TypeScript</span>
    <span className="text-sm text-green-400">● Active</span>
  </div>
</div>
```

### Severity Badge

```tsx
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical": return "bg-red-500/10 text-red-400 border-red-500/20";
    case "high": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    case "medium": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "low": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
};
```

---

**Last Updated**: January 2, 2026  
**Version**: 1.0.0  
**For Full Documentation**: See [CODE_POLICE_README.md](./CODE_POLICE_README.md)
