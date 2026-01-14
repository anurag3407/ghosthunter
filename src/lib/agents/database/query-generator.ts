/**
 * ============================================================================
 * DATABASE AGENT - AI QUERY GENERATOR
 * ============================================================================
 * LangChain integration with Gemini for natural language to SQL/NoSQL.
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import type { DatabaseType, DatabaseSchema, ChatMessage } from "@/types";

interface QueryGenerationResult {
  query: string | null;
  explanation: string;
  assumptions: string[];
  warnings: string[];
  isBlocked: boolean;
  blockReason?: string;
}

/**
 * Get configured Gemini model
 */
function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey,
    temperature: 0.1, // Low temperature for consistent query generation
    maxOutputTokens: 2048,
  });
}

/**
 * Get system prompt based on database type
 */
function getSystemPrompt(databaseType: DatabaseType, schema: DatabaseSchema): string {
  const schemaInfo = schema.tables
    .map((table) => {
      const columns = table.columns
        .map((col) => `  - ${col.name} (${col.type}${col.nullable ? ", nullable" : ""})`)
        .join("\n");
      return `Table: ${table.name}\n${columns}`;
    })
    .join("\n\n");

  const syntaxGuide = {
    postgresql: "PostgreSQL syntax with proper quoting for identifiers",
    mysql: "MySQL syntax with backticks for identifiers",
    mongodb: "MongoDB aggregation pipeline or find query as JSON",
  };

  return `You are QueryMind, an expert database assistant. You help users query their ${databaseType} database using natural language.

CURRENT SCHEMA:
${schemaInfo || "No schema available"}

RULES:
1. Generate safe, read-only queries by default
2. Use ${syntaxGuide[databaseType]}
3. Always explain what the query does
4. List any assumptions you made
5. Warn about potential issues (performance, data volume)
6. NEVER generate DELETE, DROP, TRUNCATE, or UPDATE queries unless explicitly asked
7. For destructive operations, add clear warnings

RESPONSE FORMAT (JSON):
{
  "query": "the generated query or null if not possible",
  "explanation": "what this query does",
  "assumptions": ["list of assumptions made"],
  "warnings": ["any warnings or considerations"]
}`;
}

/**
 * Generate a database query from natural language
 */
export async function generateQuery(
  userMessage: string,
  databaseType: DatabaseType,
  schema: DatabaseSchema,
  conversationHistory: ChatMessage[] = []
): Promise<QueryGenerationResult> {
  const model = getGeminiModel();

  // Build conversation messages
  const messages: (SystemMessage | HumanMessage | AIMessage)[] = [
    new SystemMessage(getSystemPrompt(databaseType, schema)),
  ];

  // Add conversation history (last 10 messages for context)
  const recentHistory = conversationHistory.slice(-10);
  for (const msg of recentHistory) {
    if (msg.role === "user") {
      messages.push(new HumanMessage(msg.content));
    } else {
      messages.push(new AIMessage(msg.content));
    }
  }

  // Add current user message
  messages.push(new HumanMessage(userMessage));

  try {
    const response = await model.invoke(messages);
    const responseText =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    // Parse the response
    const result = parseQueryResponse(responseText);

    // Validate the generated query
    if (result.query) {
      const validation = validateQuery(result.query, databaseType);

      if (!validation.isSafe) {
        return {
          query: null,
          explanation: result.explanation,
          assumptions: result.assumptions,
          warnings: [...result.warnings, ...validation.errors],
          isBlocked: true,
          blockReason: validation.errors.join(" "),
        };
      }

      result.warnings = [...result.warnings, ...validation.warnings];
    }

    return {
      ...result,
      isBlocked: false,
    };
  } catch (error) {
    console.error("Query generation error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate query"
    );
  }
}

/**
 * Parse the LLM response into structured format
 */
function parseQueryResponse(
  response: string
): Omit<QueryGenerationResult, "isBlocked" | "blockReason"> {
  // Try to extract JSON from the response
  const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      return {
        query: parsed.query || null,
        explanation: parsed.explanation || "Query generated successfully.",
        assumptions: parsed.assumptions || [],
        warnings: parsed.warnings || [],
      };
    } catch {
      // JSON parsing failed
    }
  }

  // Fallback: try to parse as pure JSON
  try {
    const parsed = JSON.parse(response);
    return {
      query: parsed.query || null,
      explanation: parsed.explanation || "Query generated successfully.",
      assumptions: parsed.assumptions || [],
      warnings: parsed.warnings || [],
    };
  } catch {
    // Not valid JSON
  }

  // Last resort: try to find SQL-like content
  const sqlMatch = response.match(/SELECT[\s\S]+?(?:;|$)/i);
  if (sqlMatch) {
    return {
      query: sqlMatch[0].trim(),
      explanation: "Query extracted from response.",
      assumptions: [],
      warnings: ["Response was not in expected format."],
    };
  }

  return {
    query: null,
    explanation: response,
    assumptions: [],
    warnings: ["Could not generate a valid query."],
  };
}

/**
 * Validate a generated query for safety
 */
function validateQuery(
  query: string,
  databaseType: DatabaseType
): { isSafe: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const upperQuery = query.toUpperCase();

  // Check for destructive operations
  const destructiveKeywords = ["DELETE", "DROP", "TRUNCATE", "UPDATE", "INSERT"];
  for (const keyword of destructiveKeywords) {
    if (upperQuery.includes(keyword)) {
      warnings.push(`Query contains ${keyword} operation. Please confirm before executing.`);
    }
  }

  // Check for SQL injection patterns
  const injectionPatterns = [
    /;\s*DROP/i,
    /;\s*DELETE/i,
    /;\s*TRUNCATE/i,
    /--.*$/m,
    /\/\*.*\*\//,
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(query)) {
      errors.push("Query contains potentially dangerous patterns.");
      break;
    }
  }

  // Database-specific validations
  if (databaseType === "mongodb") {
    try {
      JSON.parse(query);
    } catch {
      if (!query.startsWith("{")) {
        errors.push("MongoDB query must be valid JSON.");
      }
    }
  }

  return {
    isSafe: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Generate a conversational response for non-query requests
 */
export async function generateConversationalResponse(
  userMessage: string,
  databaseType: DatabaseType,
  schema: DatabaseSchema
): Promise<string> {
  const model = getGeminiModel();

  const systemPrompt = `You are QueryMind, a helpful database assistant. You're having a conversation with a user about their ${databaseType} database.

Current schema tables: ${schema.tables?.map((t) => t.name).join(", ") || "No tables available"}

Be helpful, concise, and friendly. Guide them to ask questions that you can convert into queries.`;

  const messages = [
    new SystemMessage(systemPrompt),
    new HumanMessage(userMessage),
  ];

  const response = await model.invoke(messages);
  return typeof response.content === "string"
    ? response.content
    : JSON.stringify(response.content);
}
