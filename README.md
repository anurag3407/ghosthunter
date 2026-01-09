# GhostFounder - Build Startups at Warp Speed 🚀

AI-powered platform for startups featuring Code Police, Pitch Deck Generator, Equity Distribution, and Database Agent.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

## ✨ Features

- **🛡️ Code Police**: AI-powered code review and quality checks for your GitHub repositories
- **📊 Pitch Deck Generator**: Create professional pitch decks with AI assistance
- **💰 Equity Distribution**: Blockchain-based equity token management
- **💾 Database Agent**: AI-powered database operations and management

## 🚀 Quick Start

### Local Development

1. **Clone and Install**
```bash
git clone <your-repo-url>
cd ghosthunter
npm install
```

2. **Setup Environment**
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

3. **Validate Configuration**
```bash
npm run validate-env
```

4. **Run Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

**Quick Steps:**
1. Sign up at [Railway](https://railway.app)
2. Connect your GitHub repository
3. Add environment variables (see [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md))
4. Deploy automatically!

📖 **Full Guide**: [Railway Deployment Documentation](./RAILWAY_DEPLOYMENT.md)

## 📚 Documentation

- **[Setup Guide](./SETUP.md)** - Complete setup instructions
- **[Railway Deployment](./RAILWAY_DEPLOYMENT.md)** - Production deployment guide
- **[Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist
- **[Code Police](./CODE_POLICE_README.md)** - Code review feature docs
- **[Database Agent](./DATABASE_AGENT_README.md)** - Database management docs
- **[Equity Distribution](./EQUITY_DISTRIBUTION_README.md)** - Blockchain equity docs

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Authentication**: Clerk
- **Database**: Firebase Firestore
- **Blockchain**: Ethereum (Sepolia Testnet)
- **AI**: Google Gemini
- **Styling**: Tailwind CSS
- **Deployment**: Railway

## 📋 Available Scripts

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run lint:fix      # Fix linting issues
npm run type-check    # TypeScript type checking
npm run validate-env  # Validate environment variables
```

## 🔐 Environment Variables

Required environment variables:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxx
# ... see .env.example for full list
```

See [.env.example](./.env.example) for complete list.

## 🏗️ Project Structure

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
├── contracts/            # Smart contracts
├── public/              # Static assets
└── package.json         # Dependencies
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

- **Issues**: [GitHub Issues](../../issues)
- **Documentation**: See docs folder
- **Email**: support@ghostfounder.com

## 🔗 Links

- [Live Demo](https://ghostfounder.up.railway.app) (if deployed)
- [Documentation](./SETUP.md)
- [Deployment Guide](./RAILWAY_DEPLOYMENT.md)

---

Built with ❤️ using Next.js and AI
