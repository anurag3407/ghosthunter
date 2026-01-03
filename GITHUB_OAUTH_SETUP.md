# GitHub OAuth Setup for GhostFounder

This guide explains how to configure GitHub OAuth with Clerk for the GhostFounder application.

## Overview

GhostFounder uses **Clerk** for all authentication, including GitHub OAuth. When users connect their GitHub account, Clerk manages the OAuth tokens securely.

---

## Step 1: Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"OAuth Apps"** → **"New OAuth App"**
3. Fill in the details:

| Field | Value |
|-------|-------|
| **Application name** | GhostFounder |
| **Homepage URL** | `http://localhost:3000` (or your production URL) |
| **Authorization callback URL** | Get this from Clerk Dashboard (see Step 2) |

4. Click **"Register application"**
5. **Copy the Client ID**
6. **Generate and copy the Client Secret**

---

## Step 2: Configure GitHub in Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Navigate to **Configure** → **SSO Connections** → **Social Connections**
4. Enable **GitHub**
5. Select **"Use custom credentials"**
6. Enter your GitHub OAuth credentials
7. **Copy the Redirect URI** shown and use it in Step 1
8. **Enable these scopes:**
   - ✅ `repo` - Required for Code Police
   - ✅ `read:user` - Read user profile
   - ✅ `user:email` - Access email
   - ✅ `admin:repo_hook` - Create webhooks
9. Click **Save**

---

## Step 3: Connect GitHub as a User

Users can connect GitHub in two ways:

### Option A: Sign up/in with GitHub
Users can use "Continue with GitHub" on the sign-in page.

### Option B: Connect in Settings
1. Go to `/dashboard/settings`
2. Click **"Manage Account"** or **"Connect GitHub"**
3. In the Clerk modal, go to **Connected Accounts**
4. Click **Connect GitHub**

---

## Architecture

All GitHub OAuth is now handled through Clerk:

```
User Action                    Backend
    │                           │
    ▼                           ▼
Settings Page ──────────► Clerk UserProfile Modal
    │                           │
    ▼                           ▼
Code Police Connect ────► /api/github/repos
    │                           │
    ▼                           ▼
                         clerk.users.getUserOauthAccessToken()
                                │
                                ▼
                         GitHub API (Octokit)
```

---

## Troubleshooting

### "GitHub not connected" error
1. Go to `/dashboard/settings`
2. Click "Manage Account"
3. Connect GitHub in the modal

### 401 Unauthorized
The user hasn't connected GitHub via Clerk. Redirect them to settings.

### No repositories shown
Check that the OAuth scopes include `repo` for private repos.
