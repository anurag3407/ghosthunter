# 🪙 Equity Distribution - Comprehensive Documentation

> Blockchain-Based Equity Token Management & Distribution System

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Technology Stack](#technology-stack)
5. [File Structure](#file-structure)
6. [Data Models](#data-models)
7. [Smart Contract Integration](#smart-contract-integration)
8. [API Routes](#api-routes)
9. [User Flows](#user-flows)
10. [Wallet Integration](#wallet-integration)
11. [Security & Best Practices](#security--best-practices)
12. [Setup & Configuration](#setup--configuration)
13. [Usage Examples](#usage-examples)
14. [Troubleshooting](#troubleshooting)
15. [Future Enhancements](#future-enhancements)

---

## 🎯 Overview

**Equity Distribution** is a blockchain-based token management system that enables startups and projects to create, manage, and distribute equity tokens to team members, investors, and contributors. Built on Ethereum's Sepolia testnet, it provides an intuitive interface for managing ownership stakes through ERC-20 tokens.

### Key Capabilities

- **Token Creation**: Mint custom ERC-20 equity tokens on Sepolia testnet
- **Percentage-Based Transfers**: Transfer tokens by percentage, not complex wei amounts
- **Wallet Integration**: Seamless MetaMask connection with Web3 support
- **Real-Time Balance Tracking**: Monitor token balances and ownership percentages
- **Blockchain Verification**: All transactions verifiable on Etherscan
- **Multi-Project Support**: Manage multiple equity projects from one dashboard
- **User-Friendly Interface**: Simplified UX for non-technical founders

### Use Cases

1. **Startup Equity**: Distribute ownership tokens to co-founders and early team members
2. **Investor Relations**: Issue tokens to seed investors and angel backers
3. **Contributor Rewards**: Allocate equity to advisors, contractors, and contributors
4. **Cap Table Management**: Maintain transparent, on-chain cap table
5. **Vesting Simulation**: Test equity distribution strategies on testnet before mainnet

---

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                             │
│  ┌──────────────┐        ┌──────────────┐                  │
│  │  Dashboard   │        │  MetaMask    │                  │
│  │  UI (React)  │◄──────►│  Wallet      │                  │
│  └──────┬───────┘        └──────┬───────┘                  │
│         │                       │                           │
│         └───────────┬───────────┘                           │
└─────────────────────┼─────────────────────────────────────┘
                      │ HTTPS/Web3
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               NEXT.JS APPLICATION                           │
│  ┌───────────────────────────────────────────────────┐     │
│  │  Frontend Components                             │     │
│  │  - WalletProvider (Context)                      │     │
│  │  - Equity Dashboard (/dashboard/equity)          │     │
│  │  - Project Creation (/dashboard/equity/new)      │     │
│  │  - Project Detail (/dashboard/equity/[id])       │     │
│  └────────────────────┬──────────────────────────────┘     │
│                       ▼                                     │
│  ┌───────────────────────────────────────────────────┐     │
│  │  API Routes                                      │     │
│  │  - GET  /api/equity/projects (List projects)     │     │
│  │  - POST /api/equity/projects (Create project)    │     │
│  └────────────────────┬──────────────────────────────┘     │
│                       ▼                                     │
│  ┌───────────────────────────────────────────────────┐     │
│  │  Firestore Database                              │     │
│  │  Collection: equity_projects                     │     │
│  │  - Project metadata                              │     │
│  │  - Contract addresses                            │     │
│  │  - User associations                             │     │
│  └───────────────────────────────────────────────────┘     │
└─────────────────────┼─────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│            ETHEREUM SEPOLIA TESTNET                         │
│  ┌───────────────────────────────────────────────────┐     │
│  │  Smart Contract (ERC-20)                         │     │
│  │                                                   │     │
│  │  ┌─────────────────────────────────────────┐     │     │
│  │  │ State Variables:                        │     │     │
│  │  │ - name: "Equity Token"                  │     │     │
│  │  │ - symbol: "EQT"                         │     │     │
│  │  │ - totalSupply: 1,000,000                │     │     │
│  │  │ - balances: mapping(address => uint)    │     │     │
│  │  │ - hasUserMinted: mapping(address=>bool) │     │     │
│  │  └─────────────────────────────────────────┘     │     │
│  │                                                   │     │
│  │  ┌─────────────────────────────────────────┐     │     │
│  │  │ Functions:                              │     │     │
│  │  │ - mintInitialTokens()                   │     │     │
│  │  │ - transfer(address, uint)               │     │     │
│  │  │ - transferPercent(address, uint)        │     │     │
│  │  │ - balanceOf(address)                    │     │     │
│  │  │ - getDisplayBalance(address)            │     │     │
│  │  │ - calculatePercentageAmount(...)        │     │     │
│  │  └─────────────────────────────────────────┘     │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │  Etherscan Block Explorer                        │     │
│  │  - Transaction verification                      │     │
│  │  - Contract source viewing                       │     │
│  └───────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                      ▲
                      │ Web3 Provider (ethers.js)
                      │
┌─────────────────────────────────────────────────────────────┐
│                    METAMASK WALLET                          │
│  - Private key management                                   │
│  - Transaction signing                                      │
│  - Network switching                                        │
└─────────────────────────────────────────────────────────────┘
```

### Component Flow Diagram

```
User Visits Dashboard → Check Wallet Status
                              ↓
                        No Wallet Connected
                              ↓
                    Click "Connect Wallet"
                              ↓
                    MetaMask Popup Opens
                              ↓
                    User Approves Connection
                              ↓
                    ┌──────────────────┐
                    │  Wallet Connected│
                    │  Network Check   │
                    └──────────────────┘
                              ↓
                    Not on Sepolia? → Switch Network
                              ↓
                    On Sepolia Testnet
                              ↓
        ┌─────────────────────┴─────────────────────┐
        │                                           │
   View Projects                            Create New Project
        │                                           │
        ▼                                           ▼
  Fetch from Firestore                  Enter Project Details
        │                                           │
        ▼                                           ▼
  Display Project Cards                    Mint Initial Tokens
        │                                           │
        ▼                                           ▼
  Click Project                         Sign Transaction in MetaMask
        │                                           │
        ▼                                           ▼
  Project Detail View                   Wait for Confirmation
        │                                           │
        ▼                                           ▼
  View Balance & Stats                  Save to Firestore
        │                                           │
        ▼                                           ▼
  Enter Transfer Details                Redirect to Dashboard
        │
        ▼
  Calculate Token Amount
        │
        ▼
  Sign Transfer Transaction
        │
        ▼
  Wait for Confirmation
        │
        ▼
  Update Balance Display
        │
        ▼
  View on Etherscan
```

---

## ✨ Features

### 1. Project Management

#### Dashboard Overview
- **Project List**: View all equity projects associated with your account
- **Quick Stats**: Total supply, contract address, creation date
- **Search & Filter**: Find projects quickly (future enhancement)
- **Etherscan Links**: Direct links to contract verification

#### Project Creation
- **Custom Naming**: Name your equity token and set a symbol
- **Automatic Minting**: Initial mint of 1,000,000 tokens
- **One-Time Mint**: Prevents duplicate minting per wallet
- **Instant Deployment**: No manual contract deployment needed

### 2. Token Distribution

#### Percentage-Based Transfers
```
Example:
Your Balance: 1,000,000 tokens (100%)
Transfer 10% to Co-founder → 100,000 tokens
Remaining Balance: 900,000 tokens (90%)
```

#### Smart Transfer Interface
- **Address Validation**: Ethereum address format checking
- **Percentage Slider**: Visual percentage selection (1-100%)
- **Amount Preview**: See exact token amount before transfer
- **Ownership Calculator**: Real-time ownership percentage display

### 3. Wallet Integration

#### MetaMask Connection
- **One-Click Connect**: Seamless wallet connection
- **Account Display**: Truncated address display (0x1234...5678)
- **Network Detection**: Automatic network validation
- **Network Switching**: One-click switch to Sepolia

#### Multi-Network Support
- **Primary**: Sepolia Testnet (Chain ID: 11155111)
- **Auto-Add Network**: Automatically add Sepolia if not configured
- **Network Warnings**: Clear alerts when on wrong network

### 4. Real-Time Data

#### Balance Tracking
- **Live Updates**: Balance refreshes after each transaction
- **Ownership Percentage**: Auto-calculated ownership stake
- **Total Supply Display**: Always shows 1,000,000 total tokens

#### Transaction Status
- **Pending Indicators**: Loading states during blockchain confirmation
- **Success Notifications**: Green alerts with transaction hash
- **Error Handling**: Detailed error messages with troubleshooting hints
- **Etherscan Integration**: View full transaction details

---

## 🛠️ Technology Stack

### Frontend

| Technology | Purpose | Version |
|-----------|---------|---------|
| **Next.js** | React framework with SSR | 14.x |
| **React** | UI library | 18.x |
| **TypeScript** | Type safety | 5.x |
| **Tailwind CSS** | Styling framework | 3.x |
| **Lucide Icons** | Icon library | Latest |

### Blockchain

| Technology | Purpose | Details |
|-----------|---------|---------|
| **ethers.js** | Ethereum library | v6.x |
| **Solidity** | Smart contract language | 0.8.x (implied) |
| **Sepolia Testnet** | Test blockchain | Ethereum L1 testnet |
| **MetaMask** | Wallet provider | Browser extension |

### Backend

| Technology | Purpose | Details |
|-----------|---------|---------|
| **Firestore** | NoSQL database | Google Cloud |
| **Clerk** | Authentication | User management |
| **Next.js API Routes** | REST API | Serverless functions |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **PostCSS** | CSS processing |
| **TypeScript Compiler** | Type checking |

---

## 📁 File Structure

```
src/
├── app/
│   ├── api/
│   │   └── equity/
│   │       └── projects/
│   │           └── route.ts                 # API: List & create projects
│   │
│   └── dashboard/
│       └── equity/
│           ├── page.tsx                     # Main equity dashboard
│           ├── new/
│           │   └── page.tsx                 # Create new project
│           └── [id]/
│               └── page.tsx                 # Project detail & transfer
│
├── components/
│   └── providers/
│       └── wallet-provider.tsx              # Wallet context & MetaMask
│
└── lib/
    └── agents/
        └── equity/
            ├── index.ts                     # Module exports
            └── contract.ts                  # Smart contract interface
```

### File Descriptions

#### `route.ts` - API Routes
```typescript
/**
 * Handles CRUD operations for equity projects
 * - GET: Fetch user's projects from Firestore
 * - POST: Create new project record
 */
```

#### `page.tsx` (Dashboard)
```typescript
/**
 * Main equity dashboard
 * - Displays all user projects
 * - Wallet connection status
 * - Create new project button
 */
```

#### `page.tsx` (New Project)
```typescript
/**
 * Project creation interface
 * - Mints initial 1,000,000 tokens
 * - Saves project metadata to Firestore
 * - Prevents duplicate minting
 */
```

#### `page.tsx` (Project Detail)
```typescript
/**
 * Individual project management
 * - View balance & ownership
 * - Transfer tokens by percentage
 * - Real-time transaction status
 */
```

#### `wallet-provider.tsx`
```typescript
/**
 * React Context for wallet state
 * - MetaMask connection management
 * - Network switching logic
 * - Global wallet state
 */
```

#### `contract.ts`
```typescript
/**
 * Ethereum smart contract interface
 * - ABI definitions
 * - Contract interaction functions
 * - Web3 utility methods
 */
```

---

## 📊 Data Models

### Firestore Schema

#### Collection: `equity_projects`

```typescript
interface EquityProject {
  id: string;                    // Firestore document ID
  userId: string;                // Clerk user ID
  name: string;                  // Project name (e.g., "My Startup")
  symbol: string;                // Token symbol (e.g., "MYCO")
  contractAddress: string;       // Ethereum contract address
  totalSupply: string;           // Total token supply (e.g., "1000000")
  createdAt: Timestamp;          // Creation timestamp
  updatedAt: Timestamp;          // Last update timestamp
}
```

**Example Document:**
```json
{
  "id": "abc123",
  "userId": "user_2XYZ...",
  "name": "TechStartup Inc.",
  "symbol": "TECH",
  "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "totalSupply": "1000000",
  "createdAt": "2026-01-05T10:30:00Z",
  "updatedAt": "2026-01-05T10:30:00Z"
}
```

### Smart Contract State

#### On-Chain Data Structure

```solidity
contract EquityToken {
    // Standard ERC-20 state
    string public name;                                  // "Equity Token"
    string public symbol;                                // "EQT"
    uint256 public totalSupply;                          // 1,000,000 * 10^18
    uint8 public decimals;                               // 18
    
    // Custom state
    mapping(address => uint256) private balances;        // User balances
    mapping(address => bool) public hasUserMinted;       // Mint tracking
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
}
```

---

## 🔗 Smart Contract Integration

### Contract ABI Interface

```typescript
const EQUITY_TOKEN_ABI = [
  // View Functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function getDisplayBalance(address user) view returns (uint256)",
  "function hasUserMinted(address user) view returns (bool)",
  "function calculatePercentageAmount(address user, uint256 percentage) view returns (uint256)",
  
  // State-Changing Functions
  "function transfer(address to, uint256 amount) returns (bool)",
  "function mintInitialTokens() returns (bool)",
  "function transferPercent(address to, uint256 percentage) returns (bool)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];
```

### Key Contract Functions

#### 1. `mintInitialTokens()`
```typescript
/**
 * Mints 1,000,000 tokens to the caller
 * Can only be called once per address
 * 
 * @returns Transaction hash
 * @throws "Already minted" if user has minted before
 */
async function mintInitialTokens(signer: JsonRpcSigner): Promise<string>
```

**Usage Example:**
```typescript
const { signer } = await connectWallet();
const txHash = await mintInitialTokens(signer);
console.log("Minted! Tx:", txHash);
```

#### 2. `transferPercent()`
```typescript
/**
 * Transfers a percentage of sender's balance
 * 
 * @param signer - Connected wallet signer
 * @param toAddress - Recipient Ethereum address
 * @param percentage - Percentage to transfer (1-100)
 * @returns Transaction details
 */
async function transferPercent(
  signer: JsonRpcSigner,
  toAddress: string,
  percentage: number
): Promise<TransferResult>
```

**Usage Example:**
```typescript
const result = await transferPercent(
  signer,
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  10 // Transfer 10% of balance
);

console.log("Transferred:", result.amount, "tokens");
console.log("View on Etherscan:", `https://sepolia.etherscan.io/tx/${result.txHash}`);
```

#### 3. `getDisplayBalance()`
```typescript
/**
 * Gets human-readable token balance (without decimals)
 * 
 * @param signer - Connected wallet signer
 * @param address - Address to check
 * @returns Balance as whole number string
 */
async function getDisplayBalance(signer: JsonRpcSigner, address: string): Promise<string>
```

#### 4. `calculatePercentageAmount()`
```typescript
/**
 * Calculates token amount for a given percentage
 * 
 * @param signer - Connected wallet signer
 * @param address - Address to calculate for
 * @param percentage - Percentage (1-100)
 * @returns Token amount as string
 */
async function calculatePercentageAmount(
  signer: JsonRpcSigner,
  address: string,
  percentage: number
): Promise<string>
```

### Transaction Flow

```
User Action → Frontend Validation → Contract Call → MetaMask Popup
                                                           ↓
                                                    User Signs
                                                           ↓
                                           Transaction Broadcast to Sepolia
                                                           ↓
                                                    Miners Process
                                                           ↓
                                              Transaction Confirmed (12s avg)
                                                           ↓
                                              Receipt Returned to Frontend
                                                           ↓
                                                    UI Updates
                                                           ↓
                                              Success Notification + Etherscan Link
```

---

## 🛣️ API Routes

### GET `/api/equity/projects`

**Purpose**: Fetch all equity projects for authenticated user

**Authentication**: Clerk JWT required

**Response:**
```typescript
{
  projects: Array<{
    id: string;
    name: string;
    symbol: string;
    contractAddress: string;
    totalSupply: string;
    createdAt: string; // ISO 8601
  }>
}
```

**Example Response:**
```json
{
  "projects": [
    {
      "id": "proj_abc123",
      "name": "TechCo Equity",
      "symbol": "TECH",
      "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "totalSupply": "1000000",
      "createdAt": "2026-01-05T10:30:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `503 Service Unavailable`: Firestore not configured
- `500 Internal Server Error`: Database query failed

---

### POST `/api/equity/projects`

**Purpose**: Create new equity project

**Authentication**: Clerk JWT required

**Request Body:**
```typescript
{
  name: string;           // Required: Project name
  symbol: string;         // Required: Token symbol (max 5 chars)
  contractAddress: string;// Required: Deployed contract address
  totalSupply?: string;   // Optional: Default "0"
}
```

**Example Request:**
```json
{
  "name": "My Startup",
  "symbol": "MYCO",
  "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "totalSupply": "1000000"
}
```

**Response:**
```typescript
{
  project: EquityProject;
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields
- `401 Unauthorized`: User not authenticated
- `500 Internal Server Error`: Failed to create project

---

## 👤 User Flows

### Flow 1: First-Time User Creates Equity Project

```
1. User lands on /dashboard/equity
   └─> No wallet connected
   └─> Sees empty state with "Connect Wallet" button

2. User clicks "Connect Wallet"
   └─> MetaMask popup appears
   └─> User approves connection
   └─> Wallet address displayed in header

3. Check network
   └─> Not on Sepolia? Show warning
   └─> User clicks "Switch to Sepolia"
   └─> MetaMask switches network

4. User clicks "New Project"
   └─> Redirects to /dashboard/equity/new

5. Enter project details
   └─> Name: "TechStartup Inc."
   └─> Symbol: "TECH"

6. Click "Mint 1,000,000 Equity Tokens"
   └─> Frontend checks if already minted
   └─> Calls contract.mintInitialTokens()
   └─> MetaMask popup for transaction approval

7. User approves transaction
   └─> Shows "Minting..." spinner
   └─> Waits for blockchain confirmation (10-15 seconds)

8. Transaction confirmed
   └─> Green success message
   └─> Etherscan link displayed
   └─> Auto-redirect to dashboard after 3 seconds

9. Back on dashboard
   └─> Project card appears
   └─> Shows 1,000,000 token balance
```

### Flow 2: Transfer Equity to Team Member

```
1. User clicks on project card
   └─> Opens /dashboard/equity/[id]

2. View current stats
   └─> Balance: 1,000,000 tokens
   └─> Ownership: 100%
   └─> Total Supply: 1,000,000

3. Scroll to "Transfer Equity" section

4. Enter transfer details
   └─> Recipient: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
   └─> Percentage: 10
   └─> Preview: "≈ 100,000 tokens"

5. Click "Transfer Equity"
   └─> Calls contract.transferPercent()
   └─> MetaMask popup

6. Approve transaction
   └─> "Transferring..." spinner
   └─> Wait for confirmation

7. Success
   └─> Green notification
   └─> Balance updates to 900,000
   └─> Ownership updates to 90%
   └─> Form resets
```

### Flow 3: Existing User Views Projects

```
1. User navigates to /dashboard/equity
   └─> Already has wallet connected

2. Frontend fetches projects
   └─> GET /api/equity/projects
   └─> Shows loading spinner

3. Projects load
   └─> Displays project cards
   └─> Each card shows:
       - Project name & symbol
       - Contract address (truncated)
       - Total supply
       - Link to project detail

4. Click any project
   └─> Opens detail page
   └─> Fetches on-chain balance
   └─> Ready to transfer
```

---

## 💼 Wallet Integration

### MetaMask Connection

#### WalletProvider Context

The `WalletProvider` manages global wallet state throughout the app:

```typescript
interface WalletContextType {
  address: string | null;           // Connected wallet address
  signer: JsonRpcSigner | null;     // Ethers.js signer for transactions
  isConnecting: boolean;             // Connection in progress
  isConnected: boolean;              // Wallet connected
  chainId: number | null;            // Current network chain ID
  error: string | null;              // Connection errors
  connect: () => Promise<void>;      // Connect wallet function
  disconnect: () => void;            // Disconnect wallet
  switchToSepolia: () => Promise<void>; // Switch to Sepolia network
}
```

#### Usage in Components

```typescript
import { useWallet } from "@/components/providers/wallet-provider";

function MyComponent() {
  const { address, isConnected, connect } = useWallet();
  
  if (!isConnected) {
    return <button onClick={connect}>Connect Wallet</button>;
  }
  
  return <p>Connected: {address}</p>;
}
```

### Network Management

#### Sepolia Testnet Configuration

```typescript
const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_CONFIG = {
  chainId: "0xaa36a7",
  chainName: "Sepolia Testnet",
  nativeCurrency: {
    name: "SepoliaETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};
```

#### Auto-Switch Network

```typescript
async function switchToSepolia() {
  try {
    // Try to switch to existing Sepolia network
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }],
    });
  } catch (error) {
    // If Sepolia not added, add it
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [SEPOLIA_CONFIG],
      });
    }
  }
}
```

### Transaction Signing

All blockchain transactions require user approval via MetaMask:

```typescript
// Example: Mint tokens
const contract = getContract(signer);
const tx = await contract.mintInitialTokens();
// ↑ MetaMask popup appears here for user to approve

const receipt = await tx.wait();
// ↑ Waits for blockchain confirmation

console.log("Success! Hash:", receipt.hash);
```

---

## 🔒 Security & Best Practices

### Smart Contract Security

#### Reentrancy Protection
The contract should implement reentrancy guards for state-changing functions:

```solidity
bool private locked;

modifier noReentrancy() {
    require(!locked, "No reentrancy");
    locked = true;
    _;
    locked = false;
}

function transferPercent(address to, uint256 percentage) public noReentrancy {
    // Safe transfer logic
}
```

#### Input Validation

Frontend validation before contract calls:

```typescript
function validateTransfer(address: string, percentage: number): string | null {
  // Check valid Ethereum address
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return "Invalid Ethereum address";
  }
  
  // Check percentage range
  if (percentage < 1 || percentage > 100) {
    return "Percentage must be between 1 and 100";
  }
  
  // Check not sending to self
  if (address.toLowerCase() === currentAddress.toLowerCase()) {
    return "Cannot transfer to yourself";
  }
  
  return null; // Valid
}
```

### Frontend Security

#### Environment Variables

Never expose private keys or sensitive data:

```bash
# .env.local (NEVER commit this)
NEXT_PUBLIC_EQUITY_CONTRACT_ADDRESS=0x...  # Public contract address (OK)

# Private keys should NEVER be in code or env files
# Use MetaMask for signing
```

#### API Authentication

All API routes protected with Clerk:

```typescript
export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Proceed with authenticated request
}
```

#### Data Validation

Sanitize and validate all user inputs:

```typescript
function sanitizeProjectName(name: string): string {
  return name
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .slice(0, 100); // Limit length
}
```

### Best Practices

#### 1. Testnet First
- Always test on Sepolia before mainnet
- Request testnet ETH from faucets
- Verify all functionality works

#### 2. Gas Optimization
- Batch transfers when possible
- Use percentage-based transfers (saves gas vs. wei calculations)
- Monitor gas prices before transactions

#### 3. Error Handling
```typescript
try {
  const result = await transferPercent(signer, address, percentage);
  showSuccess(result);
} catch (error) {
  if (error.code === 4001) {
    showError("Transaction rejected by user");
  } else if (error.code === -32603) {
    showError("Insufficient gas or balance");
  } else {
    showError("Transaction failed: " + error.message);
  }
}
```

#### 4. Transaction Confirmations
- Wait for at least 1 confirmation
- Show pending state during confirmation
- Provide Etherscan links for verification

---

## ⚙️ Setup & Configuration

### Prerequisites

1. **Node.js**: Version 18.x or higher
2. **MetaMask**: Browser extension installed
3. **Sepolia ETH**: Testnet ETH for gas fees
4. **Firebase**: Firestore database configured
5. **Clerk**: Authentication set up

### Environment Variables

Create `.env.local` in project root:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Firebase Admin
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=project-id

# Equity Contract (deployed on Sepolia)
NEXT_PUBLIC_EQUITY_CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

### Installation Steps

#### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

#### 2. Configure Firebase

Create Firestore database and add security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /equity_projects/{projectId} {
      // Users can only read/write their own projects
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid != null;
    }
  }
}
```

#### 3. Deploy Smart Contract (Optional)

If you need to deploy your own contract:

```solidity
// EquityToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EquityToken {
    // Implementation details...
    // Deploy to Sepolia via Remix, Hardhat, or Foundry
}
```

Deploy steps:
1. Open [Remix IDE](https://remix.ethereum.org/)
2. Create `EquityToken.sol` with your contract code
3. Compile with Solidity 0.8.x
4. Deploy to Sepolia network via MetaMask
5. Copy deployed contract address
6. Add to `.env.local`

#### 4. Get Sepolia Testnet ETH

Visit Sepolia faucets:
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
- [QuickNode Faucet](https://faucet.quicknode.com/ethereum/sepolia)

Request test ETH (usually 0.5-1.0 ETH per request)

#### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000/dashboard/equity`

### Firestore Indexes

Create composite indexes for efficient queries:

```bash
# Create index for equity projects
Collection: equity_projects
Fields:
  - userId (Ascending)
  - createdAt (Descending)
```

---

## 📚 Usage Examples

### Example 1: Create Equity Project for Startup

**Scenario**: TechCo wants to distribute equity to 4 co-founders

```typescript
// Step 1: Founder 1 creates project and mints tokens
1. Connect wallet: 0xFounder1...
2. Create project:
   - Name: "TechCo Inc."
   - Symbol: "TECH"
3. Mint initial tokens → 1,000,000 TECH tokens

// Step 2: Distribute to co-founders (25% each)
Transfer 25% to 0xFounder2... → 250,000 tokens
Transfer 25% to 0xFounder3... → 250,000 tokens
Transfer 25% to 0xFounder4... → 250,000 tokens

// Final distribution:
Founder 1: 250,000 tokens (25%)
Founder 2: 250,000 tokens (25%)
Founder 3: 250,000 tokens (25%)
Founder 4: 250,000 tokens (25%)
```

### Example 2: Investor Allocation

**Scenario**: Allocate 20% to seed investor

```typescript
// Initial state
Founder: 1,000,000 tokens (100%)

// Transfer to investor
Transfer 20% to 0xInvestor... → 200,000 tokens

// Final state
Founder: 800,000 tokens (80%)
Investor: 200,000 tokens (20%)
```

### Example 3: Employee Stock Options

**Scenario**: Grant equity to 5 early employees

```typescript
// Each employee gets 2% (total 10%)
Transfer 2% to 0xEmployee1... → 20,000 tokens
Transfer 2% to 0xEmployee2... → ~19,600 tokens (2% of remaining)
// Note: Percentage is calculated from sender's current balance

// Alternative: Transfer exact amounts
// Use contract.transfer() instead of transferPercent()
```

### Example 4: Code Integration

#### Fetch User's Projects

```typescript
async function loadUserProjects() {
  const response = await fetch("/api/equity/projects");
  const data = await response.json();
  
  console.log("User has", data.projects.length, "projects");
  data.projects.forEach(project => {
    console.log(`${project.name} (${project.symbol})`);
  });
}
```

#### Check Token Balance

```typescript
import { connectWallet, getDisplayBalance } from "@/lib/agents/equity/contract";

async function checkBalance(address: string) {
  const { signer } = await connectWallet();
  const balance = await getDisplayBalance(signer, address);
  console.log(`Balance: ${balance} tokens`);
}
```

#### Transfer Tokens

```typescript
import { transferPercent } from "@/lib/agents/equity/contract";

async function grantEquity(recipient: string, percentage: number) {
  try {
    const { signer } = await connectWallet();
    const result = await transferPercent(signer, recipient, percentage);
    
    console.log("Transfer successful!");
    console.log("Amount:", result.amount, "tokens");
    console.log("From:", result.from);
    console.log("To:", result.to);
    console.log("View:", `https://sepolia.etherscan.io/tx/${result.txHash}`);
  } catch (error) {
    console.error("Transfer failed:", error);
  }
}

// Usage
grantEquity("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", 10);
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. MetaMask Not Detected

**Problem**: "Please install MetaMask" error

**Solutions**:
- Install MetaMask browser extension
- Refresh page after installation
- Check if using supported browser (Chrome, Firefox, Brave)
- Disable other wallet extensions that may conflict

---

#### 2. Transaction Fails

**Problem**: Transaction reverts or fails

**Possible Causes**:
```typescript
// Insufficient gas
Error: "Transaction underpriced"
Solution: Increase gas limit or wait for lower gas prices

// Already minted
Error: "Already minted"
Solution: Each address can only mint once

// Invalid percentage
Error: "Percentage must be between 1-100"
Solution: Check percentage value

// Insufficient balance
Error: "Transfer amount exceeds balance"
Solution: Verify you have enough tokens
```

---

#### 3. Wrong Network

**Problem**: "Please switch to Sepolia" warning

**Solution**:
```typescript
// Option 1: Click "Switch to Sepolia" button in UI

// Option 2: Manual MetaMask network switch
1. Open MetaMask
2. Click network dropdown
3. Select "Sepolia Test Network"
4. Refresh page

// Option 3: Add Sepolia manually if not showing
MetaMask → Settings → Networks → Add Network
- Network Name: Sepolia
- RPC URL: https://ethereum-sepolia-rpc.publicnode.com
- Chain ID: 11155111
- Currency Symbol: ETH
- Block Explorer: https://sepolia.etherscan.io
```

---

#### 4. Balance Not Updating

**Problem**: Balance shows 0 or doesn't update after transfer

**Solutions**:
- Wait for blockchain confirmation (10-15 seconds)
- Refresh the page
- Check transaction on Etherscan
- Verify you're on the correct network
- Clear browser cache

---

#### 5. Project Not Saving

**Problem**: Created project doesn't appear in dashboard

**Debug Steps**:
```typescript
// Check browser console for errors
// Common issues:

// Firestore permissions
Error: "Missing or insufficient permissions"
Solution: Check Firestore security rules allow user writes

// Missing authentication
Error: "Unauthorized"
Solution: Ensure logged in via Clerk

// Database not initialized
Error: "Database not configured"
Solution: Verify Firebase environment variables
```

---

#### 6. Gas Estimation Failed

**Problem**: "Cannot estimate gas" error

**Causes & Solutions**:
```typescript
// 1. No Sepolia ETH
Solution: Get testnet ETH from faucet

// 2. Contract function will revert
Solution: Check if:
  - Already minted tokens (can only mint once)
  - Invalid recipient address
  - Percentage out of range

// 3. Network congestion
Solution: Try again in a few minutes
```

---

### Debug Mode

Enable detailed logging:

```typescript
// Add to contract.ts
const DEBUG = process.env.NODE_ENV === 'development';

export async function transferPercent(...) {
  if (DEBUG) {
    console.log("Transfer params:", { toAddress, percentage });
    console.log("Signer address:", await signer.getAddress());
  }
  
  try {
    const result = await contract.transferPercent(...);
    if (DEBUG) console.log("Transfer result:", result);
    return result;
  } catch (error) {
    if (DEBUG) console.error("Transfer error:", error);
    throw error;
  }
}
```

---

### Getting Help

#### Check Logs

1. **Browser Console**: Check for JavaScript errors
2. **Network Tab**: Verify API calls succeed
3. **Etherscan**: Check transaction status

#### Verify Setup

```bash
# Check environment variables loaded
echo $NEXT_PUBLIC_EQUITY_CONTRACT_ADDRESS

# Check dependencies installed
npm list ethers

# Check TypeScript compilation
npm run build
```

#### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 4001 | User rejected | User declined transaction |
| 4902 | Network not added | Add Sepolia to MetaMask |
| -32603 | Internal error | Check gas/balance |
| -32000 | Insufficient funds | Get more Sepolia ETH |

---

## 🚀 Future Enhancements

### Planned Features

#### 1. Vesting Schedules
```typescript
interface VestingSchedule {
  recipient: string;
  totalAmount: number;
  startDate: Date;
  cliffMonths: number;      // e.g., 12 months cliff
  vestingMonths: number;    // e.g., 48 months total
  released: number;         // Amount already released
}

// Monthly vesting release
function releaseVestedTokens(scheduleId: string): Promise<void>
```

#### 2. Batch Transfers
```typescript
interface BatchTransfer {
  recipient: string;
  percentage: number;
}

async function batchTransfer(transfers: BatchTransfer[]): Promise<void> {
  // Transfer to multiple recipients in one transaction
  // Gas efficient bulk distribution
}
```

#### 3. Cap Table Visualization
- **Pie Chart**: Visual ownership distribution
- **Stakeholder List**: All token holders with percentages
- **Historical View**: Ownership changes over time
- **Export**: CSV/PDF cap table reports

#### 4. Multi-Token Support
- Manage multiple token types (e.g., common, preferred)
- Different voting rights per token class
- Convertible securities tracking

#### 5. Governance Features
- **Token Voting**: On-chain voting for decisions
- **Proposals**: Create and vote on company proposals
- **Delegation**: Delegate voting power to others

#### 6. Advanced Security
- **Multi-Sig Transfers**: Require multiple approvals for large transfers
- **Time Locks**: Delay period before transfers execute
- **Transfer Restrictions**: Whitelist/blacklist addresses

#### 7. Mainnet Deployment
- **Production Ready**: Deploy to Ethereum mainnet
- **Gas Optimization**: Minimize transaction costs
- **Audit**: Professional smart contract audit

#### 8. Mobile App
- **React Native**: iOS/Android app
- **WalletConnect**: Mobile wallet integration
- **Push Notifications**: Transfer alerts

#### 9. Tax Reporting
- **Form Generation**: Generate tax documents
- **Cost Basis Tracking**: Track acquisition prices
- **Gain/Loss Calculations**: Automated tax calculations

#### 10. Integration APIs
- **Webhooks**: Real-time transfer notifications
- **REST API**: Programmatic project management
- **CSV Import**: Bulk upload stakeholder lists

---

### Roadmap

```
Q1 2026
├─ ✅ Basic token creation
├─ ✅ Percentage-based transfers
├─ ✅ Wallet integration
└─ ✅ Dashboard UI

Q2 2026
├─ ⏳ Vesting schedules
├─ ⏳ Batch transfers
├─ ⏳ Cap table visualization
└─ ⏳ Enhanced error handling

Q3 2026
├─ 📋 Multi-token support
├─ 📋 Governance features
├─ 📋 Mobile app
└─ 📋 Professional audit

Q4 2026
├─ 📋 Mainnet deployment
├─ 📋 Tax reporting
├─ 📋 API integrations
└─ 📋 Advanced security features
```

---

## 📖 Additional Resources

### Learning Materials

- **Ethereum Basics**: [ethereum.org/learn](https://ethereum.org/en/learn/)
- **Ethers.js Docs**: [docs.ethers.org](https://docs.ethers.org/)
- **Solidity Tutorial**: [docs.soliditylang.org](https://docs.soliditylang.org/)
- **MetaMask Guide**: [metamask.io/support](https://metamask.io/support/)

### Tools & Services

- **Remix IDE**: [remix.ethereum.org](https://remix.ethereum.org/)
- **Sepolia Faucet**: [sepoliafaucet.com](https://sepoliafaucet.com/)
- **Etherscan**: [sepolia.etherscan.io](https://sepolia.etherscan.io/)
- **Gas Tracker**: [etherscan.io/gastracker](https://etherscan.io/gastracker)

### Community

- **Discord**: [Join our Discord](#) (Coming soon)
- **GitHub**: [github.com/yourrepo/ghosthunter](#)
- **Documentation**: [docs.yoursite.com](#)
- **Support**: support@yoursite.com

---

## 📄 License

This project is part of the GhostHunter platform. All rights reserved.

---

## 🙋 Support

For questions or issues:

1. Check this documentation
2. Review [Troubleshooting](#troubleshooting) section
3. Search existing GitHub issues
4. Open a new issue with details:
   - Error message
   - Browser console logs
   - Transaction hash (if applicable)
   - Steps to reproduce

---

**Last Updated**: January 5, 2026  
**Version**: 1.0.0  
**Maintainer**: GhostHunter Team
