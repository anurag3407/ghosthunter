# Code Police - Complete Fix Summary

## Critical Issues Fixed

### 1. GitHub Token Not Retrieved Correctly ❌ → ✅

**Problem:** The webhook handler was trying to get `githubAccessToken` from Firestore user document, but tokens are stored in Clerk OAuth.

**Fix:** Updated webhook handler and analyze route to fetch GitHub tokens from Clerk API first, with Firestore fallback.

**Files Changed:**
- `src/app/api/webhooks/github/route.ts` (lines 159-190)
- `src/app/api/code-police/analyze/route.ts` (lines 47-78)

### 2. Issues Not Being Stored in Firestore ❌ → ✅

**Problem:** The webhook handler created issues array but never actually stored them in Firestore.

**Fix:** Added batch write to store all issues in the `issues` collection.

**Files Changed:**
- `src/app/api/webhooks/github/route.ts` (lines 325-340 for push, lines 500-515 for PR)

### 3. Inconsistent GitHub Repo ID Type ❌ → ✅

**Problem:** GitHub sends `repository.id` as a number, but connect route might store as string.

**Fix:** Force numeric conversion when storing `githubRepoId` in Firestore.

**Files Changed:**
- `src/app/api/github/connect/route.ts` (line 106)

### 4. Disconnect Using Wrong Webhook ID Field ❌ → ✅

**Problem:** Disconnect API looked for `githubWebhookId` but connect stores as `webhookId`.

**Fix:** Check both field names for backwards compatibility.

**Files Changed:**
- `src/app/api/code-police/disconnect/route.ts` (line 68)

### 5. Better Logging Throughout ✅

**Added comprehensive logging to trace webhook flow:**
- Webhook receipt
- Project lookup
- Signature verification
- Token retrieval
- File analysis
- Issue storage
- Email notifications

## New Features Added

### 1. Debug Endpoint

**URL:** `GET /api/code-police/debug`

**Purpose:** Diagnoses Code Police setup issues including:
- Firebase connection
- GitHub OAuth token availability
- Project configuration
- Webhook configuration
- Environment variables

### 2. Disconnect Repository Feature

**UI:** Trash icon on each project in Code Police dashboard
**API:** `POST /api/code-police/disconnect`

**Functionality:**
- Deletes webhook from GitHub
- Removes project from Firestore
- Deletes all analysis runs

## How to Test

### Step 1: Deploy to Railway

```bash
git add .
git commit -m "Fix Code Police webhook handling"
git push origin main
```

### Step 2: Run Debug Check

Visit: `https://ghosthunter-production.up.railway.app/api/code-police/debug`

Should show:
```json
{
  "status": "OK",
  "checks": {
    "authenticated": true,
    "firebase": true,
    "githubOAuth": true,
    ...
  }
}
```

### Step 3: Disconnect and Reconnect Repository

1. Go to: `https://ghosthunter-production.up.railway.app/dashboard/code-police`
2. Click the trash icon (🗑️) next to your repository
3. Confirm deletion
4. Click "Connect Repository"
5. Select the same repository

### Step 4: Verify Webhook in GitHub

1. Go to your repo → Settings → Webhooks
2. Should see webhook URL: `https://ghosthunter-production.up.railway.app/api/webhooks/github`
3. Click on webhook → Recent Deliveries should show ping with ✓

### Step 5: Test with a Push

```bash
# Make a change (e.g., add a comment with a typo)
echo "// This is a tset push" >> test-file.js

# Commit and push
git add .
git commit -m "Test code police"
git push origin main
```

### Step 6: Check Railway Logs

Should see:
```
[GitHub Webhook] Received webhook event
[GitHub Webhook] Event type: push
[GitHub Webhook] Repository: your-org/your-repo
[GitHub Webhook] Found project: <project-id>
[GitHub Webhook] Signature verified successfully
[GitHub Webhook] GitHub token obtained successfully
[GitHub Webhook] Processing event: push
[Push Event] Starting analysis for: your-org/your-repo
[Push Event] Creating analysis run: <run-id>
[Push Event] Fetching commit details...
[Push Event] Analyzing file: test-file.js
[Push Event] Issue counts: { critical: 0, high: 0, medium: 1 }
[Push Event] Stored 1 issues in Firestore
```

### Step 7: Check Dashboard

1. Go to: `https://ghosthunter-production.up.railway.app/dashboard/code-police`
2. Click on your repository
3. Should see new analysis run with results

## Troubleshooting

### "Project not found" (404)

**Cause:** Webhook arriving before project is created, or repo ID mismatch.
**Fix:** Reconnect repository from production URL.

### "No GitHub token" (400)

**Cause:** GitHub OAuth not connected or token expired.
**Fix:** Disconnect GitHub in Clerk settings, reconnect.

### "Invalid signature" (401)

**Cause:** Webhook secret mismatch between GitHub and Firestore.
**Fix:** Delete webhook from GitHub, disconnect/reconnect repository.

### "Database not configured" (503)

**Cause:** Firebase Admin not initialized.
**Fix:** Check environment variables in Railway:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`

### No webhook deliveries showing in GitHub

**Cause:** Webhook URL pointing to wrong location.
**Fix:** Verify webhook URL in GitHub shows `https://ghosthunter-production.up.railway.app/api/webhooks/github`

### Webhook shows red X in GitHub

**Cause:** Check the response body in the delivery details.
**Fix:** Common responses:
- `404 Project not found` → Reconnect repository
- `401 Invalid signature` → Reconnect repository
- `500 Internal error` → Check Railway logs

## Environment Variables Required

```
# Core
NEXT_PUBLIC_APP_URL=https://ghosthunter-production.up.railway.app

# Clerk (for auth and GitHub OAuth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Firebase Admin (for Firestore)
FIREBASE_PROJECT_ID=your-project
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Gemini (for AI analysis)
GEMINI_API_KEY=...

# Resend (for email notifications - optional)
RESEND_API_KEY=...
```

## Files Modified (Complete List)

1. ✅ `src/app/api/webhooks/github/route.ts` - Fixed token retrieval, added issue storage
2. ✅ `src/app/api/github/connect/route.ts` - Consistent repo ID type, better logging
3. ✅ `src/app/api/code-police/analyze/route.ts` - Fixed token retrieval
4. ✅ `src/app/api/code-police/disconnect/route.ts` - Fixed webhook ID field name
5. ✅ `src/app/api/code-police/projects/route.ts` - Added analysis runs to response
6. ✅ `src/app/dashboard/code-police/page.tsx` - Added disconnect button
7. ✅ `src/app/api/code-police/debug/route.ts` - NEW: Debug endpoint
8. ✅ `.env` - Updated NEXT_PUBLIC_APP_URL to Railway

## Architecture Overview

```
GitHub Push/PR
     │
     ▼
POST /api/webhooks/github
     │
     ├── Parse payload
     ├── Find project by githubRepoId
     ├── Verify webhook signature
     ├── Get GitHub token from Clerk
     │
     ▼
handlePushEvent() / handlePREvent()
     │
     ├── Create analysis_run document
     ├── Fetch commit files
     ├── For each file:
     │   ├── Fetch content from GitHub
     │   ├── Detect language
     │   └── analyzeCode() → Gemini AI
     │
     ├── Store issues in Firestore
     ├── Update analysis_run status
     └── Send email (if configured)
```

## Success Criteria

After implementing these fixes, you should see:

1. ✅ Webhook deliveries showing green ✓ in GitHub
2. ✅ Railway logs showing complete analysis flow
3. ✅ Analysis runs appearing in dashboard
4. ✅ Issues displayed for each run
5. ✅ Email notifications (if configured)
