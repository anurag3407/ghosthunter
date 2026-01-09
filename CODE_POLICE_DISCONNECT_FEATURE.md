# Code Police - Disconnect Repository Feature

## Overview
Added the ability to disconnect/remove repositories from Code Police tracking directly from the dashboard.

## What Was Added

### 1. Disconnect API Endpoint
**File:** `src/app/api/code-police/disconnect/route.ts`

**Features:**
- Deletes webhook from GitHub repository
- Removes project document from Firestore
- Optionally deletes all analysis runs for the project
- Verifies user ownership before allowing disconnect
- Handles errors gracefully (continues even if webhook deletion fails)

**Endpoint:** `POST /api/code-police/disconnect`

**Request Body:**
```json
{
  "projectId": "project-id-here",
  "deleteAnalysisRuns": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Repository disconnected successfully",
  "details": {
    "projectId": "project-id",
    "webhookDeleted": true,
    "runsDeleted": 5
  }
}
```

### 2. Updated Projects API
**File:** `src/app/api/code-police/projects/route.ts`

**Changes:**
- GET endpoint now includes latest analysis run for each project
- Returns properly formatted dates (ISO strings)
- Includes issue counts and run status

### 3. Updated Code Police Dashboard
**File:** `src/app/dashboard/code-police/page.tsx`

**Changes:**
- Converted from Server Component to Client Component
- Added disconnect button (trash icon) to each project card
- Added confirmation dialog ("Confirm? Yes/No")
- Shows loading state during disconnect operation
- Auto-refreshes project list after disconnect
- Better error handling and user feedback

**UI Flow:**
1. Click trash icon → Shows "Confirm? Yes/No"
2. Click "Yes" → Shows loading spinner
3. API call completes → Project disappears from list
4. Click "No" → Cancels and returns to normal state

## How to Use

### As a User:
1. Go to Code Police dashboard
2. Find the repository you want to disconnect
3. Click the trash icon (🗑️) on the right side
4. Confirm by clicking "Yes"
5. Repository will be removed from your dashboard

### To Fix Webhook Issues:
1. **Disconnect** the repository using the trash icon
2. **Reconnect** it from the production URL (https://ghosthunter-production.up.railway.app)
3. This ensures the webhook points to Railway instead of localhost

## Technical Details

### Disconnect Process:
1. **Verify Ownership:** Checks that the project belongs to the requesting user
2. **Delete GitHub Webhook:** Makes DELETE request to GitHub API using user's OAuth token
3. **Delete Analysis Runs:** Optionally removes all analysis history (batch delete)
4. **Delete Project:** Removes the project document from Firestore
5. **Return Success:** Sends response with details of what was deleted

### Error Handling:
- **Webhook deletion fails:** Continues anyway (webhook might not exist)
- **Analysis run deletion fails:** Logs error but continues
- **Project not found:** Returns 404
- **Unauthorized:** Returns 403 if project doesn't belong to user

### Security:
- ✅ Requires authentication (Clerk)
- ✅ Verifies project ownership
- ✅ Uses user's own OAuth token to delete webhooks
- ✅ No way to delete other users' projects

## Files Changed

1. ✅ Created `src/app/api/code-police/disconnect/route.ts`
2. ✅ Updated `src/app/dashboard/code-police/page.tsx`
3. ✅ Updated `src/app/api/code-police/projects/route.ts`
4. ✅ Updated `.env` (changed NEXT_PUBLIC_APP_URL to Railway URL)
5. ✅ Updated `WEBHOOK_SETUP_GUIDE.txt`

## Testing

### Manual Test Steps:
1. Open Code Police dashboard
2. Verify you can see connected repositories
3. Click trash icon on a repository
4. Verify "Confirm? Yes/No" appears
5. Click "No" - verify it cancels
6. Click trash again, then "Yes"
7. Verify loading spinner shows
8. Verify project disappears from list
9. Go to GitHub repo settings → Webhooks
10. Verify webhook was deleted

### API Test:
```bash
# Test disconnect endpoint
curl -X POST https://ghosthunter-production.up.railway.app/api/code-police/disconnect \
  -H "Content-Type: application/json" \
  -d '{"projectId": "your-project-id", "deleteAnalysisRuns": true}'
```

## Next Steps

To fix your webhook issue:
1. **Disconnect** your current repository (uses localhost webhook)
2. **Reconnect** from production: https://ghosthunter-production.up.railway.app/dashboard/code-police
3. **Test** by pushing code to the repository
4. **Verify** in Railway logs that webhook is received

This will ensure your webhook points to Railway instead of localhost!
