import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import {
    addMessage,
    getConversationMessages,
    userOwnsConversation,
    updateConversationTitle,
} from "@/lib/agents/database/conversations";
import { getCachedOrFetchSchema, detectDatabaseType } from "@/lib/agents/database/universal-schema";
import type { HistoryItem } from "@/lib/agents/database/agent";
import { decrypt } from "@/lib/agents/database/encryption";
import { executeQuery, formatQueryResults } from "@/lib/agents/database/query-executor";

/**
 * ============================================================================
 * DATABASE AGENT - STREAMING CHAT ENDPOINT
 * ============================================================================
 * Streams AI responses in real-time for better perceived latency.
 * Uses Server-Sent Events (SSE) for streaming.
 */

/**
 * Get system prompt for the database type with sample data context
 */
function getSystemPrompt(type: string, schema: string, sampleDataContext?: string): string {
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

RESPONSE FORMAT (strict JSON):
{
  "type": "query" | "clarification",
  "content": "your explanation or clarification question",
  "query": "the generated query (null if clarification needed)",
  "explanation": "what this query does",
  "warnings": ["list of warnings"],
  "assumptions": ["list of assumptions made"]
}`;

    // Build the data context section with schema and samples
    const buildDataContext = (schemaStr: string, samples?: string) => {
        if (!schemaStr && !samples) {
            return `DATABASE INFO: Schema detection encountered an issue. Based on the user's question, infer the most likely collection/table name and generate a query. Include this assumption in your response.`;
        }

        let context = "";

        if (schemaStr && schemaStr.trim().length > 0) {
            context += `SCHEMA OVERVIEW:\n${schemaStr}\n\n`;
        }

        if (samples && samples.trim().length > 0) {
            context += `DATABASE CONTENT (Sample Data):\n${samples}`;
        }

        return context;
    };

    const dataContext = buildDataContext(schema, sampleDataContext);

    if (type === "mongodb") {
        return `You are QueryMind, an expert MongoDB assistant. You help users query their MongoDB database using natural language.

${dataContext}

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

    const dbName = type === "supabase" ? "Supabase (PostgreSQL)" : "PostgreSQL";

    return `You are QueryMind, an expert ${dbName} assistant. You help users query their database using natural language.

${dataContext}

SQL SYNTAX RULES:
- Use proper PostgreSQL syntax
- Quote identifiers with double quotes if they contain special characters
- Use parameterized queries format ($1, $2) for any user-provided values
- Always include appropriate LIMIT clauses for large result sets

${baseRules}`;
}

/**
 * Parse LLM response to extract query
 */
function parseAgentResponse(responseText: string): {
    type: string;
    query?: string;
    explanation?: string;
    warnings?: string[];
    assumptions?: string[];
} {
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : responseText;

    try {
        const parsed = JSON.parse(jsonStr.trim());
        let queryString: string | undefined;
        if (parsed.query !== undefined && parsed.query !== null) {
            queryString = typeof parsed.query === "string"
                ? parsed.query
                : JSON.stringify(parsed.query, null, 2);
        }

        return {
            type: parsed.type || "query",
            query: queryString,
            explanation: parsed.explanation || parsed.content,
            warnings: parsed.warnings || [],
            assumptions: parsed.assumptions || [],
        };
    } catch {
        return {
            type: "clarification",
            explanation: responseText,
            warnings: ["Response was not in expected JSON format"],
        };
    }
}

/**
 * POST /api/database/chat/stream
 * Stream a chat response in real-time
 */
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const body = await request.json();
        const { conversationId, connectionId, message } = body;

        if (!conversationId || !connectionId || !message) {
            return new Response(
                JSON.stringify({ error: "conversationId, connectionId, and message are required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Check ownership
        const isOwner = await userOwnsConversation(userId, conversationId);
        if (!isOwner) {
            return new Response(JSON.stringify({ error: "Not authorized" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            });
        }

        const adminDb = getAdminDb();
        if (!adminDb) {
            return new Response(JSON.stringify({ error: "Database not configured" }), {
                status: 503,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Get connection details
        const connectionDoc = await adminDb
            .collection("database_connections")
            .doc(connectionId)
            .get();

        if (!connectionDoc.exists) {
            return new Response(JSON.stringify({ error: "Connection not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        const connection = connectionDoc.data()!;

        if (connection.userId !== userId) {
            return new Response(JSON.stringify({ error: "Not authorized" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Add user message
        await addMessage(conversationId, "user", message);

        // Get previous messages for context
        const previousMessages = await getConversationMessages(conversationId);
        const history: HistoryItem[] = previousMessages.slice(-5).map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
        }));

        // Decrypt connection string
        let connectionString: string;
        if (connection.encryptedUri) {
            connectionString = decrypt(connection.encryptedUri);
        } else if (connection.encryptedCredentials) {
            const creds = JSON.parse(decrypt(connection.encryptedCredentials));
            if (connection.type === "mongodb") {
                connectionString = `mongodb://${creds.username}:${encodeURIComponent(creds.password)}@${creds.host}:${creds.port}/${creds.database}`;
            } else {
                connectionString = `postgresql://${creds.username}:${encodeURIComponent(creds.password)}@${creds.host}:${creds.port}/${creds.database}`;
            }
        } else {
            return new Response(JSON.stringify({ error: "Connection credentials not found" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Get cached schema with sample data
        const type = detectDatabaseType(connectionString);
        const schema = await getCachedOrFetchSchema(connectionId, connectionString);

        console.log(`[Stream] Schema loaded: ${schema.tables.length} tables/collections, sampleContext: ${schema.sampleDataContext?.length || 0} chars`);

        // Build messages for LLM with enhanced schema context
        const llmMessages: (SystemMessage | HumanMessage | AIMessage)[] = [
            new SystemMessage(getSystemPrompt(type, schema.schema, schema.sampleDataContext)),
        ];

        const recentHistory = history.filter((msg) => msg.content && msg.content.trim().length > 0);
        for (const msg of recentHistory) {
            if (msg.role === "user") {
                llmMessages.push(new HumanMessage(msg.content));
            } else {
                llmMessages.push(new AIMessage(msg.content));
            }
        }
        llmMessages.push(new HumanMessage(message));

        // Create streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const apiKey = process.env.GEMINI_API_KEY;
                    if (!apiKey) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "GEMINI_API_KEY not configured" })}\n\n`));
                        controller.close();
                        return;
                    }

                    const model = new ChatGoogleGenerativeAI({
                        model: "gemini-2.5-flash-lite",
                        apiKey,
                        temperature: 0.1,
                        maxOutputTokens: 2048,
                        streaming: true,
                    });

                    let fullResponse = "";

                    // Stream the response
                    const llmStream = await model.stream(llmMessages);

                    for await (const chunk of llmStream) {
                        const content = typeof chunk.content === "string" ? chunk.content : "";
                        if (content) {
                            fullResponse += content;
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "token", content })}\n\n`));
                        }
                    }

                    // Parse the complete response to extract query
                    const agentResponse = parseAgentResponse(fullResponse);

                    // If there's a query, execute it
                    if (agentResponse.query && agentResponse.type === "query") {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "executing" })}\n\n`));

                        try {
                            const result = await executeQuery(connectionString, agentResponse.query);
                            const formattedResults = formatQueryResults(result);

                            controller.enqueue(
                                encoder.encode(
                                    `data: ${JSON.stringify({
                                        type: "results",
                                        query: agentResponse.query,
                                        results: result.data,
                                        formatted: formattedResults,
                                        rowCount: result.rowCount,
                                        executionTime: result.executionTime,
                                    })}\n\n`
                                )
                            );
                        } catch (execError) {
                            controller.enqueue(
                                encoder.encode(
                                    `data: ${JSON.stringify({
                                        type: "error",
                                        error: execError instanceof Error ? execError.message : "Query execution failed",
                                    })}\n\n`
                                )
                            );
                        }
                    }

                    // Send completion event
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done", query: agentResponse.query })}\n\n`));

                    // Save assistant message (in background)
                    const queryInfo = agentResponse.query ? `\n\n**Generated Query:**\n\`\`\`sql\n${agentResponse.query}\n\`\`\`` : "";
                    const assistantMessage = (agentResponse.explanation || fullResponse) + queryInfo;
                    addMessage(conversationId, "assistant", assistantMessage, agentResponse.query || undefined).catch(console.error);

                    // Update conversation title if first message
                    if (previousMessages.length <= 1) {
                        const title = message.slice(0, 50) + (message.length > 50 ? "..." : "");
                        updateConversationTitle(conversationId, title).catch(console.error);
                    }

                    // Update connection last used
                    adminDb
                        .collection("database_connections")
                        .doc(connectionId)
                        .update({ lastUsedAt: new Date() })
                        .catch(console.error);

                    controller.close();
                } catch (error) {
                    console.error("Streaming error:", error);
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({
                                type: "error",
                                error: error instanceof Error ? error.message : "Streaming failed",
                            })}\n\n`
                        )
                    );
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    } catch (error) {
        console.error("Error in streaming chat:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Failed to process message" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
