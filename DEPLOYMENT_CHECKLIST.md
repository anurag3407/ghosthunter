# Pre-Deployment Checklist

Use this checklist before deploying to Railway or any production environment.

## ✅ Environment Configuration

### Clerk Authentication
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` set (starts with `pk_live_` for production)
- [ ] `CLERK_SECRET_KEY` set (starts with `sk_live_` for production)
- [ ] `CLERK_WEBHOOK_SECRET` set (starts with `whsec_`)
- [ ] Clerk Dashboard: Added production domain to Allowed Origins
- [ ] Clerk Dashboard: Updated redirect URLs with production domain

### Firebase
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` set
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` set
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID` set
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` set
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` set
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID` set
- [ ] `FIREBASE_PROJECT_ID` set (server-side)
- [ ] `FIREBASE_CLIENT_EMAIL` set (server-side)
- [ ] `FIREBASE_PRIVATE_KEY` set (server-side, properly escaped)
- [ ] Firebase Console: Added production domain to Authorized domains
- [ ] Firebase Console: Configured Firestore security rules
- [ ] Firebase Console: Set up Firestore indexes

### Application Settings
- [ ] `NEXT_PUBLIC_APP_URL` set to production URL
- [ ] `NODE_ENV` set to `production`

### Optional Services
- [ ] GitHub OAuth configured (if using Code Police)
  - [ ] `GITHUB_CLIENT_ID` set
  - [ ] `GITHUB_CLIENT_SECRET` set
  - [ ] Updated callback URL in GitHub OAuth settings
- [ ] Google Gemini API (if using Database Agent)
  - [ ] `GOOGLE_API_KEY` set
- [ ] Email service (if using notifications)
  - [ ] `RESEND_API_KEY` set
- [ ] Blockchain (if using Equity features)
  - [ ] `NEXT_PUBLIC_SEPOLIA_RPC_URL` set
  - [ ] `NEXT_PUBLIC_EQUITY_TOKEN_ADDRESS` set
  - [ ] `SEPOLIA_PRIVATE_KEY` set (keep secure!)

## ✅ Code Quality

- [ ] All TypeScript errors resolved: `npm run type-check`
- [ ] ESLint passes: `npm run lint`
- [ ] Local build successful: `npm run build`
- [ ] Environment validation passes: `npm run validate-env`

## ✅ Railway Configuration

- [ ] Repository connected to Railway
- [ ] All environment variables set in Railway dashboard
- [ ] Build command configured: `npm run build`
- [ ] Start command configured: `npm start`
- [ ] Domain configured (Railway subdomain or custom domain)

## ✅ Third-Party Service Updates

### Clerk
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to: **Configure** → **Allowed Origins**
3. Add production domain
4. Navigate to: **Configure** → **Redirect URLs**
5. Add production callback URLs

### GitHub OAuth App
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Select your OAuth App
3. Update **Homepage URL** to production domain
4. Update **Authorization callback URL** to: `https://your-domain.com/api/auth/callback/github`

### Firebase
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to: **Authentication** → **Settings** → **Authorized domains**
4. Add production domain
5. Navigate to: **Firestore** → **Rules**
6. Ensure production-ready security rules are deployed

## ✅ Security Review

- [ ] No `.env` files committed to repository
- [ ] All secrets stored securely in Railway environment variables
- [ ] Firebase security rules reviewed and tested
- [ ] CORS configured properly
- [ ] API rate limiting implemented (if applicable)
- [ ] Webhook secrets configured
- [ ] Service account keys never exposed in client-side code

## ✅ Testing

- [ ] Authentication flow tested
- [ ] All main features work in production
- [ ] Database connections verified
- [ ] API endpoints responding correctly
- [ ] Error pages display properly
- [ ] Redirects work as expected

## ✅ Monitoring & Observability

- [ ] Railway deployment logs reviewed
- [ ] Error tracking configured (optional: Sentry, LogRocket)
- [ ] Performance monitoring enabled
- [ ] Database query performance acceptable

## ✅ Documentation

- [ ] README updated with deployment instructions
- [ ] Environment variables documented
- [ ] API endpoints documented (if applicable)
- [ ] Known issues documented

## 🚀 Ready to Deploy!

Once all items are checked:

1. **Commit and push** your code to the main branch
2. **Railway auto-deploys** from GitHub
3. **Monitor logs** in Railway dashboard
4. **Test production** deployment thoroughly
5. **Rollback** if issues detected (Railway makes this easy)

## Post-Deployment Verification

After deployment, verify:

```bash
# Check homepage loads
curl https://your-domain.com

# Check API health (if you have a health endpoint)
curl https://your-domain.com/api/health

# Check authentication redirects work
# Visit: https://your-domain.com/dashboard
# Should redirect to Clerk sign-in if not authenticated
```

## Rollback Plan

If issues occur:

1. **Railway Dashboard** → **Deployments**
2. Click on a previous successful deployment
3. Click **"Redeploy"**
4. Monitor logs for successful rollback

## Support

- Railway: https://docs.railway.app
- Clerk: https://clerk.com/docs
- Firebase: https://firebase.google.com/docs
- Next.js: https://nextjs.org/docs

---

**Last Updated:** January 2026
