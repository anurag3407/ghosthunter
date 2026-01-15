<div align="center">

# 🚀 GhostFounder

### Build Startups at Warp Speed

**The All-in-One AI-Powered Platform for Modern Startup Teams**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-12.7-FFCA28?logo=firebase)](https://firebase.google.com)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-3C3C3D?logo=ethereum)](https://ethereum.org)
[![Deploy on Railway](https://img.shields.io/badge/Deploy-Railway-0B0D0E?logo=railway)](https://railway.app/new)

[🌐 Live Demo](https://ghostfounder.up.railway.app) • [📖 Documentation](#-documentation) • [🚀 Quick Start](#-quick-start) • [🤝 Contributing](#-contributing)

</div>

---

## 🎯 Overview

**GhostFounder** is a comprehensive startup toolkit that combines AI-powered automation with blockchain technology to help founders move fast. Whether you're building an MVP, preparing for fundraising, or scaling your team, GhostFounder has you covered.

### Why GhostFounder?

| Challenge | GhostFounder Solution |
|-----------|----------------------|
| Code quality at speed | 🛡️ **Code Police** - Automated AI code reviews on every commit |
| Investor-ready decks | 📊 **Pitch Deck Studio** - Generate professional decks from README |
| Equity management | 💰 **Equity Distribution** - Blockchain-based token management |
| Database complexity | 💾 **Database Agent** - Natural language database queries |

---

## ✨ Features

### 🛡️ Code Police
> AI-Powered Code Review System

- **Automated Analysis**: Reviews code on every push and PR
- **Multi-Category Detection**: Security, performance, bugs, readability, style
- **Severity Classification**: Critical, high, medium, low, info
- **Email Reports**: Professional HTML reports with actionable insights
- **GitHub Integration**: Webhook-based real-time automation

📖 [Full Documentation](./CODE_POLICE_README.md) | [Quick Reference](./CODE_POLICE_QUICK_REFERENCE.md)

### 📊 Pitch Deck Studio
> AI-Powered Presentation Generator

- **GitHub-to-Deck**: Generates investor-grade decks from your README
- **Multiple Templates**: Pre-seed, Seed, Series A, Demo Day styles
- **Visual Editor**: Drag-and-drop slide canvas with real-time preview
- **AI Content**: Generates headlines, bullets, metrics from your project
- **Export Options**: PDF and image export capabilities
- **Gap Analysis**: Identifies missing slides and content improvements

📖 [Full Documentation](./PITCH_DECK_README.md)

### 💰 Equity Distribution
> Blockchain-Based Token Management

- **ERC-20 Tokens**: Custom equity tokens on Ethereum Sepolia
- **Percentage Transfers**: Simple percentage-based equity distribution
- **MetaMask Integration**: Seamless Web3 wallet connection
- **Real-Time Tracking**: Monitor balances and ownership percentages
- **Cap Table**: Transparent, on-chain ownership records

📖 [Full Documentation](./EQUITY_DISTRIBUTION_README.md)

### 💾 Database Agent
> Natural Language Database Interface

- **Multi-Database Support**: PostgreSQL, MySQL, MongoDB
- **AI Query Generation**: Natural language to SQL/NoSQL
- **Security First**: AES-256 encrypted credentials
- **Query Explanation**: Understand what each query does
- **Safe Execution**: Read-only queries with validation

📖 [Full Documentation](./DATABASE_AGENT_README.md) | [Quick Reference](./DATABASE_AGENT_QUICK_REFERENCE.md)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **Git** for version control

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/ghostfounder.git
cd ghostfounder

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Validate configuration
npm run validate-env

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

**Quick Steps:**
1. Click the Deploy button above
2. Connect your GitHub account
3. Add required environment variables
4. Deploy automatically!

📖 **Full Guide**: [Railway Deployment](./RAILWAY_DEPLOYMENT.md) | [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="25%">

### Frontend
![Next.js](https://img.shields.io/badge/-Next.js-000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/-React_19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/-Tailwind_4-38B2AC?logo=tailwind-css&logoColor=white)

</td>
<td align="center" width="25%">

### Backend
![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white)
![Firebase](https://img.shields.io/badge/-Firebase-FFCA28?logo=firebase&logoColor=black)
![LangChain](https://img.shields.io/badge/-LangChain-1C3C3C?logo=langchain&logoColor=white)

</td>
<td align="center" width="25%">

### AI/ML
![Gemini](https://img.shields.io/badge/-Gemini_2.0-4285F4?logo=google&logoColor=white)
![LangChain](https://img.shields.io/badge/-LangChain-1C3C3C?logo=langchain&logoColor=white)

</td>
<td align="center" width="25%">

### Blockchain
![Ethereum](https://img.shields.io/badge/-Ethereum-3C3C3D?logo=ethereum&logoColor=white)
![Ethers.js](https://img.shields.io/badge/-Ethers.js-2535A0?logo=ethereum&logoColor=white)
![Hardhat](https://img.shields.io/badge/-Hardhat-FFF100?logo=hardhat&logoColor=black)

</td>
</tr>
</table>

### Complete Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16.1 (App Router), React 19 |
| **Language** | TypeScript 5.x |
| **Authentication** | Clerk |
| **Database** | Firebase Firestore |
| **Blockchain** | Ethereum Sepolia, ethers.js, Hardhat |
| **AI/ML** | Google Gemini 2.0 Flash, LangChain |
| **Styling** | Tailwind CSS 4.0, Framer Motion |
| **UI Components** | Radix UI, Lucide Icons |
| **Email** | Resend |
| **Deployment** | Railway, Netlify |

---

## 📋 Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Build for production (validates env first)
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix linting issues
npm run type-check       # TypeScript type checking
npm run validate-env     # Validate environment variables

# Smart Contracts (optional)
npx hardhat compile      # Compile Solidity contracts
npx hardhat test         # Run contract tests
npx hardhat run scripts/deploy.js --network sepolia  # Deploy to Sepolia
```

---

## 🔐 Environment Variables

### Required Variables

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx

# Firebase (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxx

# Firebase Admin (Server)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### Optional Variables

```bash
# GitHub Integration (Code Police)
GITHUB_CLIENT_ID=Iv1.xxxxx
GITHUB_CLIENT_SECRET=xxxxx
GITHUB_WEBHOOK_SECRET=xxxxx

# AI Services
GOOGLE_API_KEY=AIza...

# Email (Resend)
RESEND_API_KEY=re_xxxxx

# Blockchain (Equity Distribution)
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-key
NEXT_PUBLIC_EQUITY_TOKEN_ADDRESS=0x...
SEPOLIA_PRIVATE_KEY=xxxxx

# Application
NEXT_PUBLIC_APP_URL=https://your-app.up.railway.app
NODE_ENV=production
```

See [.env.example](./.env.example) for the complete template.

---

## 🏗️ Project Structure

```
ghostfounder/
├── 📂 src/
│   ├── 📂 app/                    # Next.js App Router
│   │   ├── 📂 api/                # API Routes
│   │   │   ├── 📂 auth/           # Authentication endpoints
│   │   │   ├── 📂 code-police/    # Code review API
│   │   │   ├── 📂 database/       # Database agent API
│   │   │   ├── 📂 equity/         # Blockchain API
│   │   │   ├── 📂 pitch-deck/     # Deck generation API
│   │   │   └── 📂 webhooks/       # GitHub webhooks
│   │   ├── 📂 dashboard/          # Protected dashboard pages
│   │   │   ├── 📂 code-police/    # Code review UI
│   │   │   ├── 📂 database/       # Database agent UI
│   │   │   ├── 📂 equity/         # Equity management UI
│   │   │   └── 📂 pitch-deck/     # Deck editor UI
│   │   ├── 📄 layout.tsx          # Root layout
│   │   └── 📄 page.tsx            # Landing page
│   ├── 📂 components/             # React components
│   │   ├── 📂 code-police/        # Code review components
│   │   ├── 📂 equity/             # Blockchain components
│   │   ├── 📂 pitch-deck/         # Deck editor components
│   │   └── 📂 ui/                 # Shared UI components
│   ├── 📂 lib/                    # Utilities and services
│   │   ├── 📂 agents/             # AI agent implementations
│   │   ├── 📂 db/                 # Database utilities
│   │   ├── 📂 firebase/           # Firebase configuration
│   │   └── 📂 pitch-deck/         # Deck generation logic
│   └── 📂 types/                  # TypeScript definitions
├── 📂 contracts/                  # Solidity smart contracts
│   └── 📄 EquityToken.sol         # ERC-20 equity token
├── 📂 scripts/                    # Build and deploy scripts
│   ├── 📄 deploy.js               # Contract deployment
│   └── 📄 validate-env.js         # Environment validation
├── 📂 public/                     # Static assets
├── 📄 firebase.json               # Firebase configuration
├── 📄 firestore.rules             # Firestore security rules
├── 📄 hardhat.config.js           # Hardhat configuration
├── 📄 railway.json                # Railway deployment config
└── 📄 package.json                # Dependencies
```

---

## 📚 Documentation

### Getting Started
- 📘 [Setup Guide](./SETUP.md) - Complete local setup instructions
- 🚀 [Railway Deployment](./RAILWAY_DEPLOYMENT.md) - Production deployment
- ✅ [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Pre-deployment checks

### Feature Guides
- 🛡️ [Code Police](./CODE_POLICE_README.md) - AI code review system
- 🛡️ [Code Police Quick Reference](./CODE_POLICE_QUICK_REFERENCE.md) - Quick setup guide
- 📊 [Pitch Deck Studio](./PITCH_DECK_README.md) - Deck generator documentation
- 💰 [Equity Distribution](./EQUITY_DISTRIBUTION_README.md) - Blockchain equity system
- 💾 [Database Agent](./DATABASE_AGENT_README.md) - Natural language queries
- 💾 [Database Agent Technical Guide](./DATABASE_AGENT_TECHNICAL_GUIDE.md) - Deep dive

### Architecture
- 🏗️ [Architecture Overview](./ARCHITECTURE.md) - System design and patterns
- 🔌 [API Reference](./API_REFERENCE.md) - Complete API documentation
- 🤖 [AI Model Reference](./AI_MODEL_REFERENCE.md) - AI/ML implementation details

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Quick Contribution Steps

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/amazing-feature

# 3. Make your changes
# 4. Run tests and linting
npm run lint && npm run type-check

# 5. Commit your changes
git commit -m "feat: add amazing feature"

# 6. Push to your fork
git push origin feature/amazing-feature

# 7. Open a Pull Request
```

### Development Guidelines

- Follow [Conventional Commits](https://www.conventionalcommits.org/)
- Write TypeScript with strict mode
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## 🆘 Support

- 🐛 **Bug Reports**: [GitHub Issues](../../issues)
- 💬 **Discussions**: [GitHub Discussions](../../discussions)
- 📧 **Email**: support@ghostfounder.com
- 📖 **Documentation**: See docs in this repository

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - The React framework
- [Clerk](https://clerk.com) - Authentication & user management
- [Firebase](https://firebase.google.com) - Backend-as-a-service
- [LangChain](https://langchain.com) - AI application framework
- [Google Gemini](https://ai.google.dev/) - AI language model
- [Railway](https://railway.app) - Deployment platform

---

<div align="center">

**Built with ❤️ for founders who move fast**

[⬆ Back to top](#-ghostfounder)

</div>
