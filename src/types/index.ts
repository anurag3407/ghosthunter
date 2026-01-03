/**
 * ============================================================================
 * GHOSTFOUNDER - CORE TYPE DEFINITIONS
 * ============================================================================
 * Central type definitions for the entire application.
 * All types are organized by domain for easy maintenance.
 */

import { Timestamp } from "firebase/firestore";

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  plan: UserPlan;
  githubConnected: boolean;
  githubUsername?: string;
  githubAccessToken?: string;
  walletAddress?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  settings: UserSettings;
}

export type UserPlan = "free" | "pro" | "enterprise";

export interface UserSettings {
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
  defaultAgent?: AgentType;
}

// ============================================================================
// AGENT TYPES
// ============================================================================

export type AgentType = "code-police" | "pitch-deck" | "equity" | "database";

export interface AgentConfig {
  id: AgentType;
  name: string;
  description: string;
  icon: string;
  color: string;
  href: string;
  isEnabled: boolean;
}

export const AGENTS: AgentConfig[] = [
  {
    id: "code-police",
    name: "Code Police",
    description:
      "AI-powered code review that analyzes your commits and sends detailed reports",
    icon: "Shield",
    color: "red",
    href: "/dashboard/code-police",
    isEnabled: true,
  },
  {
    id: "pitch-deck",
    name: "Pitch Deck Generator",
    description:
      "Generate professional pitch decks from your README and project features",
    icon: "Presentation",
    color: "blue",
    href: "/dashboard/pitch-deck",
    isEnabled: true,
  },
  {
    id: "equity",
    name: "Equity Distribution",
    description: "Manage and distribute equity tokens on the blockchain",
    icon: "Coins",
    color: "purple",
    href: "/dashboard/equity",
    isEnabled: true,
  },
  {
    id: "database",
    name: "Database Agent",
    description: "Chat with your database using natural language queries",
    icon: "Database",
    color: "green",
    href: "/dashboard/database",
    isEnabled: true,
  },
];

// ============================================================================
// CODE POLICE TYPES
// ============================================================================

/**
 * Project status for Vercel-style controls:
 * - active: Analyzing every push
 * - paused: Webhooks received but ignored
 * - stopped: Webhook removed, no analysis
 */
export type ProjectStatus = 'active' | 'paused' | 'stopped';

export interface Project {
  id: string;
  userId: string;
  name: string;
  githubRepoId?: number;
  githubOwner?: string;
  githubRepoName?: string;
  githubFullName?: string;
  defaultBranch: string;
  language?: string;
  webhookId?: number;
  webhookSecret: string;
  /** @deprecated Use status instead */
  isActive?: boolean;
  /** Vercel-style project status */
  status: ProjectStatus;
  /** User-defined custom rules for AI analysis (e.g., "No console.logs") */
  customRules: string[];
  /** Project owner email for notifications */
  ownerEmail: string;
  rulesProfile: RulesProfile;
  notificationPrefs: NotificationPrefs;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface RulesProfile {
  strictness: "relaxed" | "moderate" | "strict";
  categories: {
    security: boolean;
    performance: boolean;
    readability: boolean;
    bugs: boolean;
    tests: boolean;
    style: boolean;
  };
  ignorePatterns: string[];
  severityThreshold: IssueSeverity;
}

export interface NotificationPrefs {
  emailOnPush: boolean;
  emailOnPR: boolean;
  minSeverity: IssueSeverity;
  additionalEmails: string[];
}

export type IssueSeverity = "critical" | "high" | "medium" | "low" | "info";
export type IssueCategory =
  | "security"
  | "performance"
  | "readability"
  | "bug"
  | "test"
  | "style";

export interface AnalysisRun {
  id: string;
  userId: string;
  projectId: string;
  commitSha: string;
  branch: string;
  triggerType: "push" | "pull_request";
  prNumber?: number;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  status: "pending" | "running" | "completed" | "failed";
  summary?: string;
  issueCounts: Record<IssueSeverity, number>;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  emailStatus?: "pending" | "sent" | "failed";
  error?: string;
}

export interface CodeIssue {
  id: string;
  analysisRunId: string;
  projectId: string;
  filePath: string;
  line: number;
  endLine?: number;
  severity: IssueSeverity;
  category: IssueCategory;
  message: string;
  explanation: string;
  suggestedFix?: string;
  ruleId?: string;
  codeSnippet?: string;
  isMuted: boolean;
}

// ============================================================================
// PITCH DECK TYPES
// ============================================================================

export type SlideType =
  | "title"
  | "problem"
  | "solution"
  | "features"
  | "market"
  | "business-model"
  | "traction"
  | "team"
  | "cta";

export interface Slide {
  id: string;
  type: SlideType;
  title: string;
  subtitle?: string;
  bullets?: string[];
  content?: string;
  order: number;
}

export interface DeckTheme {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

export interface PitchDeck {
  id: string;
  userId: string;
  projectName: string;
  tagline?: string;
  repoUrl?: string;
  repoName?: string;
  slides: Slide[];
  theme: DeckTheme;
  status: "draft" | "completed";
  generatedAt?: Timestamp;
  lastEditedAt: Timestamp;
  createdAt: Timestamp;
}

// ============================================================================
// EQUITY DISTRIBUTION TYPES
// ============================================================================

export interface EquityProject {
  id: string;
  userId: string;
  name: string;
  description?: string;
  githubRepoId?: number;
  githubFullName?: string;
  totalTokens: string;
  symbol: string;
  contractAddress?: string;
  isDeployed: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TokenHolder {
  id: string;
  projectId: string;
  walletAddress: string;
  name?: string;
  email?: string;
  balance: string;
  percentage: number;
  addedAt: Timestamp;
}

export interface TokenTransfer {
  id: string;
  projectId: string;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  percentage: number;
  timestamp: Timestamp;
  status: "pending" | "confirmed" | "failed";
}

// ============================================================================
// DATABASE AGENT TYPES
// ============================================================================

export type DatabaseType = "postgresql" | "mysql" | "mongodb";

export interface DatabaseConnection {
  id: string;
  userId: string;
  name: string;
  type: DatabaseType;
  host: string;
  port: number;
  database: string;
  encryptedCredentials: string;
  schemaCache?: DatabaseSchema;
  schemaCacheUpdatedAt?: Timestamp;
  createdAt: Timestamp;
  lastUsedAt: Timestamp;
}

export interface DatabaseCredentials {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  authSource?: string; // MongoDB
}

export interface DatabaseSchema {
  tables: TableSchema[];
  updatedAt: string;
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
  primaryKey?: string[];
  foreignKeys?: ForeignKeySchema[];
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
}

export interface ForeignKeySchema {
  column: string;
  referencedTable: string;
  referencedColumn: string;
}

// Chat message for database agent
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  query?: string;
  results?: unknown[];
  timestamp: Date;
}

// ============================================================================
// GITHUB TYPES
// ============================================================================

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  html_url: string;
  language?: string;
  default_branch: string;
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
  };
  updated_at: string;
  stargazers_count: number;
  forks_count: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
