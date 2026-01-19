# 💰 Equity Distribution - Blockchain Token Management

> Transparent, on-chain equity management for startups using ERC-20 tokens.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [User Flow](#user-flow)
- [Smart Contract](#smart-contract)
- [Features](#features)
- [API Reference](#api-reference)
- [Security](#security)

---

## Overview

Equity Distribution enables startups to manage cap tables using blockchain technology. It leverages ERC-20 tokens on Ethereum Sepolia testnet for transparent, immutable ownership records.

### Key Features

| Feature | Description |
|---------|-------------|
| **ERC-20 Tokens** | Standard token implementation |
| **Percentage Transfers** | Simple percentage-based distribution |
| **MetaMask Integration** | Seamless wallet connection |
| **Real-Time Tracking** | Live balance updates |
| **Cap Table** | On-chain ownership records |
| **Transaction History** | Complete audit trail |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     EQUITY DISTRIBUTION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────────┐    ┌───────────────┐  │
│  │   MetaMask   │───▶│  Web3 Provider   │───▶│   Smart       │  │
│  │   Wallet     │    │  (ethers.js)     │    │   Contract    │  │
│  └──────────────┘    └──────────────────┘    └───────────────┘  │
│                                                      │          │
│                                                      ▼          │
│  ┌──────────────┐    ┌──────────────────┐    ┌───────────────┐  │
│  │   Firestore  │◀───│  Project Data    │    │   Ethereum    │  │
│  │   Database   │    │                  │    │   Sepolia     │  │
│  └──────────────┘    └──────────────────┘    └───────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Flow

### 1. Create Equity Project

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Connect   │────▶│  Create     │────▶│  Deploy Token   │────▶│   Manage     │
│   Wallet    │     │  Project    │     │  Contract       │     │   Equity     │
└─────────────┘     └─────────────┘     └─────────────────┘     └──────────────┘
```

### 2. Transfer Equity

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│   Enter     │────▶│  Sign       │────▶│   Transaction   │
│   Amount    │     │  Transaction│     │   Confirmed     │
└─────────────┘     └─────────────┘     └─────────────────┘
```

---

## Smart Contract

### EquityToken.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EquityToken is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
```

### Key Functions

| Function | Description |
|----------|-------------|
| `transfer()` | Transfer tokens to address |
| `balanceOf()` | Get address balance |
| `totalSupply()` | Get total token supply |
| `mint()` | Mint new tokens (owner only) |

---

## Features

### Portfolio View

- Total tokens owned
- Ownership percentage
- USD value estimation
- Performance chart

### Transaction History

- All transfers logged
- From/To addresses
- Token amounts
- Timestamps
- Transaction hashes

### Team Management

- Add team members
- Assign equity percentages
- View cap table
- Track vesting (future)

---

## API Reference

```
GET    /api/equity/projects              # List user's projects
POST   /api/equity/projects              # Create new project
GET    /api/equity/projects/:id          # Get project details
POST   /api/equity/mint                  # Mint tokens
POST   /api/equity/transfer              # Transfer tokens
GET    /api/equity/transactions          # Transaction history
```

---

## Security

### Best Practices

1. **Private Keys**: Never stored in database
2. **MetaMask**: All transactions require user signature
3. **Testnet**: Currently deployed on Sepolia (testnet)
4. **Smart Contract**: Audited OpenZeppelin base

### Network Configuration

```javascript
const sepoliaConfig = {
  chainId: '0xaa36a7', // 11155111
  chainName: 'Sepolia Test Network',
  rpcUrls: ['https://sepolia.infura.io/v3/YOUR_KEY'],
  nativeCurrency: {
    name: 'SepoliaETH',
    symbol: 'ETH',
    decimals: 18
  }
};
```

---

## Database Schema

### Equity Projects Collection

```typescript
interface EquityProject {
  id: string;
  userId: string;
  name: string;
  tokenName: string;
  tokenSymbol: string;
  contractAddress?: string;
  totalSupply: number;
  network: 'sepolia' | 'mainnet';
  createdAt: Timestamp;
}
```

### Transactions Collection

```typescript
interface EquityTransaction {
  id: string;
  projectId: string;
  type: 'mint' | 'transfer';
  from: string;
  to: string;
  amount: number;
  txHash: string;
  timestamp: Timestamp;
}
```

---

## Related Documentation

- [Main README](../README.md)
- [Hardhat Configuration](../hardhat.config.js)
- [Smart Contract](../contracts/EquityToken.sol)
