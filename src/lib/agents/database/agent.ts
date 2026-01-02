/**
 * ============================================================================
 * DATABASE AGENT ENGINE
 * ============================================================================
 * Unified AI agent for generating and explaining database queries.
 * Supports PostgreSQL, Supabase, and MongoDB with Gemini 2.0 Flash.
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { 
  getUniversalSchema, 
  detectDatabaseType, 
  type DetectedDatabaseType,
  type UniversalSchema 
} from "./universal-schema";

// Types
export interface HistoryItem {
  role: "user" | "assistant";
  content: string;
  query?: string;
  timestamp?: Date;
}

export interface AgentResponse {
  type: "query" | "clarification" | "error" | "blocked";
  content: string;
  query?: string;
  explanation?: string;
  warnings?: string[];
  assumptions?: string[];
}

// Dangerous operations to block
const BLOCKED_PATTERNS = {
  sql: [
    /\bDROP\s+(TABLE|DATABASE|SCHEMA|INDEX|VIEW)/i,
    /\bDELETE\s+FROM/i,
    /\bTRUNCATE\s+TABLE/i,
    /\bALTER\s+TABLE.*DROP/i,
  ],
  mongodb: [
    /\.drop\s*\(/i,
    /\.remove\s*\(/i,
    /\.deleteMany\s*\(\s*\{\s*\}\s*\)/i, // Empty filter deleteMany
    /dropDatabase/i,
    /dropCollection/i,
  ],
};

/**
 * Get configured Gemini model
 */
function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash-exp",
    apiKey,
    temperature: 0.1,
    maxOutputTokens: 2048,
  });
}

/**
 * Get system prompt based on database type
 */
function getSystemPrompt(type: DetectedDatabaseType, schema: string): string {
  const baseRules = `
CRITICAL RULES:
1. Generate ONLY read-only queries by default (SELECT, find, aggregate)
2. NEVER generate DROP, DELETE, TRUNCATE, or remove() operations
3. Always explain what the query does in plain language
4. List any assumptions you made about the data
5. Warn about performance implications for large datasets
6. If the user's request is unclear, ask for clarification

RESPONSE FORMAT (strict JSON):
{
  "type": "query" | "clarification",
  "content": "your explanation or clarification question",
  "query": "the generated query (null if clarification needed)",
  "explanation": "what this query does",
  "warnings": ["list of warnings"],
  "assumptions": ["list of assumptions made"]
}`;

  if (type === "mongodb") {
    return `You are QueryMind, an expert MongoDB assistant. You help users query their MongoDB database using natural language.

CURRENT SCHEMA:
${schema || "No schema available - ask user about their collections"}

MONGODB QUERY FORMAT:
Generate queries as valid JSON objects with this structure:
{
  "collection": "collectionName",
  "operation": "find" | "aggregate" | "count" | "distinct",
  "filter": {...}, // for find/count
  "pipeline": [...], // for aggregate
  "field": "fieldName" // for distinct
}

${baseRules}`;
  }

  // PostgreSQL/Supabase prompt
  const dbName = type === "supabase" ? "Supabase (PostgreSQL)" : "PostgreSQL";
  
  return `You are QueryMind, an expert ${dbName} assistant. You help users query their database using natural language.

CURRENT SCHEMA:
${schema || "No schema available - ask user about their tables"}

SQL SYNTAX RULES:
- Use proper PostgreSQL syntax
- Quote identifiers with double quotes if they contain special characters
- Use parameterized queries format ($1, $2) for any user-provided values
- Always include appropriate LIMIT clauses for large result sets

${baseRules}`;
}

/**
 * Validate generated query for safety
 */
function validateQuery(query: string, type: DetectedDatabaseType): {
  isSafe: boolean;
  reason?: string;
} {
  const patterns = type === "mongodb" ? BLOCKED_PATTERNS.mongodb : BLOCKED_PATTERNS.sql;
  
  for (const pattern of patterns) {
    if (pattern.test(query)) {
      return {
        isSafe: false,
        reason: `Query contains potentially destructive operation. Pattern matched: ${pattern.source}`,
      };
    }
  }
  
  return { isSafe: true };
}

/**
 * Parse LLM response to structured format
 */
function parseAgentResponse(responseText: string): AgentResponse {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const jsonStr = jsonMatch ? jsonMatch[1] : responseText;
  
  try {
    const parsed = JSON.parse(jsonStr.trim());
    
    // Ensure query is always a string (MongoDB queries might be objects)
    let queryString: string | undefined;
    if (parsed.query !== undefined && parsed.query !== null) {
      queryString = typeof parsed.query === "string" 
        ? parsed.query 
        : JSON.stringify(parsed.query, null, 2);
    }
    
    return {
      type: parsed.type || "query",
      content: parsed.content || parsed.explanation || "",
      query: queryString,
      explanation: parsed.explanation,
      warnings: parsed.warnings || [],
      assumptions: parsed.assumptions || [],
    };
  } catch {
    // If JSON parsing fails, try to extract useful info
    return {
      type: "clarification",
      content: responseText,
      warnings: ["Response was not in expected JSON format"],
    };
  }
}

/**
 * Generate a query response from natural language
 */
export async function generateQueryResponse(
  question: string,
  connectionString: string,
  history: HistoryItem[] = []
): Promise<AgentResponse> {
  try {
    // Get database type and schema
    const type = detectDatabaseType(connectionString);
    let schema: UniversalSchema;
    
    try {
      schema = await getUniversalSchema(connectionString);
    } catch (schemaError) {
      // Continue without schema if it fails
      schema = {
        type,
        schema: "",
        tables: [],
        updatedAt: new Date().toISOString(),
      };
    }
    
    const model = getModel();
    
    // Build conversation messages
    const messages: (SystemMessage | HumanMessage | AIMessage)[] = [
      new SystemMessage(getSystemPrompt(type, schema.schema)),
    ];
    
    // Add recent conversation history (last 5 messages) - filter out empty content
    const recentHistory = history.slice(-5).filter(msg => msg.content && msg.content.trim().length > 0);
    for (const msg of recentHistory) {
      if (msg.role === "user") {
        messages.push(new HumanMessage(msg.content));
      } else {
        messages.push(new AIMessage(msg.content));
      }
    }
    
    // Add current question
    if (!question || question.trim().length === 0) {
      return {
        type: "error",
        content: "Please enter a question",
      };
    }
    messages.push(new HumanMessage(question));
    
    // Generate response
    const response = await model.invoke(messages);
    const responseText = typeof response.content === "string" 
      ? response.content 
      : JSON.stringify(response.content);
    
    // Parse response
    const agentResponse = parseAgentResponse(responseText);
    
    // Validate query safety if a query was generated
    if (agentResponse.query) {
      const validation = validateQuery(agentResponse.query, type);
      
      if (!validation.isSafe) {
        return {
          type: "blocked",
          content: "I cannot execute this query because it contains potentially destructive operations.",
          warnings: [validation.reason || "Query blocked for safety"],
        };
      }
    }
    
    return agentResponse;
  } catch (error) {
    console.error("Agent error:", error);
    return {
      type: "error",
      content: error instanceof Error ? error.message : "Failed to process your request",
    };
  }
}

/**
 * Get database type from connection string (utility export)
 */
export { detectDatabaseType };
