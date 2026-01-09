# Quick Setup Guide

## Local Development Setup

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd ghosthunter
npm install
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

**Required Variables:**
```bash
# Clerk Authentication - Get from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Firebase - Get from https://console.firebase.google.com
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Validate Environment
```bash
npm run validate-env
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Railway Deployment

### Quick Deploy to Railway

1. **Sign up/Login to Railway:** https://railway.app

2. **New Project from GitHub:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose this repository
   - Railway auto-detects Next.js

3. **Set Environment Variables:**
   
   Go to project → **Variables** tab and add:

   ```bash
   # Required
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
   CLERK_SECRET_KEY=sk_live_xxxxx
   NEXT_PUBLIC_CLERK_WEBHOOK_SECRET=whsec_xxxxx
   
   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=xxxxx
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxx
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxx
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxx
   NEXT_PUBLIC_FIREBASE_APP_ID=xxxxx
   
   # Firebase Admin
   FIREBASE_PROJECT_ID=xxxxx
   FIREBASE_CLIENT_EMAIL=xxxxx
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   
   # GitHub (Optional)
   GITHUB_CLIENT_ID=xxxxx
   GITHUB_CLIENT_SECRET=xxxxx
   
   # Application
   NEXT_PUBLIC_APP_URL=https://your-app.up.railway.app
   NODE_ENV=production
   ```

4. **Deploy:**
   - Railway automatically builds and deploys
   - Get your domain from Settings → Domains

5. **Post-Deployment:**
   - Update Clerk allowed origins with your Railway domain
   - Update GitHub OAuth callback URLs
   - Update Firebase authorized domains

📖 **Full Guide:** See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)

---

## Build Commands

```bash
# Development
npm run dev                # Start dev server

# Production Build
npm run build             # Build for production
npm run start             # Start production server

# Code Quality
npm run lint              # Run ESLint
npm run lint:fix          # Fix linting issues
npm run type-check        # TypeScript type checking
npm run validate-env      # Validate environment variables
```

---

## Environment Variables Reference

### Required for Authentication
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key

### Required for Database
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID

### Optional Features
- `GITHUB_CLIENT_ID` - GitHub OAuth (for Code Police)
- `GITHUB_CLIENT_SECRET` - GitHub OAuth secret
- `GOOGLE_API_KEY` - Gemini AI (for Database Agent)
- `RESEND_API_KEY` - Email notifications
- `NEXT_PUBLIC_SEPOLIA_RPC_URL` - Blockchain features
- `NEXT_PUBLIC_EQUITY_TOKEN_ADDRESS` - Token contract address

---

## Troubleshooting

### Build fails with "Missing publishableKey"
✅ **Solution:** Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in environment variables

### Module not found errors
✅ **Solution:** Run `npm ci` to clean install dependencies

### Firebase errors
✅ **Solution:** Verify Firebase credentials and project ID

### Railway deployment fails
✅ **Solution:** Check Railway logs for specific errors. Ensure all required env vars are set.

---

## Support & Documentation

- 📚 [Full Railway Deployment Guide](./RAILWAY_DEPLOYMENT.md)
- 🔧 [Code Police Setup](./CODE_POLICE_README.md)
- 💾 [Database Agent Guide](./DATABASE_AGENT_README.md)
- 💰 [Equity Distribution](./EQUITY_DISTRIBUTION_README.md)

---

## Project Structure

```
ghosthunter/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard pages
│   │   └── layout.tsx    # Root layout
│   ├── components/       # React components
│   ├── lib/              # Utilities and helpers
│   └── types/            # TypeScript types
├── scripts/              # Build scripts
│   └── validate-env.js   # Environment validation
├── .env.example          # Environment template
├── railway.json          # Railway config
├── nixpacks.toml         # Build config
└── package.json          # Dependencies

```

---

## License

MIT License - See LICENSE file for details
