# GhostFounder AI Models Documentation

## Overview

GhostFounder uses **Google Gemini AI models** across all features. The application leverages LangChain for structured interactions with the AI models.

| Feature | Model | Purpose |
|---------|-------|---------|
| Code Police | gemini-2.5-flash-lite | Code analysis, fix generation |
| Pitch Deck | gemini-2.5-flash-lite | Slide content generation |
| Database Agent | gemini-2.5-flash-lite / gemini-2.0-flash | Natural language to SQL |

---

## 1. Code Police Agent

AI-powered code review that analyzes code for security, performance, and quality issues.

### 1.1 Code Analyzer

**File:** `src/lib/agents/code-police/analyzer.ts`

**Model:** `gemini-2.5-flash-lite`

**Purpose:** Analyze code files and identify issues

**Functions:**
- `analyzeCode()` - Analyzes code for security, performance, bugs, and best practice issues
- `generateAnalysisSummary()` - Creates human-readable summary of findings for email reports

**Prompt Strategy:**
- Acts as senior code reviewer with expertise in security, performance, and code quality
- Returns structured JSON with severity, category, message, line numbers, and fix suggestions
- Supports custom user-defined rules as high-priority constraints

**Output Schema:**
```typescript
{
  issues: [{
    severity: "critical" | "high" | "medium" | "low" | "info",
    category: "security" | "performance" | "bugs" | "codeSmells" | "bestPractices",
    message: string,
    line: number,
    explanation: string,
    suggestedFix?: string
  }]
}
```

---

### 1.2 Fix Generator

**File:** `src/lib/agents/code-police/fix-generator.ts`

**Model:** `gemini-2.5-flash-lite`

**Purpose:** Generate code fixes for identified issues

**Functions:**
- `generateFixes()` - Generates fixes for issues with retry logic
- `applyFix()` - Applies fixes using line-number-based replacement
- `createFallbackFixes()` - Creates fallback fixes when AI fails

**Prompt Strategy:**
- Uses exact line numbers for precise fix targeting
- Provides confidence levels (high/medium/low) for each fix
- Handles retries when fixes don't match original code

**Output Schema:**
```typescript
{
  fixes: [{
    issueId: string,
    filePath: string,
    startLine: number,
    endLine: number,
    originalCode: string,
    fixedCode: string,
    explanation: string,
    confidence: "high" | "medium" | "low",
    canAutoApply: boolean
  }]
}
```

---

### 1.3 Analytics AI

**File:** `src/lib/agents/code-police/analytics-ai.ts`

**Model:** `gemini-2.0-flash-lite`

**Purpose:** Generate executive summaries and actionable insights from repository analytics

**Functions:**
- Generates prioritized action items based on code health metrics
- Creates founder-focused executive summaries

---

## 2. Pitch Deck Generator

AI-powered pitch deck creation from GitHub repositories.

### 2.1 Deck Generator

**File:** `src/lib/agents/pitch-deck/generator.ts`

**Model:** `gemini-2.5-flash-lite`

**Purpose:** Generate pitch deck slides from README content

**Functions:**
- `generatePitchDeck()` - Creates complete pitch deck structure with slides

**Slide Types Generated:**
- Title, Problem, Solution, Features, Market, Business Model, Traction, Team, CTA

**Prompt Strategy:**
- Acts as expert pitch deck creator
- Analyzes README for project info, target market, unique value proposition
- Generates compelling investor-ready content

**Output Schema:**
```typescript
{
  projectName: string,
  tagline: string,
  slides: [{
    type: SlideType,
    title: string,
    subtitle?: string,
    bullets?: string[],
    content?: string
  }]
}
```

---

### 2.2 Advanced AI Generator

**File:** `src/lib/pitch-deck/ai-generator.ts`

**Model:** `gemini-2.5-flash-lite`

**Purpose:** Advanced slide content generation with multiple AI functions

**Functions:**
- Multiple slide content refinement functions
- Repository analysis for comprehensive deck generation

---

## 3. Database Agent

Natural language interface to database queries.

### 3.1 Query Generator

**File:** `src/lib/agents/database/query-generator.ts`

**Model:** `gemini-2.0-flash`

**Purpose:** Convert natural language questions to database queries

**Supported Databases:**
- PostgreSQL (SQL)
- MySQL (SQL)
- MongoDB (NoSQL)
- MariaDB (SQL)

---

### 3.2 Chat Agent

**File:** `src/lib/agents/database/agent.ts`

**Model:** `gemini-2.5-flash-lite`

**Purpose:** Full conversational database assistant with context

**Functions:**
- `generateQueryResponse()` - Generates queries from natural language with conversation history
- `generateQueryResponseCached()` - Uses cached schema for faster responses
- `validateQuery()` - Validates queries for safety (blocks DROP, DELETE, TRUNCATE)

**Safety Features:**
- Blocks dangerous operations (DROP TABLE, DELETE FROM, TRUNCATE)
- Validates queries before execution
- Provides warnings for potentially risky operations

**Response Types:**
```typescript
{
  type: "query" | "clarification" | "error" | "blocked",
  content: string,
  query?: string,
  explanation?: string,
  warnings?: string[],
  assumptions?: string[]
}
```

---

### 3.3 Streaming Chat

**File:** `src/app/api/database/chat/stream/route.ts`

**Model:** `gemini-2.5-flash-lite`

**Purpose:** Real-time streaming responses for database chat interface

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_API_KEY` | Yes | Primary Gemini API key |
| `GEMINI_API_KEY` | Optional | Alternative Gemini API key (fallback) |

---

## Model Selection Rationale

| Model | Use Case | Why |
|-------|----------|-----|
| `gemini-2.5-flash-lite` | Most features | Fast, cost-effective, sufficient quality |
| `gemini-2.0-flash` | Complex queries | Better reasoning for database queries |

---

## Token Usage Optimization

1. **Structured Output Parsers** - Using Zod schemas for guaranteed JSON output
2. **Chunking** - Large files split into smaller chunks for analysis
3. **Caching** - Database schema cached to avoid repeated introspection
4. **Fallbacks** - Local fallback logic when AI fails (e.g., fix generation)

---

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GhostFounder Application                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Code Police │  │ Pitch Deck  │  │  Database   │          │
│  │   Agent     │  │  Generator  │  │    Agent    │          │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
│         │                │                │                  │
│         └────────────────┼────────────────┘                  │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               LangChain (Orchestration)               │   │
│  │  - PromptTemplate     - StructuredOutputParser        │   │
│  │  - ChatGoogleGenerativeAI                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Google Gemini API                        │   │
│  │  - gemini-2.5-flash-lite                              │   │
│  │  - gemini-2.0-flash                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```
