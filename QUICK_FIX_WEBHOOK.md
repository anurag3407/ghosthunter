# 🚀 QUICK FIX: Code Police Webhook Not Working

## Problem
Your webhook is pointing to `localhost:3000` instead of your Railway deployment.

## Solution (3 Steps)

### Step 1: Update Local Environment
✅ Already done! Your `.env` now has:
```
NEXT_PUBLIC_APP_URL=https://ghosthunter-production.up.railway.app
```

### Step 2: Disconnect Old Repository
1. Go to: https://ghosthunter-production.up.railway.app/dashboard/code-police
2. Click the **🗑️ trash icon** next to your repository
3. Click **"Yes"** to confirm
4. Repository will be removed (including the localhost webhook)

### Step 3: Reconnect Repository
1. On the same page, click **"Connect Repository"**
2. Select your repository again
3. This will create a NEW webhook with the correct Railway URL

## That's It!

Now when you push code, the webhook will go to:
✅ `https://ghosthunter-production.up.railway.app/api/webhooks/github`

Instead of:
❌ `http://localhost:3000/api/webhooks/github`

## Test It

```bash
# Make a small change
echo "// test" >> your-file.js

# Commit and push
git add .
git commit -m "Test code police webhook"
git push origin main

# Check Railway logs (within 5-10 seconds)
# Should see: [GitHub Webhook] Received webhook event
```

## Verify Webhook

Go to your GitHub repo:
- Settings → Webhooks
- Should see webhook URL: `https://ghosthunter-production.up.railway.app/api/webhooks/github`
- Recent Deliveries should show green ✓

---

**Questions?** Check [WEBHOOK_SETUP_GUIDE.txt](WEBHOOK_SETUP_GUIDE.txt) for detailed troubleshooting.
