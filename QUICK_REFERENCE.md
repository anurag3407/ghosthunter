# 🚀 Quick Reference Card

## Essential Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run validate-env     # Check environment variables
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Auto-fix linting issues
npm run type-check      # TypeScript validation
```

## Environment Setup

```bash
# First time setup
cp .env.example .env.local
# Edit .env.local with your keys
npm run validate-env
npm run dev
```

## Railway Deployment

```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy to Railway"
git push origin main

# 2. Deploy on Railway
# - Go to railway.app
# - Connect GitHub repo
# - Add environment variables
# - Deploy automatically

# 3. Check deployment
curl https://your-app.up.railway.app/api/health
```

## Required Environment Variables

**Minimum to run:**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxxxx
CLERK_SECRET_KEY=sk_xxxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxxx
```

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Missing publishableKey | Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` to .env.local |
| Build fails | Run `npm run validate-env` |
| Module not found | Run `npm ci` |
| Port in use | Kill process on port 3000 or use different port |
| Firebase errors | Check Firebase credentials in .env.local |

## Useful URLs

- **Railway Dashboard**: https://railway.app
- **Clerk Dashboard**: https://dashboard.clerk.com
- **Firebase Console**: https://console.firebase.google.com
- **GitHub Settings**: https://github.com/settings/developers

## Health Check

```bash
# Local
curl http://localhost:3000/api/health

# Production
curl https://your-app.up.railway.app/api/health
```

## File Structure

```
ghosthunter/
├── src/app/              # Next.js pages & API
├── src/components/       # React components
├── src/lib/             # Utilities
├── scripts/             # Build scripts
├── .env.example         # Environment template
└── railway.json         # Railway config
```

## Documentation

- 📖 [Full Setup Guide](./SETUP.md)
- 🚂 [Railway Deployment](./RAILWAY_DEPLOYMENT.md)
- ✅ [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- 📋 [Deployment Summary](./DEPLOYMENT_SUMMARY.md)

---

**Tip**: Keep this file handy for quick reference!
