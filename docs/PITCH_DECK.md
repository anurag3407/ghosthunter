# 📊 Pitch Deck Studio - AI-Powered Presentation Generator

> Transform your README into investor-ready pitch decks in minutes.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [User Flow](#user-flow)
- [Features](#features)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)

---

## Overview

Pitch Deck Studio uses AI to analyze your GitHub repository and generate professional investor presentations. It extracts key information from your README, codebase structure, and metadata to create compelling slide decks.

### Key Features

| Feature | Description |
|---------|-------------|
| **GitHub-to-Deck** | Generates decks from your README automatically |
| **Multiple Templates** | Pre-seed, Seed, Series A, Demo Day styles |
| **Visual Editor** | Drag-and-drop canvas with real-time preview |
| **AI Content** | Headlines, bullets, metrics extracted from project |
| **Export Options** | PDF and image export |
| **Gap Analysis** | Identifies missing content |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      PITCH DECK STUDIO                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────────┐    ┌───────────────┐  │
│  │   GitHub     │───▶│  Content         │───▶│   AI Slide    │  │
│  │   README     │    │  Extraction      │    │   Generator   │  │
│  └──────────────┘    └──────────────────┘    └───────────────┘  │
│                                                      │          │
│  ┌──────────────┐    ┌──────────────────┐           ▼          │
│  │   Firestore  │◀───│  Deck Storage    │◀──────────────────┐  │
│  │   Database   │    │                  │    ┌───────────────┐  │
│  └──────────────┘    └──────────────────┘    │   Slide       │  │
│                                              │   Canvas      │  │
│  ┌──────────────┐    ┌──────────────────┐    │   Editor      │  │
│  │   Gemini     │    │   Template       │    └───────────────┘  │
│  │   AI         │    │   Engine         │                       │
│  └──────────────┘    └──────────────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Flow

### 1. Create New Deck

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Select    │────▶│  Fetch      │────▶│  AI Generates   │────▶│   Edit in    │
│   Repo      │     │  README     │     │  Slides         │     │   Studio     │
└─────────────┘     └─────────────┘     └─────────────────┘     └──────────────┘
```

### 2. Edit & Export

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│   Edit      │────▶│  Preview    │────▶│   Export PDF    │
│   Slides    │     │  Deck       │     │   or Images     │
└─────────────┘     └─────────────┘     └─────────────────┘
```

---

## Features

### Slide Types

| Type | Description |
|------|-------------|
| Title | Company name, tagline, logo |
| Problem | Pain points your product solves |
| Solution | Your unique approach |
| Product | Screenshots, features |
| Market | TAM, SAM, SOM analysis |
| Business Model | Revenue streams |
| Traction | Metrics, growth |
| Team | Founders, key hires |
| Competition | Market landscape |
| Financials | Projections, runway |
| Ask | Funding ask, use of funds |

### Templates

- **Pre-Seed**: Focus on vision and team
- **Seed**: Traction and early metrics
- **Series A**: Growth and unit economics
- **Demo Day**: Fast-paced, impactful

---

## API Reference

```
GET    /api/pitch-deck/decks              # List user's decks
POST   /api/pitch-deck/generate           # Generate new deck
GET    /api/pitch-deck/decks/:id          # Get deck details
PUT    /api/pitch-deck/decks/:id          # Update deck
DELETE /api/pitch-deck/decks/:id          # Delete deck
```

---

## Database Schema

### Pitch Decks Collection

```typescript
interface PitchDeck {
  id: string;
  userId: string;
  name: string;
  template: 'pre-seed' | 'seed' | 'series-a' | 'demo-day';
  sourceType: 'github' | 'manual';
  sourceRepo?: string;
  slides: Slide[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Slide {
  id: string;
  type: SlideType;
  title: string;
  content: SlideContent;
  order: number;
  backgroundColor?: string;
  elements?: SlideElement[];
}
```

---

## Usage Limits

| Feature | Free Tier | Pro Tier |
|---------|-----------|----------|
| Pitch Decks/month | 2 | Unlimited |
| Templates | All | All |
| Export | PDF | PDF + PPTX |

---

## Related Documentation

- [Main README](../README.md)
- [Architecture Overview](../ARCHITECTURE.md)
