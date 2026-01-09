# Railway Deployment Guide for GhostFounder

This guide provides step-by-step instructions for deploying the GhostFounder application on Railway.

## Prerequisites

- Railway account (sign up at [railway.app](https://railway.app))
- GitHub account with repository access
- Required API keys and credentials (see Environment Variables section)

## Quick Start

### 1. Connect Repository to Railway

1. Log in to [Railway](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose the `ghosthunter` repository
5. Railway will automatically detect the Next.js project

### 2. Configure Environment Variables

In the Railway dashboard, navigate to your project → **Variables** tab and add the following environment variables:

#### Required - Clerk Authentication
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
```

Get these from: [Clerk Dashboard](https://dashboard.clerk.com/last-active?path=api-keys)

#### Required - Firebase Configuration
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxx

# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----"
```

Get these from: [Firebase Console](https://console.firebase.google.com) → Project Settings

#### Required - GitHub Integration
```bash
GITHUB_CLIENT_ID=Iv1.xxxxx
GITHUB_CLIENT_SECRET=xxxxx
GITHUB_WEBHOOK_SECRET=xxxxx
```

Get these from: [GitHub Developer Settings](https://github.com/settings/developers)

#### Optional - Database (if using)
```bash
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ghostfounder
# OR
POSTGRES_URL=postgresql://user:password@host:5432/dbname
```

#### Optional - AI Services
```bash
GOOGLE_API_KEY=AIzaxxxxx  # For Gemini AI features
```

#### Optional - Email Services
```bash
RESEND_API_KEY=re_xxxxx  # For email notifications
```

#### Optional - Blockchain (Sepolia)
```bash
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-key
NEXT_PUBLIC_EQUITY_TOKEN_ADDRESS=0x...
SEPOLIA_PRIVATE_KEY=xxxxx
```

#### Application Configuration
```bash
NEXT_PUBLIC_APP_URL=https://your-app.up.railway.app
NODE_ENV=production
```

### 3. Deploy

Railway will automatically:
1. Detect the project type (Next.js)
2. Install dependencies with `npm ci`
3. Build the application with `npm run build`
4. Start the server with `npm start`

### 4. Domain Setup

1. In Railway dashboard, go to **Settings** → **Domains**
2. Click **Generate Domain** for a free Railway subdomain
3. Or add your custom domain

### 5. Post-Deployment Configuration

#### Update Clerk Settings
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Add your Railway domain to **Allowed Origins**
3. Update **Redirect URLs** to include your Railway domain

#### Update GitHub OAuth
1. Go to GitHub OAuth App settings
2. Update **Homepage URL** to your Railway domain
3. Update **Authorization callback URL** to `https://your-app.up.railway.app/api/auth/callback/github`

#### Update Firebase
1. Go to Firebase Console → Authentication
2. Add your Railway domain to **Authorized domains**

## Deployment Configuration Files

The repository includes the following Railway-specific files:

### `railway.json`
Configures the build and deployment process:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### `nixpacks.toml`
Specifies build phases and dependencies:
```toml
[phases.setup]
nixPkgs = ["nodejs_20", "npm"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

### `.railwayignore`
Excludes unnecessary files from deployment.

## Troubleshooting

### Build Fails with "Missing publishableKey"

**Cause:** Environment variables not set in Railway.

**Solution:** 
1. Go to Railway Variables tab
2. Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
3. Trigger a new deployment

### "Module not found" errors

**Cause:** Dependencies not installed correctly.

**Solution:**
1. Check that `package.json` is in the repository root
2. Railway should run `npm ci` automatically
3. Check build logs in Railway dashboard

### Application crashes on startup

**Cause:** Missing required environment variables or configuration errors.

**Solution:**
1. Check Railway logs for specific error messages
2. Verify all required environment variables are set
3. Ensure Firebase and Clerk credentials are valid

### 502 Bad Gateway

**Cause:** Application failed to start on the assigned port.

**Solution:**
- Next.js automatically uses Railway's `PORT` environment variable
- No manual configuration needed
- Check logs for startup errors

## Monitoring

### View Logs
1. Go to Railway dashboard
2. Click on your service
3. Navigate to **Deployments** tab
4. Click on active deployment to view logs

### Metrics
Railway automatically provides:
- CPU usage
- Memory usage
- Network traffic
- Request counts

## Continuous Deployment

Railway automatically redeploys when you:
1. Push to the main branch (or configured branch)
2. Can configure different branches for different environments

### Configure Branch
1. Go to Railway dashboard → **Settings**
2. Under **Source**, select branch
3. Save changes

## Scaling

### Vertical Scaling
1. Go to Railway dashboard → **Settings**
2. Adjust **Resources** allocation
3. Available on paid plans

### Environment Variables per Environment
You can create multiple environments (dev, staging, production):
1. Click **New Environment** in Railway dashboard
2. Configure different variables for each environment
3. Deploy from different branches

## Cost Optimization

1. **Free Tier:** Railway provides $5 free credit per month
2. **Starter Plan:** $5/month for additional resources
3. **Pro Plan:** Pay-as-you-go for production workloads

### Tips to Reduce Costs:
- Use environment-based scaling
- Optimize build times by caching dependencies
- Use Railway's sleep feature for non-production environments

## Security Best Practices

1. **Never commit `.env` files** - Use Railway's environment variables
2. **Rotate secrets regularly** - Update API keys periodically
3. **Use Railway's secret scanner** - Automatically detects exposed secrets
4. **Enable HTTPS** - Railway provides SSL certificates automatically
5. **Restrict CORS** - Configure allowed origins in your app

## Support

- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway Status Page](https://status.railway.app)

## Additional Resources

- [Next.js on Railway](https://docs.railway.app/guides/nextjs)
- [Environment Variables](https://docs.railway.app/develop/variables)
- [Domains](https://docs.railway.app/deploy/exposing-your-app)
- [CLI Usage](https://docs.railway.app/develop/cli)
