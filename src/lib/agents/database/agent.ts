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
  getCachedOrFetchSchema,
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
    model: "gemini-2.5-flash-lite",
    apiKey,
    temperature: 0.1,
    maxOutputTokens: 2048,
  });
}

/**
 * Get system prompt based on database type with sample data context
 */
function getSystemPrompt(type: DetectedDatabaseType, schema: string, sampleDataContext?: string): string {
  const baseRules = `
CRITICAL RULES:
1. Generate ONLY read-only queries by default (SELECT, find, aggregate)
2. NEVER generate DROP, DELETE, TRUNCATE, or remove() operations
3. Always explain what the query does in plain language
4. List any assumptions you made about the data
5. Warn about performance implications for large datasets
6. If the user's request is unclear, ask for clarification
7. NEVER ask the user what collection or table their data is in - use the schema and sample data provided
8. Use the SAMPLE DATA section to understand the actual data structure and values
9. For conversational questions (greetings, how are you, etc.), respond naturally without generating a query
10. Always try to be helpful - if you can answer based on the schema, do so
11. If the user asks about a collection/table that doesn't exist in the schema, tell them it doesn't exist and list what collections/tables ARE available
12. IMPORTANT: Always provide a non-empty content/explanation in your response
13. WHEN THE USER ASKS FOR DATA (e.g., "show me users", "list all X", "get the names of Y"), ALWAYS generate a query - don't just describe what you would do
14. If a collection/table exists in the schema, YOU MUST generate a query for it when asked

RESPONSE FORMAT (JSON):
For database queries:
{
  "type": "query",
  "content": "Brief explanation of what you're doing",
  "query": "the generated query",
  "explanation": "Detailed explanation of what this query does and what results to expect",
  "warnings": ["list of warnings if any"],
  "assumptions": ["list of assumptions made if any"]
}

For clarification needed:
{
  "type": "clarification",
  "content": "Your clarifying question or helpful response",
  "query": null
}

For conversational/general responses:
{
  "type": "response",
  "content": "Your helpful response about the database, schema, or general assistance",
  "query": null
}`;

  // Build the data context section with schema and samples
  const buildDataContext = (schemaStr: string, samples?: string) => {
    if (!schemaStr && !samples) {
      return `DATABASE INFO: Schema is being loaded. Based on common database patterns and the user's question, try to provide helpful guidance. If the user is asking about their data, suggest they wait a moment for schema detection or ask them to describe their database structure.`;
    }

    let context = "";

    if (schemaStr && schemaStr.trim().length > 0) {
      context += `AVAILABLE SCHEMA:\n${schemaStr}\n\n`;
    }

    if (samples && samples.trim().length > 0) {
      context += `SAMPLE DATA FROM DATABASE:\n${samples}`;
    }

    return context;
  };

  const dataContext = buildDataContext(schema, sampleDataContext);

  if (type === "mongodb") {
    return `You are QueryMind, a friendly and expert MongoDB assistant. You help users explore and query their MongoDB database using natural language.

Your personality: Be helpful, clear, and conversational. Explain things in simple terms.

${dataContext}

MONGODB QUERY FORMAT:
When generating queries, use this JSON structure:
{
  "collection": "collectionName",
  "operation": "find" | "aggregate" | "count" | "distinct",
  "filter": {...}, // for find/count
  "pipeline": [...], // for aggregate
  "field": "fieldName", // for distinct
  "options": { "limit": 100 } // optional
}

${baseRules}`;
  }

  // PostgreSQL/Supabase prompt
  const dbName = type === "supabase" ? "Supabase (PostgreSQL)" : "PostgreSQL";

  return `You are QueryMind, a friendly and expert ${dbName} assistant. You help users explore and query their database using natural language.

Your personality: Be helpful, clear, and conversational. Explain things in simple terms.

${dataContext}

SQL SYNTAX RULES:
- Use proper PostgreSQL syntax
- Quote identifiers with double quotes if they contain special characters
- Use parameterized queries format ($1, $2) for any user-provided values
- Always include appropriate LIMIT clauses for large result sets (default to LIMIT 100)

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
 * Parse LLM response to structured format with improved fallback handling
 */
function parseAgentResponse(responseText: string): AgentResponse {
  // Clean up the response text
  let cleanedText = responseText.trim();

  // Try to extract JSON from markdown code blocks
  const jsonMatch = cleanedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    cleanedText = jsonMatch[1].trim();
  }

  // Try multiple JSON extraction strategies
  const jsonStrategies = [
    () => cleanedText, // Direct parse
    () => cleanedText.replace(/^[^{]*/, '').replace(/[^}]*$/, ''), // Extract first JSON object
    () => {
      // Find JSON object boundaries
      const start = cleanedText.indexOf('{');
      const end = cleanedText.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        return cleanedText.substring(start, end + 1);
      }
      return null;
    },
  ];

  for (const strategy of jsonStrategies) {
    try {
      const jsonStr = strategy();
      if (!jsonStr) continue;

      const parsed = JSON.parse(jsonStr);

      // Ensure query is always a string (MongoDB queries might be objects)
      let queryString: string | undefined;
      if (parsed.query !== undefined && parsed.query !== null) {
        queryString = typeof parsed.query === "string"
          ? parsed.query
          : JSON.stringify(parsed.query, null, 2);
      }

      // Map 'response' type to 'clarification' for consistency
      let responseType = parsed.type === 'response' ? 'clarification' : (parsed.type || 'query');

      // If type is 'query' but no query was actually generated, treat as clarification
      if (responseType === 'query' && !queryString) {
        responseType = 'clarification';
      }

      // Ensure we have meaningful content
      const content = parsed.content || parsed.explanation || parsed.message || "";

      // If we have no content and no query, this is a failed response - try to use the raw text
      if (!content && !queryString) {
        console.log("[Agent] Parsed response has no content or query, falling back to raw text");
        continue; // Try next strategy
      }

      return {
        type: responseType as "query" | "clarification" | "error" | "blocked",
        content,
        query: queryString,
        explanation: parsed.explanation || parsed.content,
        warnings: parsed.warnings || [],
        assumptions: parsed.assumptions || [],
      };
    } catch {
      // Try next strategy
      continue;
    }
  }

  // Fallback: If all JSON parsing fails, create a helpful response from raw text
  // Check if the response looks like an error
  if (responseText.toLowerCase().includes('error') || responseText.toLowerCase().includes('sorry')) {
    return {
      type: "error",
      content: responseText,
      warnings: [],
    };
  }

  // Check if response contains SQL or MongoDB query patterns
  const sqlMatch = responseText.match(/```sql\s*([\s\S]*?)\s*```/);
  const mongoMatch = responseText.match(/```(?:json|javascript)?\s*(\{[\s\S]*?"collection"[\s\S]*?\})\s*```/);

  if (sqlMatch) {
    return {
      type: "query",
      content: responseText.replace(sqlMatch[0], '').trim() || "Here's the query for your request:",
      query: sqlMatch[1].trim(),
      explanation: responseText.replace(sqlMatch[0], '').trim(),
      warnings: [],
      assumptions: [],
    };
  }

  if (mongoMatch) {
    return {
      type: "query",
      content: responseText.replace(mongoMatch[0], '').trim() || "Here's the query for your request:",
      query: mongoMatch[1].trim(),
      explanation: responseText.replace(mongoMatch[0], '').trim(),
      warnings: [],
      assumptions: [],
    };
  }

  // Default: treat as a conversational response
  return {
    type: "clarification",
    content: responseText,
    warnings: [],
    assumptions: [],
  };
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
        sampleDataContext: "",
        updatedAt: new Date().toISOString(),
      };
    }

    const model = getModel();

    // Build conversation messages
    const messages: (SystemMessage | HumanMessage | AIMessage)[] = [
      new SystemMessage(getSystemPrompt(type, schema.schema, schema.sampleDataContext)),
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

/**
 * Generate a query response using CACHED schema for better performance.
 * Use this in production for faster responses.
 * 
 * @param question - The user's natural language question
 * @param connectionId - Firestore document ID for the connection (for caching)
 * @param connectionString - Database connection string
 * @param history - Conversation history for context
 */
export async function generateQueryResponseCached(
  question: string,
  connectionId: string,
  connectionString: string,
  history: HistoryItem[] = []
): Promise<AgentResponse> {
  try {
    // Get database type
    const type = detectDatabaseType(connectionString);
    let schema: UniversalSchema;

    try {
      // Use cached schema for faster response
      console.log(`[Agent] Fetching schema for connection ${connectionId}, type: ${type}`);
      schema = await getCachedOrFetchSchema(connectionId, connectionString);
      console.log(`[Agent] Schema fetched: ${schema.tables.length} tables/collections found`);
      console.log(`[Agent] Schema content (first 500 chars): ${schema.schema.substring(0, 500)}`);
    } catch (schemaError) {
      // Continue without schema if it fails
      console.error("[Agent] Schema fetch failed:", schemaError);
      schema = {
        type,
        schema: "",
        tables: [],
        sampleDataContext: "",
        updatedAt: new Date().toISOString(),
      };
    }

    // If schema is empty, add a warning to the response
    if (!schema.schema || schema.tables.length === 0) {
      console.warn("[Agent] WARNING: Schema is empty - agent will infer collection/table names from user query");
      console.warn("[Agent] This may indicate a connection issue, empty database, or schema fetch timeout");
    }

    const model = getModel();

    // Build conversation messages
    const messages: (SystemMessage | HumanMessage | AIMessage)[] = [
      new SystemMessage(getSystemPrompt(type, schema.schema, schema.sampleDataContext)),
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

    // Log raw AI response for debugging
    console.log(`[Agent] Raw AI response (first 1000 chars): ${responseText.substring(0, 1000)}`);

    // Parse response
    const agentResponse = parseAgentResponse(responseText);

    // Log parsed response for debugging
    console.log(`[Agent] Parsed response - type: ${agentResponse.type}, hasQuery: ${!!agentResponse.query}, contentLength: ${agentResponse.content?.length || 0}`);

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

